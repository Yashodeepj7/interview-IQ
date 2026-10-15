import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = "gemini-3.8-flash";

/**
 * Returns the configured Gemini model identifier.
 * Defaults to 'gemini-3.8-flash' if GEMINI_MODEL is not set.
 */
export function getGeminiModel() {
  const model = process.env.GEMINI_MODEL?.trim();
  return model || DEFAULT_MODEL;
}

/**
 * Checks whether the server environment has a configured GEMINI_API_KEY.
 * Never returns or logs the key itself.
 */
export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Boolean(apiKey && apiKey.length > 0);
}

/**
 * Creates and returns an instance of GoogleGenAI SDK client.
 * Throws a typed error if the API key is missing.
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
 * Sanitizes upstream provider error messages to prevent leaking secrets, credentials, or internal query parameters.
 */
function sanitizeError(error) {
  if (error?.code === "MISSING_API_KEY" || error?.code === "INVALID_MODEL_OUTPUT") {
    return error;
  }

  const rawMsg = error?.message || "";
  const lowerMsg = rawMsg.toLowerCase();

  // Handle transient provider high-demand, 503, or undici request clone retry errors
  const isHighDemandOrUnavailable =
    error?.status === 503 ||
    lowerMsg.includes("503") ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("service_unavailable") ||
    lowerMsg.includes("service unavailable") ||
    lowerMsg.includes("typeerror: unusable");

  if (isHighDemandOrUnavailable) {
    const highDemandError = new Error(
      "Gemini AI provider is currently experiencing temporary high demand. Please try again in a moment."
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
      "Gemini API rate limit or quota exceeded. Please wait a moment and try again."
    );
    rateLimitError.code = "RATE_LIMIT_EXCEEDED";
    rateLimitError.status = 429;
    return rateLimitError;
  }

  const safeMessage = rawMsg
    ? rawMsg.replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    : "Gemini provider request failed.";

  const sanitized = new Error(safeMessage);
  sanitized.code = error?.code || error?.status || "PROVIDER_ERROR";
  sanitized.status = error?.status;
  return sanitized;
}

/**
 * Safely parses JSON from raw model text output, stripping markdown formatting if present.
 */
function parseJSONFromText(text) {
  if (!text || typeof text !== "string") {
    const err = new Error("Empty model response cannot be parsed as JSON.");
    err.code = "INVALID_MODEL_OUTPUT";
    throw err;
  }

  let cleaned = text.trim();
  // Strip code fences if present (e.g. ```json ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If model included conversational text before/after JSON, locate outermost braces
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
 * Calls Gemini using the official Google Gen AI SDK interactions API.
 * Preserves Step 2 text generation functionality.
 *
 * @param {string} prompt - The text prompt to send to Gemini.
 * @returns {Promise<string>} The generated output text.
 */
export async function generateAIResponse(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string.");
  }

  const trimmedPrompt = prompt.trim();
  const model = getGeminiModel();
  const ai = getGeminiClient();

  try {
    const response = await ai.interactions.create({
      model: model,
      input: trimmedPrompt,
    });

    const outputText = response?.output_text?.trim();

    if (!outputText) {
      throw new Error("No output text received from model response.");
    }

    return outputText;
  } catch (error) {
    throw sanitizeError(error);
  }
}

/**
 * Calls Gemini to generate a structured JSON response.
 *
 * @param {string} prompt - The prompt instructing the model to produce valid JSON.
 * @returns {Promise<any>} The parsed JSON object.
 */
export async function generateJSONResponse(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt must be a non-empty string.");
  }

  const trimmedPrompt = prompt.trim();
  const model = getGeminiModel();
  const ai = getGeminiClient();

  try {
    // Request JSON mime type if supported
    const response = await ai.interactions.create({
      model: model,
      input: trimmedPrompt,
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
    if (error?.code === "MISSING_API_KEY" || error?.code === "INVALID_MODEL_OUTPUT") {
      throw error;
    }

    // Fallback: If response_mime_type fails on older model endpoints, retry with explicit prompt constraint
    if (
      error?.message &&
      (error.message.includes("response_mime_type") ||
        error.message.includes("unsupported") ||
        error.message.includes("400"))
    ) {
      try {
        const fallbackResponse = await ai.interactions.create({
          model: model,
          input: `${trimmedPrompt}\n\nIMPORTANT: Return ONLY a valid, raw JSON object. Do not include markdown codeblocks or any commentary.`,
        });
        const outputText = fallbackResponse?.output_text?.trim();
        return parseJSONFromText(outputText);
      } catch (fallbackError) {
        throw sanitizeError(fallbackError);
      }
    }

    throw sanitizeError(error);
  }
}
