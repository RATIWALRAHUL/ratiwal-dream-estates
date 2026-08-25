import { randomBytes } from "crypto";

/**
 * Character set for reference numbers:
 * Base-32 Crockford alphabet — excludes I, L, O, U to avoid confusion.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const REFERENCE_LENGTH = 8;
const PREFIX = "RDE";

/**
 * Generates an opaque, non-sequential, case-insensitive public reference number.
 * Format: RDE-XXXXXXXX (8 alphanumeric characters from Crockford base-32)
 *
 * Properties:
 * - Does not expose database ID or lead count
 * - Crypto-random (not Math.random)
 * - Safe to communicate to customers via SMS, email, or phone
 * - Collision probability: 32^8 ≈ 1 trillion unique values
 */
export function generateReferenceNumber(): string {
  const bytes = randomBytes(REFERENCE_LENGTH);
  let result = "";
  for (let i = 0; i < REFERENCE_LENGTH; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${PREFIX}-${result}`;
}

/**
 * Validates that a string matches the reference number format.
 * Case-insensitive.
 */
export function isValidReferenceNumber(ref: string): boolean {
  if (!ref || typeof ref !== "string") return false;
  const upper = ref.toUpperCase().trim();
  return /^RDE-[0-9A-HJKMNP-TV-Z]{8}$/.test(upper);
}

/**
 * Generates an opaque, non-sequential public Site Visit reference number.
 * Format: RDE-SV-XXXXXX (6 alphanumeric characters from Crockford base-32)
 *
 * Properties:
 * - Does not expose database ID or visit count
 * - Crypto-random
 * - Safe for customer communication
 */
export function generateSiteVisitReferenceNumber(): string {
  const bytes = randomBytes(6);
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `RDE-SV-${result}`;
}

export function isValidSiteVisitReferenceNumber(ref: string): boolean {
  if (!ref || typeof ref !== "string") return false;
  const upper = ref.toUpperCase().trim();
  return /^RDE-SV-[0-9A-HJKMNP-TV-Z]{6}$/.test(upper);
}

