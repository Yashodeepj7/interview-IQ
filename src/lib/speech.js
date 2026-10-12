/**
 * Browser Speech Recognition and Speech Synthesis helper utilities for InterviewIQ.
 * Designed to handle cross-browser compatibility, error mapping, and transcript formatting safely.
 */

/**
 * Checks whether browser Web Speech API Speech Recognition is supported.
 * Returns false on server/SSR or unsupported browsers.
 *
 * @param {Window|null} win - Optional window reference for dependency injection in tests
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported(win = typeof window !== "undefined" ? window : null) {
  if (!win) return false;
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Checks whether browser Web Speech API Speech Synthesis (Text-to-Speech) is supported.
 *
 * @param {Window|null} win - Optional window reference for dependency injection in tests
 * @returns {boolean}
 */
export function isSpeechSynthesisSupported(win = typeof window !== "undefined" ? window : null) {
  if (!win) return false;
  return Boolean("speechSynthesis" in win && "SpeechSynthesisUtterance" in win);
}

/**
 * Returns the SpeechRecognition constructor if available, or null.
 *
 * @param {Window|null} win
 * @returns {Function|null}
 */
export function getSpeechRecognitionConstructor(win = typeof window !== "undefined" ? window : null) {
  if (!win) return null;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Maps Web Speech API recognition error codes to human-readable, actionable guidance.
 *
 * @param {string} errorCode
 * @returns {{ type: string, title: string, message: string, retryable: boolean }}
 */
export function mapSpeechRecognitionError(errorCode) {
  switch (errorCode) {
    case "not-allowed":
    case "permission-denied":
      return {
        type: "permission",
        title: "Microphone Access Denied",
        message:
          "Microphone access was blocked. Please permit microphone access in your browser's address bar or site settings to enable voice input.",
        retryable: true,
      };

    case "no-speech":
      return {
        type: "no-speech",
        title: "No Speech Detected",
        message:
          "No voice was detected. Please check your microphone input level and speak clearly into your microphone.",
        retryable: true,
      };

    case "audio-capture":
      return {
        type: "device",
        title: "Microphone Unavailable",
        message:
          "No working microphone was detected, or the microphone is currently in exclusive use by another program.",
        retryable: true,
      };

    case "network":
      return {
        type: "network",
        title: "Speech Network Service Error",
        message:
          "A network connection error occurred with the browser's speech recognition engine. You can retry or use Typed Mode.",
        retryable: true,
      };

    case "aborted":
      return {
        type: "aborted",
        title: "Speech Input Stopped",
        message: "Voice recording was stopped.",
        retryable: true,
      };

    default:
      return {
        type: "unknown",
        title: "Voice Input Issue",
        message: `An unexpected speech recognition event occurred (${errorCode || "unknown"}). You can type your answer or retry speaking.`,
        retryable: true,
      };
  }
}

/**
 * Appends a new transcribed speech segment to an existing answer string.
 * Handles spacing, trims excess whitespace, and prevents duplicating text.
 *
 * @param {string} existingText - The current text in the answer field
 * @param {string} newTranscript - The newly finalized speech transcript chunk
 * @returns {string} The merged transcript
 */
export function appendSpeechTranscript(existingText, newTranscript) {
  const existing = typeof existingText === "string" ? existingText.trim() : "";
  const addition = typeof newTranscript === "string" ? newTranscript.trim() : "";

  if (!addition) return existing;
  if (!existing) return addition;

  return `${existing} ${addition}`;
}
