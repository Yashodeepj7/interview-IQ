import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Track last execution telemetry for observability & testing
let lastExecutionDetails = {
  provider: "none",
  model: "none",
  fallbackUsed: false,
  timestamp: null,
  reason: null,
};

/**
 * Returns the configured Gemini model identifier.
 * Defaults to 'gemini-3.8-flash' if GEMINI_MODEL is not set.
 */
export function getGeminiModel() {
  const model = process.env.GEMINI_MODEL?.trim();
  return model || DEFAULT_GEMINI_MODEL;
}

/**
 * Returns the configured Groq model identifier.
 * Defaults to 'openai/gpt-oss-120b' if GROQ_MODEL is not set.
 */
export function getGroqModel() {
  const model = process.env.GROQ_MODEL?.trim();
  return model || DEFAULT_GROQ_MODEL;
}

/**
 * Checks whether the server environment has a configured GEMINI_API_KEY.
 */
export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Checks whether the server environment has a configured GROQ_API_KEY.
 */
export function isGroqConfigured() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Checks whether at least one AI provider (Gemini or Groq fallback) is configured.
 */
export function isAIConfigured() {
  return isGeminiConfigured() || isGroqConfigured();
}

/**
 * Checks whether testing simulator mode is forced via environment.
 */
export function isFallbackForced() {
  return process.env.FORCE_AI_FALLBACK === "true";
}

/**
 * Returns metadata about the most recent AI invocation.
 */
export function getLastAIExecutionDetails() {
  return { ...lastExecutionDetails };
}

/**
 * Creates and returns an instance of GoogleGenAI SDK client.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    const error = new Error(
      "GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your .env.local file."
    );
    error.code = "MISSING_API_KEY";
    throw error;
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Detects whether an error from an AI provider represents quota exhaustion, rate limiting, or service unavailability.
 */
function isQuotaOrExhaustionError(error) {
  if (!error) return false;
  const status = error.status;
  const code = (error.code || "").toString().toUpperCase();
  const msg = (error.message || "").toLowerCase();

  return (
    status === 429 ||
    status === 503 ||
    code === "RATE_LIMIT_EXCEEDED" ||
    code === "RESOURCE_EXHAUSTED" ||
    code === "QUOTA_EXCEEDED" ||
    code === "SERVICE_UNAVAILABLE" ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted") ||
    msg.includes("tokens") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("service unavailable") ||
    msg.includes("overloaded")
  );
}

/**
 * Calls Groq Cloud AI via its OpenAI-compatible completions endpoint.
 * Zero external dependencies — uses native Node.js fetch.
 */
async function callGroqAI({ prompt, isJson = false }) {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    const error = new Error(
      "GROQ_API_KEY is not configured. Please add GROQ_API_KEY to your .env.local file."
    );
    error.code = "MISSING_GROQ_API_KEY";
    throw error;
  }

  const model = getGroqModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s safety timeout

  try {
    const messages = [
      {
        role: "system",
        content: isJson
          ? "You are an expert AI assistant that responds strictly in valid JSON format. Always return valid, well-formed JSON conforming exactly to the user's requested schema. Do not enclose the output in markdown code blocks unless strictly required."
          : "You are an expert technical interviewer, system architect, and AI career coach.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const payload = {
      model,
      messages,
      temperature: 0.2,
    };

    if (isJson) {
      payload.response_format = { type: "json_object" };
    }

    const res = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const groqMsg = data?.error?.message || `Groq API responded with HTTP status ${res.status}`;
      const err = new Error(`Groq Fallback Error: ${groqMsg}`);
      err.status = res.status;
      err.code = "GROQ_API_ERROR";
      throw err;
    }

    const outputText = data?.choices?.[0]?.message?.content?.trim();

    if (!outputText) {
      const err = new Error("No output text received from Groq response.");
      err.code = "EMPTY_GROQ_RESPONSE";
      throw err;
    }

    return outputText;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      const err = new Error("Groq API request timed out after 45 seconds.");
      err.code = "TIMEOUT";
      throw err;
    }
    throw error;
  }
}

/**
 * Sanitizes upstream provider error messages to prevent leaking secrets.
 */
function sanitizeError(error) {
  if (
    error?.code === "MISSING_API_KEY" ||
    error?.code === "MISSING_GROQ_API_KEY" ||
    error?.code === "INVALID_MODEL_OUTPUT"
  ) {
    return error;
  }

  const rawMsg = error?.message || "";
  const lowerMsg = rawMsg.toLowerCase();

  const isHighDemandOrUnavailable =
    error?.status === 503 ||
    lowerMsg.includes("503") ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("service_unavailable") ||
    lowerMsg.includes("service unavailable");

  if (isHighDemandOrUnavailable) {
    const highDemandError = new Error(
      "AI provider is currently experiencing temporary high demand. Please try again in a moment."
    );
    highDemandError.code = "SERVICE_UNAVAILABLE";
    highDemandError.status = 503;
    return highDemandError;
  }

  const isRateLimited =
    error?.status === 429 ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("resource exhausted");

  if (isRateLimited) {
    const rateLimitError = new Error(
      "AI rate limit or free quota exceeded on all configured providers. Please wait a moment or check your API keys."
    );
    rateLimitError.code = "RATE_LIMIT_EXCEEDED";
    rateLimitError.status = 429;
    return rateLimitError;
  }

  const safeMessage = rawMsg
    ? rawMsg.replace(/key=[^&\s]+/gi, "key=[REDACTED]").replace(/Bearer\s+[^&\s]+/gi, "Bearer [REDACTED]")
    : "AI provider request failed.";

  const sanitized = new Error(safeMessage);
  sanitized.code = error?.code || error?.status || "PROVIDER_ERROR";
  sanitized.status = error?.status;
  return sanitized;
}

/**
 * Safely parses JSON from raw model text output, stripping codeblocks or commentary if present.
 */
function parseJSONFromText(text) {
  if (!text || typeof text !== "string") {
    const err = new Error("Empty model response cannot be parsed as JSON.");
    err.code = "INVALID_MODEL_OUTPUT";
    throw err;
  }

  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        // Fall through
      }
    }
    const parseError = new Error(`Failed to parse structured JSON from model response: ${err.message}`);
    parseError.code = "INVALID_MODEL_OUTPUT";
    throw parseError;
  }
}

/**
 * Internal call to Google Gemini text interactions API.
 */
async function callGeminiText(prompt) {
  const model = getGeminiModel();
  const ai = getGeminiClient();

  const response = await ai.interactions.create({
    model,
    input: prompt,
  });

  const outputText = response?.output_text?.trim();
  if (!outputText) {
    throw new Error("No output text received from Gemini model response.");
  }
  return outputText;
}

/**
 * Internal call to Google Gemini structured JSON interactions API.
 */
async function callGeminiJSON(prompt) {
  const model = getGeminiModel();
  const ai = getGeminiClient();

  try {
    const response = await ai.interactions.create({
      model,
      input: prompt,
      response_mime_type: "application/json",
    });

    const outputText = response?.output_text?.trim();
    if (!outputText) {
      const err = new Error("No output text received from model response.");
      err.code = "EMPTY_MODEL_RESPONSE";
      throw err;
    }

    return parseJSONFromText(outputText);
  } catch (error) {
    if (
      error?.message &&
      (error.message.includes("response_mime_type") ||
        error.message.includes("unsupported") ||
        error.message.includes("400"))
    ) {
      const fallbackResponse = await ai.interactions.create({
        model,
        input: `${prompt}\n\nIMPORTANT: Return ONLY a valid, raw JSON object. Do not include markdown codeblocks or any commentary.`,
      });
      const outputText = fallbackResponse?.output_text?.trim();
      return parseJSONFromText(outputText);
    }
    throw error;
  }
}

/**
 * Executes text generation with automatic failover to Groq when Gemini tokens/quota are exhausted.
 *
 * @param {string} prompt - The text prompt
 * @returns {Promise<{ text: string, provider: "gemini"|"groq", model: string, fallback: boolean, reason?: string }>}
 */
export async function generateAIResponseWithMetadata(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string.");
  }

  const trimmedPrompt = prompt.trim();
  const forceFallback = isFallbackForced();

  // Test Simulator Mode: Force Groq fallback immediately
  if (forceFallback) {
    if (!isGroqConfigured()) {
      const err = new Error("FORCE_AI_FALLBACK is 'true', but GROQ_API_KEY is missing in your .env.local file.");
      err.code = "MISSING_GROQ_API_KEY";
      throw err;
    }
    console.log(`[AI Engine] 🧪 Simulator Mode: FORCE_AI_FALLBACK=true. Calling Groq (${getGroqModel()})...`);
    const text = await callGroqAI({ prompt: trimmedPrompt, isJson: false });
    lastExecutionDetails = {
      provider: "groq",
      model: getGroqModel(),
      fallbackUsed: true,
      timestamp: new Date().toISOString(),
      reason: "FORCE_AI_FALLBACK enabled in environment",
    };
    return {
      text,
      provider: "groq",
      model: getGroqModel(),
      fallback: true,
      reason: "FORCE_AI_FALLBACK enabled",
    };
  }

  // 1. Try Gemini first if key is configured
  if (isGeminiConfigured()) {
    try {
      const text = await callGeminiText(trimmedPrompt);
      lastExecutionDetails = {
        provider: "gemini",
        model: getGeminiModel(),
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
        reason: null,
      };
      return {
        text,
        provider: "gemini",
        model: getGeminiModel(),
        fallback: false,
      };
    } catch (geminiError) {
      const shouldFallback = isQuotaOrExhaustionError(geminiError);

      if (shouldFallback && isGroqConfigured()) {
        console.warn(
          `[AI Fallback] ⚠️ Gemini tokens/quota exhausted or service unavailable (${geminiError.message}). Failing over to Groq (${getGroqModel()})...`
        );
        try {
          const text = await callGroqAI({ prompt: trimmedPrompt, isJson: false });
          lastExecutionDetails = {
            provider: "groq",
            model: getGroqModel(),
            fallbackUsed: true,
            timestamp: new Date().toISOString(),
            reason: `Gemini quota exhausted: ${geminiError.message}`,
          };
          return {
            text,
            provider: "groq",
            model: getGroqModel(),
            fallback: true,
            reason: "Gemini quota or token limit exhausted; seamlessly failed over to Groq.",
          };
        } catch (groqError) {
          console.error("[AI Fallback] ❌ Both Gemini and Groq fallback failed.", groqError);
          throw sanitizeError(groqError);
        }
      }

      throw sanitizeError(geminiError);
    }
  }

  // 2. If Gemini key is not configured, but Groq IS configured, use Groq directly
  if (isGroqConfigured()) {
    console.log(`[AI Engine] ℹ️ GEMINI_API_KEY is not configured. Using Groq (${getGroqModel()})...`);
    const text = await callGroqAI({ prompt: trimmedPrompt, isJson: false });
    lastExecutionDetails = {
      provider: "groq",
      model: getGroqModel(),
      fallbackUsed: true,
      timestamp: new Date().toISOString(),
      reason: "Gemini API key not configured",
    };
    return {
      text,
      provider: "groq",
      model: getGroqModel(),
      fallback: true,
      reason: "Gemini not configured; active provider is Groq.",
    };
  }

  // 3. Neither configured
  const error = new Error(
    "No AI provider is configured. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env.local file."
  );
  error.code = "MISSING_API_KEY";
  throw error;
}

/**
 * Standard text generation helper (maintains backward compatibility with Step 2 & 3).
 *
 * @param {string} prompt - The text prompt
 * @returns {Promise<string>} The generated output text
 */
export async function generateAIResponse(prompt) {
  const result = await generateAIResponseWithMetadata(prompt);
  return result.text;
}

/**
 * Executes structured JSON generation with automatic failover to Groq when Gemini tokens/quota are exhausted.
 *
 * @param {string} prompt - The prompt instructing the model to produce valid JSON
 * @returns {Promise<{ data: any, provider: "gemini"|"groq", model: string, fallback: boolean, reason?: string }>}
 */
export async function generateJSONResponseWithMetadata(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string.");
  }

  const trimmedPrompt = prompt.trim();
  const forceFallback = isFallbackForced();

  // Test Simulator Mode: Force Groq fallback immediately
  if (forceFallback) {
    if (!isGroqConfigured()) {
      const err = new Error("FORCE_AI_FALLBACK is 'true', but GROQ_API_KEY is missing in your .env.local file.");
      err.code = "MISSING_GROQ_API_KEY";
      throw err;
    }
    console.log(`[AI Engine] 🧪 Simulator Mode: FORCE_AI_FALLBACK=true. Generating JSON with Groq (${getGroqModel()})...`);
    const rawOutput = await callGroqAI({ prompt: trimmedPrompt, isJson: true });
    const data = parseJSONFromText(rawOutput);
    lastExecutionDetails = {
      provider: "groq",
      model: getGroqModel(),
      fallbackUsed: true,
      timestamp: new Date().toISOString(),
      reason: "FORCE_AI_FALLBACK enabled in environment",
    };
    return {
      data,
      provider: "groq",
      model: getGroqModel(),
      fallback: true,
      reason: "FORCE_AI_FALLBACK enabled",
    };
  }

  // 1. Try Gemini first if key is configured
  if (isGeminiConfigured()) {
    try {
      const data = await callGeminiJSON(trimmedPrompt);
      lastExecutionDetails = {
        provider: "gemini",
        model: getGeminiModel(),
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
        reason: null,
      };
      return {
        data,
        provider: "gemini",
        model: getGeminiModel(),
        fallback: false,
      };
    } catch (geminiError) {
      const shouldFallback = isQuotaOrExhaustionError(geminiError);

      if (shouldFallback && isGroqConfigured()) {
        console.warn(
          `[AI Fallback] ⚠️ Gemini tokens/quota exhausted or service unavailable (${geminiError.message}). Failing over to Groq JSON (${getGroqModel()})...`
        );
        try {
          const rawOutput = await callGroqAI({ prompt: trimmedPrompt, isJson: true });
          const data = parseJSONFromText(rawOutput);
          lastExecutionDetails = {
            provider: "groq",
            model: getGroqModel(),
            fallbackUsed: true,
            timestamp: new Date().toISOString(),
            reason: `Gemini quota exhausted: ${geminiError.message}`,
          };
          return {
            data,
            provider: "groq",
            model: getGroqModel(),
            fallback: true,
            reason: "Gemini quota or token limit exhausted; seamlessly failed over to Groq.",
          };
        } catch (groqError) {
          console.error("[AI Fallback] ❌ Both Gemini and Groq fallback failed.", groqError);
          throw sanitizeError(groqError);
        }
      }

      throw sanitizeError(geminiError);
    }
  }

  // 2. If Gemini key is not configured, but Groq IS configured, use Groq directly
  if (isGroqConfigured()) {
    console.log(`[AI Engine] ℹ️ GEMINI_API_KEY is not configured. Generating JSON with Groq (${getGroqModel()})...`);
    const rawOutput = await callGroqAI({ prompt: trimmedPrompt, isJson: true });
    const data = parseJSONFromText(rawOutput);
    lastExecutionDetails = {
      provider: "groq",
      model: getGroqModel(),
      fallbackUsed: true,
      timestamp: new Date().toISOString(),
      reason: "Gemini API key not configured",
    };
    return {
      data,
      provider: "groq",
      model: getGroqModel(),
      fallback: true,
      reason: "Gemini not configured; active provider is Groq.",
    };
  }

  // 3. Neither configured
  const error = new Error(
    "No AI provider is configured. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env.local file."
  );
  error.code = "MISSING_API_KEY";
  throw error;
}

/**
 * Standard structured JSON generation helper (maintains backward compatibility with Step 3, 4, 5, 6).
 *
 * @param {string} prompt - The prompt instructing the model to produce valid JSON
 * @returns {Promise<any>} The parsed JSON object
 */
export async function generateJSONResponse(prompt) {
  const result = await generateJSONResponseWithMetadata(prompt);
  return result.data;
}
