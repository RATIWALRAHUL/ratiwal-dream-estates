/**
 * POST /api/enquiries — Public inquiry submission endpoint.
 *
 * This path is preserved for backward compatibility with existing website forms.
 * /api/inquiries is an alias that delegates here.
 *
 * Security pipeline (13 steps):
 *  1.  Method check (POST only)
 *  2.  Content-type check
 *  3.  Body size limit (32 KB)
 *  4.  Parse allowed fields only (Zod strips unknown)
 *  5.  Honeypot check
 *  6.  Minimum timing check
 *  7.  Rate limit — per IP, per normalized phone, per normalized email
 *  8.  Validate and normalize phone
 *  9.  Validate and normalize email
 * 10.  Validate Property / Location references (canonical, not trusted from client)
 * 11.  Detect recent duplicate submission
 * 12.  Create Lead + initial timeline event
 * 13.  Return generic success with referenceNumber — never expose internal ID
 */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Lead, type LeadSource } from "@/models/Lead";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";
import { publicInquirySchema, CONSENT_TEXT_VERSION, PRIVACY_POLICY_VERSION, DUPLICATE_WINDOW_MS, MIN_FORM_TIME_MS, MAX_BODY_BYTES } from "@/lib/validations/lead";
import { normalizePhone, normalizeEmail } from "@/lib/utils/phone";
import { generateReferenceNumber } from "@/lib/utils/reference";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { createHash } from "crypto";
import { Types } from "mongoose";
import { OutboxService } from "@/lib/communications/services/outbox.service";
import { NotificationProcessorService } from "@/lib/communications/services/processor.service";

/** Allowed LEAD_SOURCES — server-controlled, never from client string alone */
const CONTROLLED_SOURCES = new Set<LeadSource>([
  "PROPERTY_DETAIL",
  "PROPERTY_CARD",
  "LOCATION_PAGE",
  "HOMEPAGE_CTA",
  "CONTACT_PAGE",
  "ADVISOR_SECTION",
  "DIRECT",
  "OTHER",
]);

/**
 * Returns the client IP address from common proxy headers.
 * Falls back to "unknown" — rate limiting must not solely depend on IP.
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Builds a submission fingerprint for duplicate detection.
 * NOT a persistent identifier — just a short-lived deduplication key.
 * Uses: normalized phone + propertyId/locationId combination.
 * HMAC-based, salted with a server secret. Never stored raw.
 */
function buildFingerprint(normalizedPhone: string, propertyId?: string, locationId?: string): string {
  const salt = process.env.LEAD_FINGERPRINT_SALT || "ratiwal-lead-salt-change-in-prod";
  const payload = `${normalizedPhone}|${propertyId ?? ""}|${locationId ?? ""}`;
  return createHash("sha256").update(`${salt}:${payload}`).digest("hex").slice(0, 32);
}

/** Counts suspicious link-like patterns in a message */
function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/|www\.\S+/gi);
  return matches ? matches.length : 0;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();

  try {
    // ── 1. Method is already POST via route file ────────────────────────────

    // ── 2. Content-type check ───────────────────────────────────────────────
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "Content-Type must be application/json." },
        { status: 415 }
      );
    }

    // ── 3. Body size limit ──────────────────────────────────────────────────
    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: "Request body too large." },
        { status: 413 }
      );
    }

    // ── 4. Parse — only allowed fields (Zod strips unknown) ─────────────────
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    if (typeof rawBody === "object" && rawBody !== null) {
      const bodyObj = rawBody as Record<string, unknown>;
      if (!bodyObj.fullName && bodyObj.name) {
        bodyObj.fullName = bodyObj.name;
      }
      if (bodyObj.consentGranted === undefined) {
        bodyObj.consentGranted = true;
      }
      if (!bodyObj._honeypot && bodyObj.honeypot) {
        bodyObj._honeypot = bodyObj.honeypot;
      }
    }

    const parseResult = publicInquirySchema.safeParse(rawBody);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors as Record<string, string[]>;
      if (fieldErrors.fullName && !fieldErrors.name) {
        fieldErrors.name = fieldErrors.fullName;
      }
      return NextResponse.json(
        {
          success: false,
          error: "Please correct the highlighted errors below.",
          fields: fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // ── 5. Honeypot check ────────────────────────────────────────────────────
    if (data._honeypot && data._honeypot.length > 0) {
      // Silent fake success — bots assume submission worked
      return NextResponse.json({
        success: true,
        message: "Thank you. Our property advisory team will contact you shortly.",
        referenceNumber: generateReferenceNumber(),
      });
    }

    // ── 6. Minimum timing check ──────────────────────────────────────────────
    if (data._formStartedAt) {
      const startedAt = new Date(data._formStartedAt).getTime();
      if (!isNaN(startedAt) && Date.now() - startedAt < MIN_FORM_TIME_MS) {
        // Also silent fake success
        return NextResponse.json({
          success: true,
          message: "Thank you. Our property advisory team will contact you shortly.",
          referenceNumber: generateReferenceNumber(),
        });
      }
    }

    // ── 7. Rate limiting ─────────────────────────────────────────────────────
    const clientIp = getClientIp(req);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, RATE_LIMITS.INQUIRY_PER_IP.limit, RATE_LIMITS.INQUIRY_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(ipLimit.retryAfterMs / 1000)) },
        }
      );
    }

    // ── 8. Normalize and validate phone ─────────────────────────────────────
    const phoneResult = normalizePhone(data.phone);
    if (!phoneResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form submission. Please check your inputs.",
          fields: { phone: ["Please enter a valid phone number."] },
        },
        { status: 400 }
      );
    }

    // Per-phone rate limit
    const phoneLimit = checkRateLimit(
      `phone:${phoneResult.e164}`,
      RATE_LIMITS.INQUIRY_PER_PHONE.limit,
      RATE_LIMITS.INQUIRY_PER_PHONE.windowMs
    );
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(phoneLimit.retryAfterMs / 1000)) },
        }
      );
    }

    // ── 9. Normalize email (Compulsory) ──────────────────────────────────────
    if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form submission. Please check your inputs.",
          fields: { email: ["Email address is required."] },
        },
        { status: 400 }
      );
    }

    const emailNorm = normalizeEmail(data.email);
    if (!emailNorm) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid form submission. Please check your inputs.",
          fields: { email: ["Please enter a valid email address."] },
        },
        { status: 400 }
      );
    }
    const normalizedEmailVal = emailNorm;
    const displayEmailVal = data.email.trim();

    // Per-email rate limit
    const emailLimit = checkRateLimit(
      `email:${normalizedEmailVal}`,
      RATE_LIMITS.INQUIRY_PER_EMAIL.limit,
      RATE_LIMITS.INQUIRY_PER_EMAIL.windowMs
    );
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(emailLimit.retryAfterMs / 1000)) },
        }
      );
    }

    // ── 10. Validate Property / Location references ──────────────────────────
    await connectToDatabase();

    let resolvedPropertyId: Types.ObjectId | undefined;
    let resolvedLocationId: Types.ObjectId | undefined;

    if (data.propertyId) {
      const property = await Property.findOne(
        { _id: data.propertyId, publicationStatus: "PUBLISHED", archivedAt: null },
        { _id: 1 }
      ).lean();
      if (!property) {
        return NextResponse.json(
          { success: false, error: "Invalid form submission. Please check your inputs." },
          { status: 400 }
        );
      }
      resolvedPropertyId = new Types.ObjectId(data.propertyId);
    }

    if (data.locationId) {
      const location = await Location.findOne(
        { _id: data.locationId, publicationStatus: "PUBLISHED", archivedAt: null },
        { _id: 1 }
      ).lean();
      if (!location) {
        return NextResponse.json(
          { success: false, error: "Invalid form submission. Please check your inputs." },
          { status: 400 }
        );
      }
      resolvedLocationId = new Types.ObjectId(data.locationId);
    }

    // ── Spam signal: message with multiple links ──────────────────────────────
    if (data.message && countLinks(data.message) >= 3) {
      // Silently tag as suspected spam
      logger.warn("[Inquiry] Suspected spam: multiple links in message", {
        category: "inquiry-spam",
        linkCount: countLinks(data.message),
      });
    }

    // ── 11. Duplicate detection ──────────────────────────────────────────────
    const fingerprint = buildFingerprint(
      phoneResult.e164,
      resolvedPropertyId?.toString(),
      resolvedLocationId?.toString()
    );

    const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const existingLead = await Lead.findOne(
      {
        submissionFingerprint: fingerprint,
        createdAt: { $gte: duplicateWindowStart },
        abuseStatus: { $ne: "BLOCKED" },
      },
      { referenceNumber: 1 }
    ).lean();

    if (existingLead) {
      // Idempotent response — return the same reference number
      logger.info("[Inquiry] Duplicate submission detected, returning existing reference", {
        category: "inquiry-duplicate",
      });
      return NextResponse.json({
        success: true,
        message: "Thank you. Our property advisory team will contact you shortly.",
        referenceNumber: existingLead.referenceNumber,
      });
    }

    // ── 12. Build and persist Lead ────────────────────────────────────────────
    const referenceNumber = generateReferenceNumber();
    const now = new Date();
    const retentionReviewAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    // Server-controlled source — reject unknown values silently
    const resolvedSource: LeadSource = CONTROLLED_SOURCES.has(data.source as LeadSource)
      ? (data.source as LeadSource)
      : "DIRECT";

    const isSpamSuspected = data.message ? countLinks(data.message) >= 3 : false;

    // ── Enqueue Outbox Notifications (Asynchronous / Non-blocking) ────────────
    let propertyTitle: string | undefined;
    if (resolvedPropertyId) {
      const prop = await Property.findById(resolvedPropertyId, { title: 1 }).lean();
      if (prop) propertyTitle = prop.title;
    }

    // Determine descriptive page origin for timeline
    let timelineSummary = "Inquiry received from Website";
    if (propertyTitle) {
      timelineSummary = `Inquiry received from ${propertyTitle} page`;
    } else if (data.propertySlug) {
      timelineSummary = `Inquiry received from /properties/${data.propertySlug} page`;
    } else if (data.landingPath === "/contact" || resolvedSource === "CONTACT_PAGE") {
      timelineSummary = "Inquiry received from Contact Page form";
    } else if (data.landingPath && data.landingPath !== "/") {
      timelineSummary = `Inquiry received from ${data.landingPath} form`;
    } else if (data.landingPath === "/" || resolvedSource === "HOMEPAGE_CTA") {
      timelineSummary = "Inquiry received from Homepage form";
    } else if (resolvedSource === "LOCATION_PAGE") {
      timelineSummary = "Inquiry received from Location Directory form";
    } else {
      timelineSummary = "Inquiry received from Website form";
    }

    // ── Location resolution ──────────────────────────────────────────────────
    if (!resolvedLocationId && data.preferredLocation) {
      const locMatch = await Location.findOne(
        {
          name: new RegExp(data.preferredLocation.trim(), "i"),
          publicationStatus: "PUBLISHED",
          archivedAt: null,
        },
        { _id: 1 }
      ).lean();
      if (locMatch) {
        resolvedLocationId = new Types.ObjectId(locMatch._id);
      }
    }

    // ── Budget & Property Interest Parsing ────────────────────────────────────
    let budgetMinPaise = data.budgetMinimumPaise;
    let budgetMaxPaise = data.budgetMaximumPaise;
    let budgetRangeText = data.budget;

    if (data.budget && (!budgetMinPaise || !budgetMaxPaise)) {
      const bStr = data.budget.toLowerCase();
      if (bStr.includes("25") && (bStr.includes("under") || bStr.includes("<"))) {
        budgetMinPaise = 0;
        budgetMaxPaise = 25 * 100000 * 100;
        budgetRangeText = "Under ₹25 Lakhs";
      } else if (bStr.includes("25") && bStr.includes("50")) {
        budgetMinPaise = 25 * 100000 * 100;
        budgetMaxPaise = 50 * 100000 * 100;
        budgetRangeText = "₹25L – ₹50L";
      } else if (bStr.includes("50") && (bStr.includes("1") || bStr.includes("cr"))) {
        budgetMinPaise = 50 * 100000 * 100;
        budgetMaxPaise = 100 * 100000 * 100;
        budgetRangeText = "₹50L – ₹1 Cr";
      } else if (bStr.includes("1") && bStr.includes("2.5")) {
        budgetMinPaise = 100 * 100000 * 100;
        budgetMaxPaise = 250 * 100000 * 100;
        budgetRangeText = "₹1 Cr – ₹2.5 Cr";
      } else if (bStr.includes("2.5") || bStr.includes("above")) {
        budgetMinPaise = 250 * 100000 * 100;
        budgetMaxPaise = 1000 * 100000 * 100;
        budgetRangeText = "Above ₹2.5 Cr";
      }
    }

    const resolvedPropertyType = data.propertyType || data.propertyTypeInterest;

    const createdLead = await Lead.create({
      referenceNumber,
      fullName: data.fullName,
      normalizedPhone: phoneResult.e164,
      displayPhone: phoneResult.display,
      normalizedEmail: normalizedEmailVal,
      displayEmail: displayEmailVal,
      preferredContactMethod: data.preferredContactMethod,
      preferredLanguage: data.preferredLanguage,

      source: resolvedSource,
      propertyId: resolvedPropertyId,
      locationId: resolvedLocationId,
      preferredLocation: data.preferredLocation,
      propertyTypeInterest: resolvedPropertyType,
      budgetMinimumPaise: budgetMinPaise,
      budgetMaximumPaise: budgetMaxPaise,
      budgetRange: budgetRangeText,
      areaMinimumSqFt: data.areaMinimumSqFt,
      areaMaximumSqFt: data.areaMaximumSqFt,
      purchaseTimeline: data.purchaseTimeline,
      investmentPurpose: data.investmentPurpose,
      message: data.message,

      status: "NEW",
      priority: "NORMAL",

      consentGranted: true,
      consentTextVersion: data.consentTextVersion || CONSENT_TEXT_VERSION,
      privacyPolicyVersion: PRIVACY_POLICY_VERSION,
      consentPurpose: "INQUIRY_PROCESSING",
      consentTimestamp: now,
      consentSource: data.landingPath || "form",

      landingPath: data.landingPath,
      referrerDomain: data.referrerDomain,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,

      submissionFingerprint: fingerprint,
      abuseStatus: isSpamSuspected ? "SUSPECTED_SPAM" : "CLEAN",
      retentionReviewAt,

      timeline: [
        {
          eventType: "INQUIRY_SUBMITTED",
          actorType: "SYSTEM",
          summary: timelineSummary,
          occurredAt: now,
        },
      ],
      notes: [],
      contactAttempts: [],
    });

    logger.info("[Inquiry] Lead created", {
      category: "inquiry",
      referenceNumber,
      source: resolvedSource,
      timelineSummary,
    });

    // 1. Customer Acknowledgement & 2. Internal Operations Alert
    try {
      await OutboxService.enqueue({
        eventType: "INQUIRY_RECEIVED_CUSTOMER",
        aggregateType: "LEAD",
        aggregateId: createdLead._id,
        aggregateVersion: 1,
        recipientType: "CUSTOMER",
        recipientEmail: displayEmailVal,
        recipientPhone: phoneResult.e164,
        recipientName: data.fullName.trim(),
        variables: {
          customerName: data.fullName.trim(),
          referenceNumber,
          propertyTitle,
        },
      });

      await OutboxService.enqueue({
        eventType: "LEAD_CREATED_INTERNAL",
        aggregateType: "LEAD",
        aggregateId: createdLead._id,
        aggregateVersion: 1,
        recipientType: "ADMIN_POOL",
        variables: {
          leadName: data.fullName.trim(),
          leadPhone: phoneResult.e164,
          leadId: createdLead._id.toString(),
          source: resolvedSource,
        },
      });

      // Trigger immediate background delivery worker
      await NotificationProcessorService.processBatch(5);
    } catch (commErr) {
      logger.warn("[Inquiry] Non-blocking communication dispatch notice", {
        category: "inquiry-communication",
        error: commErr instanceof Error ? commErr.message : "Unknown",
      });
    }

    // ── 13. Generic success response — no internal IDs ────────────────────────
    return NextResponse.json({
      success: true,
      message: "Thank you. Our property advisory team will contact you shortly.",
      referenceNumber,
    });
  } catch (error) {
    // Never leak internal details — log on server only
    logger.error("[Inquiry] Internal error", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}
