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

    const parseResult = publicSiteVisitRequestSchema.safeParse(rawBody);
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

    // Email normalization (Compulsory)
    if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email address is required.", fields: { email: ["Email address is required."] } },
        { status: 400 }
      );
    }

    const emailNorm = normalizeEmail(data.email);
    if (!emailNorm) {
      return NextResponse.json(
        { success: false, error: "Invalid email address.", fields: { email: ["Please enter a valid email address."] } },
        { status: 400 }
      );
    }
    const normalizedEmailVal = emailNorm;
    const displayEmailVal = data.email.trim();

    await connectToDatabase();

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(data.propertyId);
    let property = null;

    if (isObjectId) {
      property = await Property.findOne(
        { _id: data.propertyId, publicationStatus: "PUBLISHED", archivedAt: null },
        { _id: 1, locationId: 1, title: 1 }
      ).lean();
    } else if (data.propertyId !== "general-consultation") {
      property = await Property.findOne(
        { slug: data.propertyId, publicationStatus: "PUBLISHED", archivedAt: null },
        { _id: 1, locationId: 1, title: 1 }
      ).lean();
    }

    const resolvedPropertyTitle = property?.title || "General Site Visit / Regional Corridors";
    const resolvedLocationId = data.locationId && /^[0-9a-fA-F]{24}$/.test(data.locationId)
      ? new Types.ObjectId(data.locationId)
      : property?.locationId ? new Types.ObjectId(property.locationId) : undefined;

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

    // Duplicate detection (same phone + property in window)
    const fingerprint = buildFingerprint(
      phoneResult.e164,
      property?._id?.toString() || data.propertyId,
      requestedStartAt.toISOString()
    );
    const existingRecent = await SiteVisit.findOne({
      submissionFingerprint: fingerprint,
      createdAt: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    }, { referenceNumber: 1 }).lean();

    if (existingRecent) {
      return NextResponse.json({
        success: true,
        message: "Your site visit request has been received. Our advisor will confirm the schedule shortly.",
        referenceNumber: existingRecent.referenceNumber,
      });
    }

    // Upsert or link to existing Lead
    let lead = await Lead.findOne({ normalizedPhone: phoneResult.e164 });
    const now = new Date();

    const tourTimelineSummary = property
      ? `Site visit requested for ${property.title} page`
      : data.landingPath === "/contact"
      ? "Site visit requested from Contact Page form"
      : `Site visit requested from ${data.landingPath || "Website"} form`;

    if (!lead) {
      lead = await Lead.create({
        referenceNumber: generateReferenceNumber(),
        fullName: data.fullName,
        normalizedPhone: phoneResult.e164,
        displayPhone: phoneResult.display,
        normalizedEmail: normalizedEmailVal,
        displayEmail: displayEmailVal,
        preferredContactMethod: "PHONE",
        source: data.source === "PUBLIC_LOCATION_PAGE" ? "LOCATION_PAGE" : (data.landingPath?.includes("contact") ? "CONTACT_PAGE" : "PROPERTY_DETAIL"),
        propertyId: property ? property._id : undefined,
        locationId: resolvedLocationId,
        status: "NEW",
        priority: "NORMAL",
        consentGranted: true,
        consentTextVersion: "1.0.0",
        privacyPolicyVersion: "1.0.0",
        consentPurpose: "SITE_VISIT_SCHEDULING",
        consentTimestamp: now,
        consentSource: data.landingPath || "site-visit-form",
        submissionFingerprint: fingerprint,
        retentionReviewAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        timeline: [
          {
            eventType: "INQUIRY_SUBMITTED",
            actorType: "SYSTEM",
            summary: tourTimelineSummary,
            occurredAt: now,
          },
        ],
      });
    } else {
      // Append inquiry event to existing lead timeline
      lead.timeline.push({
        eventType: "INQUIRY_SUBMITTED",
        actorType: "SYSTEM",
        summary: tourTimelineSummary,
        occurredAt: now,
      });
      await lead.save();
    }

    // 11. Create SiteVisit in REQUESTED state
    const referenceNumber = generateSiteVisitReferenceNumber();

    const visit = await SiteVisit.create({
      referenceNumber,
      leadId: lead._id,
      propertyId: property ? property._id : undefined,
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
          summary: `Site visit requested for ${requestedStartAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} (${data.meetingMode || "IN_PERSON"}) via ${tourTimelineSummary}`,
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

    // 12. Enqueue Outbox Notifications (Asynchronous)
    const formattedPreferredTime = `${requestedStartAt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })} at ${requestedStartAt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}`;

    // 1. Customer Confirmation & 2. Internal Alert
    try {
      await OutboxService.enqueue({
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
          propertyTitle: resolvedPropertyTitle,
          preferredTime: formattedPreferredTime,
        },
      });

      await OutboxService.enqueue({
        eventType: "SITE_VISIT_REQUEST_RECEIVED_INTERNAL",
        aggregateType: "SITE_VISIT",
        aggregateId: visit._id,
        aggregateVersion: 1,
        recipientType: "ADMIN_POOL",
        variables: {
          customerName: data.fullName.trim(),
          customerPhone: phoneResult.e164,
          propertyTitle: resolvedPropertyTitle,
          preferredTime: formattedPreferredTime,
          visitId: visit._id.toString(),
        },
      });

      await NotificationProcessorService.processBatch(5);
    } catch (commErr) {
      logger.warn("[SiteVisit] Non-blocking communication dispatch notice", {
        category: "visit-communication",
        error: commErr instanceof Error ? commErr.message : "Unknown",
      });
    }

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
