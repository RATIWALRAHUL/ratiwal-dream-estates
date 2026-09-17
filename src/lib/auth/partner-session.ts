import "server-only";

import { cookies } from "next/headers";
import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import { PartnerUser, PartnerSession } from "@/types/partner";
import { PartnerAccount } from "@/models/PartnerAccount";
import { ChannelPartner } from "@/models/ChannelPartner";
import { connectToDatabase } from "@/lib/db/mongoose";

export const PARTNER_AUTH_COOKIE_NAME = "ratiwal_partner_token";

const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSessionSecret(): string {
  const secret = process.env.PARTNER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-insecure-partner-session-secret-do-not-use-in-prod";
  }
  throw new Error(
    "PARTNER_SESSION_SECRET (or ADMIN_SESSION_SECRET) must be set in production — refusing to sign or verify partner sessions without it."
  );
}

// ─── 1. Password Cryptography (PBKDF2) ────────────────────────────────────────

export function hashPartnerPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPartnerPassword(password: string, hash: string, salt: string): boolean {
  const calculatedHash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  const calculatedBuf = Buffer.from(calculatedHash);
  const hashBuf = Buffer.from(hash);
  return calculatedBuf.length === hashBuf.length && timingSafeEqual(calculatedBuf, hashBuf);
}

// ─── 2. Cryptographic Session Tokens ──────────────────────────────────────────

export function createPartnerSessionToken(user: PartnerUser, customDurationSec = SESSION_DURATION_SECONDS): string {
  const expiresAt = Math.floor(Date.now() / 1000) + customDurationSec;
  const payload = {
    user,
    expiresAt,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const secret = getSessionSecret();
  const signature = createHmac("sha256", secret).update(payloadB64).digest("base64url");

  return `part_${payloadB64}.${signature}`;
}

export function verifyPartnerSessionToken(token: string): PartnerSession | null {
  try {
    if (!token.startsWith("part_")) return null;

    const parts = token.slice(5).split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const secret = getSessionSecret();
    const expectedSignature = createHmac("sha256", secret).update(payloadB64).digest("base64url");

    const signatureBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (signatureBuf.length !== expectedBuf.length || !timingSafeEqual(signatureBuf, expectedBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt < now) return null;

    return {
      user: payload.user,
      token,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

// ─── 3. Cookie Management & Current Session Helpers ───────────────────────────

export async function setPartnerSessionCookie(token: string, maxAge = SESSION_DURATION_SECONDS): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PARTNER_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearPartnerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PARTNER_AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getPartnerSession(): Promise<PartnerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PARTNER_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifyPartnerSessionToken(token);
  if (!session) return null;

  // Verify account is still active in database
  await connectToDatabase();
  const account = await PartnerAccount.findById(session.user.id).lean();
  if (!account || !account.isActive) return null;

  const partner = await ChannelPartner.findById(account.partnerId).lean();
  if (!partner || partner.status === "DEACTIVATED" || partner.status === "ARCHIVED") return null;

  return session;
}

export async function requirePartnerSession(): Promise<PartnerSession> {
  const session = await getPartnerSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Active channel partner session required.");
  }
  return session;
}
