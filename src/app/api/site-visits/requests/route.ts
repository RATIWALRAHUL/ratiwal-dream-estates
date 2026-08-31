import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SiteVisit } from "@/models/SiteVisit";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";

import { publicSiteVisitRequestSchema } from "@/lib/validations/site-visit-request";
import { normalizePhone, normalizeEmail } from "@/lib/utils/phone";
import { generateSiteVisitReferenceNumber, generateReferenceNumber } from "@/lib/utils/reference";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { OutboxService } from "@/lib/communications/services/outbox.service";
import { NotificationProcessorService } from "@/lib/communications/services/processor.service";
import { createHash } from "crypto";
import { Types } from "mongoose";

const MAX_BODY_BYTES = 32_768;
const MIN_FORM_TIME_MS = 4_000;
const DUPLICATE_WINDOW_MS = 30 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function buildFingerprint(phone: string, propertyId: string, startAt: string): string {
  const salt = process.env.LEAD_FINGERPRINT_SALT || "ratiwal-lead-salt-change-in-prod";
  const payload = `${phone}|${propertyId}|${startAt}`;
  return createHash("sha256").update(`${salt}:${payload}`).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Content-Type must be application/json." }, { status: 415 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ success: false, error: "Request body too large." }, { status: 413 });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON in request body." }, { status: 400 });
    }

    const parseResult = publicSiteVisitRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid booking request. Please check your inputs.",
          fields: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Honeypot check (silent fake success)
    if (data._honeypot && data._honeypot.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Your site visit request has been received. Our advisor will confirm the schedule shortly.",
        referenceNumber: generateSiteVisitReferenceNumber(),
      });
    }

    // Minimum form time check
    if (data._formStartedAt) {
      const startedAt = new Date(data._formStartedAt).getTime();
      if (!isNaN(startedAt) && Date.now() - startedAt < MIN_FORM_TIME_MS) {
        return NextResponse.json({
          success: true,
          message: "Your site visit request has been received. Our advisor will confirm the schedule shortly.",
          referenceNumber: generateSiteVisitReferenceNumber(),
        });
      }
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const ipLimit = checkRateLimit(`ip:${clientIp}`, RATE_LIMITS.INQUIRY_PER_IP.limit, RATE_LIMITS.INQUIRY_PER_IP.windowMs);
    if (!ipLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Phone normalization
    const phoneResult = normalizePhone(data.phone);
    if (!phoneResult) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number.",
          fields: { phone: ["Please enter a valid phone number."] },
        },
        { status: 400 }
      );
    }

    const phoneLimit = checkRateLimit(`phone:${phoneResult.e164}`, RATE_LIMITS.INQUIRY_PER_PHONE.limit, RATE_LIMITS.INQUIRY_PER_PHONE.windowMs);
    if (!phoneLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Email normalization (optional)
    let normalizedEmailVal: string | undefined;
    let displayEmailVal: string | undefined;
    if (data.email) {
      const emailNorm = normalizeEmail(data.email);
      if (!emailNorm) {
        return NextResponse.json(
          { success: false, error: "Invalid email address.", fields: { email: ["Please enter a valid email."] } },
          { status: 400 }
        );
      }
      normalizedEmailVal = emailNorm;
      displayEmailVal = data.email.trim();
    }

    await connectToDatabase();

    // Verify Property is published
    const property = await Property.findOne(
      { _id: data.propertyId, publicationStatus: "PUBLISHED", archivedAt: null },
      { _id: 1, locationId: 1, title: 1 }
    ).lean();

    if (!property) {
      return NextResponse.json({ success: false, error: "The requested property is not currently available for tours." }, { status: 400 });
    }

    const resolvedLocationId = data.locationId
      ? new Types.ObjectId(data.locationId)
      : property.locationId ? new Types.ObjectId(property.locationId) : undefined;

    // Verify preferred start is in future
    const requestedStartAt = new Date(data.preferredStartAt);
    if (isNaN(requestedStartAt.getTime()) || requestedStartAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: "Requested tour date must be in the future.", fields: { preferredStartAt: ["Must be in the future"] } },
        { status: 400 }
      );
    }

    const durationMinutes = data.durationMinutes || 60;
    const requestedEndAt = data.preferredEndAt
      ? new Date(data.preferredEndAt)
      : new Date(requestedStartAt.getTime() + durationMinutes * 60 * 1000);

    // Duplicate detection
    const fingerprint = buildFingerprint(phoneResult.e164, data.propertyId, requestedStartAt.toISOString());
    const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);

    const existingVisit = await SiteVisit.findOne({
      propertyId: new Types.ObjectId(data.propertyId),
      requestedStartAt: { $gte: new Date(requestedStartAt.getTime() - 15 * 60 * 1000), $lte: new Date(requestedStartAt.getTime() + 15 * 60 * 1000) },
      createdAt: { $gte: duplicateWindowStart },
    }).lean();

    if (existingVisit) {
      return NextResponse.json({
        success: true,
        message: "Your site visit request has been received. Our advisor will confirm the schedule shortly.",
        referenceNumber: existingVisit.referenceNumber,
      });
    }

    // 10. Find or create linked Lead
    const now = new Date();
    let lead = await Lead.findOne({ normalizedPhone: phoneResult.e164, anonymizedAt: { $exists: false } });

    if (!lead) {
      const leadRef = generateReferenceNumber();
      lead = await Lead.create({
        referenceNumber: leadRef,
        fullName: data.fullName,
        normalizedPhone: phoneResult.e164,
        displayPhone: phoneResult.display,
        normalizedEmail: normalizedEmailVal,
        displayEmail: displayEmailVal,
        preferredContactMethod: "PHONE",
        source: data.source === "PUBLIC_LOCATION_PAGE" ? "LOCATION_PAGE" : "PROPERTY_DETAIL",
        propertyId: new Types.ObjectId(data.propertyId),
        locationId: resolvedLocationId,
        status: "NEW",
        priority: "NORMAL",
        consentGranted: true,
        consentTextVersion: "1.0.0",
        privacyPolicyVersion: "1.0.0",
        consentPurpose: "SITE_VISIT_SCHEDULING",
        consentTimestamp: now,
        consentSource: "site-visit-form",
        submissionFingerprint: fingerprint,
        retentionReviewAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            eventType: "INQUIRY_SUBMITTED",
            actorType: "SYSTEM",
            summary: `Site visit requested for ${property.title}`,
            occurredAt: now,
          },
        ],
      });
    } else {
      // Append inquiry event to existing lead timeline
      lead.timeline.push({
        eventType: "INQUIRY_SUBMITTED",
        actorType: "SYSTEM",
        summary: `Site visit requested for ${property.title}`,
        occurredAt: now,
      });
      await lead.save();
    }

    // 11. Create SiteVisit in REQUESTED state
    const referenceNumber = generateSiteVisitReferenceNumber();

    const visit = await SiteVisit.create({
      referenceNumber,
      leadId: lead._id,
      propertyId: new Types.ObjectId(data.propertyId),
      locationId: resolvedLocationId,
      requestedBy: "CUSTOMER",
      source: data.source || "PUBLIC_PROPERTY_PAGE",
      requestedStartAt,
      requestedEndAt,
      timezone: "Asia/Kolkata",
      durationMinutes,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      meetingMode: data.meetingMode || "IN_PERSON",
      visitorCount: data.visitorCount || 1,
      status: "REQUESTED",
      priority: "NORMAL",
      confirmationStatus: "UNCONFIRMED",
      timeline: [
        {
          eventType: "VISIT_REQUESTED",
          actorType: "CUSTOMER",
          summary: `Site visit requested for ${requestedStartAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} (${data.meetingMode || "IN_PERSON"})`,
          occurredAt: now,
        },
      ],
      notes: data.message
        ? [
            {
              body: `Customer Note: ${data.message}`,
              authorId: "SYSTEM",
              authorName: data.fullName,
              authorEmail: phoneResult.display,
              createdAt: now,
            },
          ]
        : [],
    });

    logger.info("[SiteVisit] Visit requested successfully", { referenceNumber, propertyId: data.propertyId });

    // ── Enqueue Outbox Notifications (Asynchronous) ───────────────────────────
    const formattedPreferredTime = requestedStartAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    // 1. Customer Acknowledgement
    OutboxService.enqueue({
      eventType: "SITE_VISIT_REQUEST_RECEIVED_CUSTOMER",
      aggregateType: "SITE_VISIT",
      aggregateId: visit._id,
      aggregateVersion: 1,
      recipientType: "CUSTOMER",
      recipientEmail: displayEmailVal,
      recipientPhone: phoneResult.e164,
      recipientName: data.fullName.trim(),
      variables: {
        customerName: data.fullName.trim(),
        referenceNumber,
        propertyTitle: property.title,
        preferredTime: formattedPreferredTime,
      },
    }).catch(() => {});

    // 2. Internal Alert
    OutboxService.enqueue({
      eventType: "SITE_VISIT_REQUEST_RECEIVED_INTERNAL",
      aggregateType: "SITE_VISIT",
      aggregateId: visit._id,
      aggregateVersion: 1,
      recipientType: "ADMIN_POOL",
      variables: {
        customerName: data.fullName.trim(),
        customerPhone: phoneResult.e164,
        propertyTitle: property.title,
        preferredTime: formattedPreferredTime,
        visitId: visit._id.toString(),
      },
    }).catch(() => {});

    NotificationProcessorService.processBatch(5).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Your site visit request has been received. Our advisor will confirm the schedule shortly.",
      referenceNumber,
    });
  } catch (error) {
    logger.error("[SiteVisit] Error processing request", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown",
    });
    return NextResponse.json({ success: false, error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
