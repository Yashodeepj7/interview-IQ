import {
  generateAIResponse,
  isGeminiConfigured,
  getGeminiModel,
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

  // 3. Verify server-side configuration before calling Gemini
  if (!isGeminiConfigured()) {
    return Response.json(
      {
        success: false,
        error: "Gemini API key is not configured.",
        setupRequired: true,
        instructions:
          "Add your GEMINI_API_KEY to D:/Project/interview-iq/.env.local and restart the development server.",
      },
      { status: 503 }
    );
  }

  // 4. Execute AI generation via server service
  try {
    const text = await generateAIResponse(trimmedMessage);

    return Response.json({
      success: true,
      model: getGeminiModel(),
      text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Missing key error check
    if (error?.code === "MISSING_API_KEY") {
      return Response.json(
        {
          success: false,
          error: "Gemini API key is not configured.",
          setupRequired: true,
          instructions:
            "Add your GEMINI_API_KEY to D:/Project/interview-iq/.env.local and restart the development server.",
        },
        { status: 503 }
      );
    }

    // Rate-limiting / quota check
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
          error: "Gemini API rate limit or quota exceeded. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // Generic safe provider error without exposing stack traces or API keys
    const safeErrorNotice = error?.message
      ? error.message.replace(/key=[^&\s]+/gi, "key=[REDACTED]")
      : "Gemini provider request encountered an unexpected issue.";

    return Response.json(
      {
        success: false,
        error: "Gemini API request failed.",
        details: safeErrorNotice,
      },
      { status: 502 }
    );
  }
}
