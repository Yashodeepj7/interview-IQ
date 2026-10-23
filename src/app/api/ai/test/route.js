import {
  generateAIResponseWithMetadata,
  isAIConfigured,
  isGeminiConfigured,
  isGroqConfigured,
  isFallbackForced,
  getLastAIExecutionDetails,
  getGeminiModel,
  getGroqModel,
} from "@/lib/gemini";

export async function POST(request) {
  // 1. Parse request body safely
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: "Validation failed: Invalid or malformed JSON in request body.",
      },
      { status: 400 }
    );
  }

  // 2. Validate message input: must be string, trimmed, between 3 and 1000 characters
  if (!body || typeof body.message !== "string") {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'message' is required and must be a string.",
      },
      { status: 400 }
    );
  }

  const trimmedMessage = body.message.trim();

  if (trimmedMessage.length < 3 || trimmedMessage.length > 1000) {
    return Response.json(
      {
        success: false,
        error: "Validation failed: 'message' must be between 3 and 1000 characters.",
        receivedLength: trimmedMessage.length,
      },
      { status: 400 }
    );
  }

  // 3. Verify server-side configuration before calling AI
  if (!isAIConfigured()) {
    return Response.json(
      {
        success: false,
        error: "No AI provider is configured. Please configure either GEMINI_API_KEY or GROQ_API_KEY in your .env.local file.",
        setupRequired: true,
        instructions:
          "Add GEMINI_API_KEY (or fallback GROQ_API_KEY) to your .env.local file and restart the development server.",
      },
      { status: 503 }
    );
  }

  // 4. Execute AI generation via server service with automatic Groq failover
  try {
    const result = await generateAIResponseWithMetadata(trimmedMessage);

    return Response.json({
      success: true,
      provider: result.provider,
      model: result.model,
      fallback: result.fallback,
      reason: result.reason || undefined,
      text: result.text,
      geminiConfigured: isGeminiConfigured(),
      groqConfigured: isGroqConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error?.code === "MISSING_API_KEY" || error?.code === "MISSING_GROQ_API_KEY") {
      return Response.json(
        {
          success: false,
          error: error.message,
          setupRequired: true,
          instructions:
            "Add your GEMINI_API_KEY or GROQ_API_KEY to .env.local and restart the development server.",
        },
        { status: 503 }
      );
    }

    // Rate-limiting / quota check across both providers
    const errorMessageLower = (error?.message || "").toLowerCase();
    const isRateLimited =
      error?.status === 429 ||
      errorMessageLower.includes("quota") ||
      errorMessageLower.includes("rate limit") ||
      errorMessageLower.includes("resource exhausted");

    if (isRateLimited) {
      return Response.json(
        {
          success: false,
          error: "AI rate limit or free quota exceeded on all providers. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    const safeErrorNotice = error?.message
      ? error.message.replace(/key=[^&\s]+/gi, "key=[REDACTED]")
      : "AI provider request encountered an unexpected issue.";

    return Response.json(
      {
        success: false,
        error: "AI provider request failed.",
        details: safeErrorNotice,
      },
      { status: error?.status && error.status >= 400 && error.status < 600 ? error.status : 502 }
    );
  }
}

export async function GET() {
  return Response.json({
    geminiConfigured: isGeminiConfigured(),
    geminiModel: getGeminiModel(),
    groqConfigured: isGroqConfigured(),
    groqModel: getGroqModel(),
    fallbackForced: isFallbackForced(),
    activeEngine: isFallbackForced()
      ? "groq (simulated fallback)"
      : isGeminiConfigured()
      ? "gemini (primary)"
      : isGroqConfigured()
      ? "groq (fallback)"
      : "none",
    lastExecution: getLastAIExecutionDetails(),
  });
}

