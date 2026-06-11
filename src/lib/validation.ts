import mongoose from "mongoose";

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Sanitize a string for safe database storage.
 * Prevents NoSQL injection via `$` operators and removes null bytes.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Strip any MongoDB operator prefixes ($ at start of keys)
  // This prevents NoSQL injection in values that could be used as keys
  sanitized = sanitized.replace(/^\$/, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize user-provided notes/text to prevent stored XSS.
 * Strips HTML tags and limits length.
 */
export function sanitizeNotes(input: string, maxLength = 2000): string {
  if (typeof input !== "string") return "";

  let sanitized = sanitizeString(input);

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize a URL string.
 * Only allows http/https protocols.
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const trimmed = input.trim();
    const url = new URL(trimmed);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength.
 */
export function isValidPassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }
  return { valid: true };
}
