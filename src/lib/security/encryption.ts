import "server-only";
import crypto from "node:crypto";

/**
 * Server-side application-level encryption and masking utilities for PRD 15:
 * Customer KYC & Personal Data Protection.
 * 
 * Complies with DPDPA 2023, UIDAI offline e-KYC guidelines, and Indian Income Tax PAN rules.
 * Uses AES-256-GCM with authenticated tag and random initialization vectors.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derives a consistent 256-bit encryption key from environment variable or deterministic secret
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.KYC_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "ratiwal-dream-estates-kyc-master-secret-key-32b";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Derives a dedicated HMAC pepper key from environment variable for duplicate detection
 */
function getHmacSecret(): Buffer {
  const secret = process.env.KYC_HMAC_SECRET || process.env.ENCRYPTION_PEPPER || "ratiwal-kyc-blind-index-hmac-pepper-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

export interface EncryptedFieldResult {
  encryptedData: string; // Base64 encoded: iv:authTag:ciphertext
  keyVersion: number;
}

export class KycSecurityUtils {
  /**
   * Encrypts sensitive plaintext using AES-256-GCM
   * Returns base64 payload containing IV, Auth Tag, and Ciphertext
   */
  public static encryptField(plaintext: string, keyVersion: number = 1): EncryptedFieldResult {
    if (!plaintext) {
      return { encryptedData: "", keyVersion };
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const payload = `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    return {
      encryptedData: Buffer.from(payload).toString("base64"),
      keyVersion,
    };
  }

  /**
   * Decrypts AES-256-GCM payload
   */
  public static decryptField(encryptedPayloadBase64: string): string {
    if (!encryptedPayloadBase64) return "";

    try {
      const decoded = Buffer.from(encryptedPayloadBase64, "base64").toString("utf8");
      const [ivHex, authTagHex, encryptedHex] = decoded.split(":");

      if (!ivHex || !authTagHex || !encryptedHex) {
        throw new Error("Malformed encrypted payload format");
      }

      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");
      const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (err) {
      throw new Error(`Failed to decrypt protected KYC field: ${(err as Error).message}`);
    }
  }

  /**
   * Generates a server-side keyed HMAC (blind index) for privacy-preserving duplicate detection.
   * Plaintext is normalized (uppercase, whitespace trimmed) before HMAC.
   */
  public static generateKeyedHmac(identifier: string): string {
    if (!identifier) return "";
    const normalized = identifier.trim().toUpperCase().replace(/[\s-]/g, "");
    return crypto.createHmac("sha256", getHmacSecret()).update(normalized).digest("hex");
  }

  /**
   * Masks a PAN number according to standard practice: ABCDE****F
   */
  public static maskPan(pan: string): string {
    if (!pan) return "";
    const clean = pan.trim().toUpperCase();
    if (clean.length !== 10) return "XXXXX****X";
    return `${clean.slice(0, 5)}****${clean.slice(9)}`;
  }

  /**
   * Masks Aadhaar number according to UIDAI standard: XXXX-XXXX-1234
   */
  public static maskAadhaar(aadhaar: string): string {
    if (!aadhaar) return "";
    const digits = aadhaar.replace(/\D/g, "");
    if (digits.length >= 4) {
      const last4 = digits.slice(-4);
      return `XXXX-XXXX-${last4}`;
    }
    return "XXXX-XXXX-XXXX";
  }

  /**
   * Masks generic document numbers keeping only the last 4 characters visible
   */
  public static maskGenericDocument(docNumber: string): string {
    if (!docNumber) return "";
    const clean = docNumber.trim();
    if (clean.length <= 4) return "****";
    const last4 = clean.slice(-4);
    const prefixLength = Math.max(clean.length - 4, 3);
    return `${"*".repeat(prefixLength)}${last4}`;
  }

  /**
   * Validates Indian PAN format: 5 letters, 4 digits, 1 letter
   */
  public static isValidPanFormat(pan: string): boolean {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.trim().toUpperCase());
  }

  /**
   * Validates Indian Passport format: 1 letter followed by 7 digits
   */
  public static isValidPassportFormat(passport: string): boolean {
    if (!passport) return false;
    const passportRegex = /^[A-Z][0-9]{7}$/;
    return passportRegex.test(passport.trim().toUpperCase());
  }

  /**
   * Generates a cryptographically secure random token (hex string)
   */
  public static generateSecureToken(byteLength: number = 32): string {
    return crypto.randomBytes(byteLength).toString("hex");
  }

  /**
   * Computes SHA-256 hash of a string (e.g. For token hashing)
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
}
