import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

/**
 * Normalizes an email address for consistent storage and lookups.
 * Lowercases and strips leading/trailing whitespace.
 *
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Validates registration and login inputs.
 * Returns an error string if invalid, or null if valid.
 */
export function validateRegistrationInput({ name, email, password, confirmPassword }) {
  // Validate Name
  if (!name || typeof name !== "string") {
    return "Name is required and must be a string.";
  }
  const trimmedName = name.trim();
  if (trimmedName.length < MIN_NAME_LENGTH || trimmedName.length > MAX_NAME_LENGTH) {
    return `Name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`;
  }

  // Validate Email
  if (!email || typeof email !== "string") {
    return "Email address is required.";
  }
  const normEmail = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normEmail) || normEmail.length > 254) {
    return "Please enter a valid email address.";
  }

  // Validate Password
  if (!password || typeof password !== "string") {
    return "Password is required.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
  }

  // Validate Confirm Password
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

/**
 * Hashes a plaintext password using bcrypt.
 * Never logs or exposes the plaintext password.
 *
 * @param {string} plaintextPassword
 * @returns {Promise<string>}
 */
export async function hashPassword(plaintextPassword) {
  if (typeof plaintextPassword !== "string" || !plaintextPassword) {
    throw new Error("Password to hash must be a non-empty string.");
  }
  return bcrypt.hash(plaintextPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a stored bcrypt hash.
 * Constant-time comparison handled by bcrypt.
 *
 * @param {string} plaintextPassword
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plaintextPassword, storedHash) {
  if (
    typeof plaintextPassword !== "string" ||
    typeof storedHash !== "string" ||
    !plaintextPassword ||
    !storedHash
  ) {
    return false;
  }
  return bcrypt.compare(plaintextPassword, storedHash);
}

/**
 * Sanitizes a MongoDB user document for safe exposure to client/session.
 * Strips passwordHash and internal properties.
 *
 * @param {object} user
 * @returns {object}
 */
export function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
