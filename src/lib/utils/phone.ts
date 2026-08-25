/**
 * Phone normalization utilities for Ratiwal Dream Estates lead intake.
 *
 * Supports Indian numbers (+91) primarily, but accepts international format.
 * Returns E.164 where reliably possible, plus a safe display version.
 * Never used as a database ID.
 */

/** Minimum and maximum digit counts for a plausible phone number */
const MIN_DIGITS = 7;
const MAX_DIGITS = 15;

/** Strips all non-digit characters from a string */
function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

export interface NormalizedPhone {
  /** E.164 format where reliably derivable, e.g. +919876543210 */
  e164: string;
  /** Human-readable display version, e.g. +91 98765 43210 */
  display: string;
  /** Raw digits extracted */
  digits: string;
}

/**
 * Normalizes a raw phone string.
 * Returns null for clearly impossible values (too short, too long, all zeros).
 *
 * Rules:
 * - Strips spaces, dashes, dots, parentheses
 * - Handles leading `+` for international format
 * - Promotes 10-digit numbers without country code to Indian (+91) numbers
 * - Rejects anything outside MIN_DIGITS–MAX_DIGITS after stripping
 * - Rejects strings of repeated identical digits (e.g. 9999999999)
 */
export function normalizePhone(raw: string): NormalizedPhone | null {
  if (!raw || typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (trimmed.length > 20) return null;

  // Strip everything except digits and leading +
  const hasPlus = trimmed.startsWith("+");
  const digits = digitsOnly(trimmed);

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;

  // Reject all-zeros or suspiciously uniform numbers
  if (/^(\d)\1{6,}$/.test(digits)) return null;

  // Reject test/impossible numbers starting with 0 in 10-digit Indian context
  if (digits.length === 10 && digits.startsWith("0")) return null;

  let e164: string;
  let display: string;

  if (hasPlus) {
    // Treat as international E.164 — preserve the country code
    e164 = `+${digits}`;
    display = `+${formatDisplay(digits)}`;
  } else if (digits.length === 10) {
    // Assume Indian number — prepend +91
    e164 = `+91${digits}`;
    display = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    // Indian number with country code but without +
    e164 = `+${digits}`;
    display = `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  } else {
    // Generic international without +
    e164 = `+${digits}`;
    display = `+${formatDisplay(digits)}`;
  }

  return { e164, display, digits };
}

function formatDisplay(digits: string): string {
  // Group digits for readability: keep first 2 as country code, then groups of 5
  if (digits.length <= 7) return digits;
  const cc = digits.slice(0, 2);
  const rest = digits.slice(2);
  const groups: string[] = [];
  for (let i = 0; i < rest.length; i += 5) {
    groups.push(rest.slice(i, i + 5));
  }
  return `${cc} ${groups.join(" ")}`;
}

/**
 * Returns a masked version of the display phone for UI list views.
 * Shows country code + first 5 digits + ●●●●
 * e.g. "+91 98765 ●●●●"
 */
export function maskPhone(display: string): string {
  const parts = display.split(" ");
  if (parts.length < 2) return "●●●● ●●●●";
  const visibleParts = parts.slice(0, -1);
  return `${visibleParts.join(" ")} ●●●●`;
}

/**
 * Normalizes an email address.
 * Trims whitespace, lowercases domain, validates structure.
 * Returns null for invalid email.
 */
export function normalizeEmail(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const atIdx = trimmed.lastIndexOf("@");
  if (atIdx < 1) return null;

  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1).toLowerCase();

  if (!local || !domain || !domain.includes(".")) return null;

  const normalized = `${local}@${domain}`;

  // Basic structural validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(normalized)) return null;

  return normalized;
}
