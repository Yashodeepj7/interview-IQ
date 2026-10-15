import { extractText } from "unpdf";

export const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB maximum allowed upload size
export const MAX_EXTRACTED_CHARACTERS = 25000; // Cap extracted text to avoid prompt bloat / token overflow
const MIN_EXTRACTABLE_TEXT_LENGTH = 30; // Minimum meaningful text length to distinguish readable PDFs from scanned images

// PDF magic bytes signature: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d];

/**
 * Validates the raw buffer signature to confirm it is genuinely a PDF file.
 * Does not trust client-supplied MIME types.
 *
 * @param {Uint8Array|Buffer} buffer
 * @returns {boolean}
 */
export function hasValidPdfSignature(buffer) {
  if (!buffer || buffer.length < PDF_MAGIC_BYTES.length) {
    return false;
  }
  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Extracts readable text from an uploaded PDF buffer in memory.
 *
 * - Enforces 5 MB size limit
 * - Verifies `%PDF-` header signature
 * - Parses pages into clean, consolidated text
 * - Detects image-only / scanned documents and explains OCR limitations
 * - Caps total character count to a safe maximum
 * - Does not write to disk or persist anywhere
 *
 * @param {ArrayBuffer|Uint8Array|Buffer} inputBuffer
 * @returns {Promise<{ text: string, pageCount: number, characterCount: number, isTruncated: boolean }>}
 */
export async function extractTextFromPDF(inputBuffer) {
  if (!inputBuffer) {
    const error = new Error("No PDF buffer provided for text extraction.");
    error.code = "EMPTY_FILE";
    throw error;
  }

  let uint8Buffer;
  if (inputBuffer instanceof ArrayBuffer) {
    uint8Buffer = new Uint8Array(inputBuffer);
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(inputBuffer)) {
    uint8Buffer = new Uint8Array(inputBuffer.buffer.slice(inputBuffer.byteOffset, inputBuffer.byteOffset + inputBuffer.byteLength));
  } else if (inputBuffer instanceof Uint8Array) {
    if (inputBuffer.constructor?.name === "Buffer") {
      uint8Buffer = new Uint8Array(inputBuffer.buffer.slice(inputBuffer.byteOffset, inputBuffer.byteOffset + inputBuffer.byteLength));
    } else {
      uint8Buffer = inputBuffer;
    }
  } else {
    uint8Buffer = new Uint8Array(inputBuffer);
  }

  if (uint8Buffer.length === 0) {
    const error = new Error("Uploaded file is empty (0 bytes).");
    error.code = "EMPTY_FILE";
    throw error;
  }

  if (uint8Buffer.length > MAX_PDF_BYTES) {
    const error = new Error(
      `Uploaded file exceeds the maximum allowed limit of 5 MB (received ${(
        uint8Buffer.length / (1024 * 1024)
      ).toFixed(2)} MB).`
    );
    error.code = "FILE_TOO_LARGE";
    throw error;
  }

  if (!hasValidPdfSignature(uint8Buffer)) {
    const error = new Error(
      "Invalid PDF file format. The file signature does not match standard PDF specifications (%PDF- header missing)."
    );
    error.code = "INVALID_PDF_SIGNATURE";
    throw error;
  }

  let parseResult;
  try {
    parseResult = await extractText(uint8Buffer);
  } catch (err) {
    const parseError = new Error(
      `Unable to parse PDF document. The file may be corrupt or encrypted: ${err.message || "Unknown error"}`
    );
    parseError.code = "MALFORMED_PDF";
    throw parseError;
  }

  const rawPages = Array.isArray(parseResult.text)
    ? parseResult.text
    : typeof parseResult.text === "string"
    ? [parseResult.text]
    : [];

  const cleanedText = rawPages
    .map((pageText) => (typeof pageText === "string" ? pageText.trim() : ""))
    .filter(Boolean)
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Scanned or image-only detection
  if (cleanedText.length < MIN_EXTRACTABLE_TEXT_LENGTH) {
    const scanError = new Error(
      "No readable text could be extracted from this PDF. It appears to be a scanned document, image-only resume, or flattened graphic. InterviewIQ requires a text-based PDF resume (optical character recognition / OCR is not supported in this prototype)."
    );
    scanError.code = "NO_EXTRACTABLE_TEXT";
    throw scanError;
  }

  const isTruncated = cleanedText.length > MAX_EXTRACTED_CHARACTERS;
  const finalText = isTruncated
    ? cleanedText.slice(0, MAX_EXTRACTED_CHARACTERS).trim()
    : cleanedText;

  return {
    text: finalText,
    pageCount: parseResult.totalPages || rawPages.length || 1,
    characterCount: finalText.length,
    isTruncated,
  };
}
