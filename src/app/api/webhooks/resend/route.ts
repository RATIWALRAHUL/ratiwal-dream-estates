import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { WebhookReceipt } from "@/models/WebhookReceipt";
import { NotificationDelivery } from "@/models/NotificationDelivery";
import { ConsentService } from "@/lib/communications/services/consent.service";

const SVIX_TOLERANCE_SECONDS = 5 * 60;

/**
 * Verifies a Resend (Svix-format) webhook signature.
 * Scheme: signedContent = `${svixId}.${svixTimestamp}.${rawBody}`, signed with
 * HMAC-SHA256 using the base64 portion of the `whsec_<base64>` secret. The
 * `svix-signature` header may carry multiple space-separated `v1,<sig>` pairs.
 */
function verifyResendSignature(
  rawBody: string,
  headers: { svixId: string | null; svixTimestamp: string | null; svixSignature: string | null }
): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !headers.svixId || !headers.svixTimestamp || !headers.svixSignature) {
    return false;
  }

  // Reject stale/replayed signatures.
  const timestampSeconds = Number(headers.svixTimestamp);
  if (!Number.isFinite(timestampSeconds) || Math.abs(Date.now() / 1000 - timestampSeconds) > SVIX_TOLERANCE_SECONDS) {
    return false;
  }

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${headers.svixId}.${headers.svixTimestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expectedSignature);

  return headers.svixSignature.split(" ").some((candidate) => {
    const [, sig] = candidate.split(",");
    if (!sig) return false;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}

/**
 * Resend Email Delivery Webhook Handler
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signatureValid = verifyResendSignature(rawBody, {
      svixId: request.headers.get("svix-id"),
      svixTimestamp: request.headers.get("svix-timestamp"),
      svixSignature: request.headers.get("svix-signature"),
    });

    if (!signatureValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    await connectToDatabase();

    const eventId = String(payload.id || payload.event_id || `resend_evt_${Date.now()}`);
    const eventType = String(payload.type || "email.unknown");
    const data = (payload.data || {}) as Record<string, unknown>;
    const emailId = String(data.email_id || data.id || "");

    // 1. Idempotent receipt check
    const existingReceipt = await WebhookReceipt.findOne({
      provider: "RESEND",
      providerEventId: eventId,
    }).lean();

    if (existingReceipt) {
      return NextResponse.json({ received: true, status: "ALREADY_PROCESSED" }, { status: 200 });
    }

    await WebhookReceipt.create({
      provider: "RESEND",
      providerEventId: eventId,
      eventType,
      signatureValid,
      receivedAt: new Date(),
      processingStatus: "RECEIVED",
    });

    // 2. Process event type and update delivery records
    if (emailId) {
      const now = new Date();
      if (eventType === "email.delivered") {
        await NotificationDelivery.findOneAndUpdate(
          { provider: "RESEND", providerMessageId: emailId },
          { $set: { status: "DELIVERED", deliveredAt: now, webhookTimestamp: now } }
        );
      } else if (eventType === "email.bounced") {
        const recipient = Array.isArray(data.to) ? data.to[0] : String(data.to || "");
        await NotificationDelivery.findOneAndUpdate(
          { provider: "RESEND", providerMessageId: emailId },
          {
            $set: {
              status: "BOUNCED",
              failedAt: now,
              failureCategory: "PERMANENT_INVALID_RECIPIENT",
              failureMessage: "Hard bounce reported by provider",
              webhookTimestamp: now,
            },
          }
        );
        if (recipient) {
          await ConsentService.recordSuppression(recipient, "EMAIL", "HARD_BOUNCE");
        }
      } else if (eventType === "email.complained") {
        const recipient = Array.isArray(data.to) ? data.to[0] : String(data.to || "");
        await NotificationDelivery.findOneAndUpdate(
          { provider: "RESEND", providerMessageId: emailId },
          {
            $set: {
              status: "COMPLAINED",
              failedAt: now,
              failureCategory: "PERMANENT_MISSING_CONSENT",
              failureMessage: "Spam complaint reported by recipient",
              webhookTimestamp: now,
            },
          }
        );
        if (recipient) {
          await ConsentService.recordSuppression(recipient, "EMAIL", "SPAM_COMPLAINT");
        }
      }
    }

    await WebhookReceipt.updateOne(
      { provider: "RESEND", providerEventId: eventId },
      { $set: { processingStatus: "PROCESSED", processedAt: new Date() } }
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[ResendWebhook] Error processing webhook:", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
