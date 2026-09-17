import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db/mongoose";
import { WebhookReceipt } from "@/models/WebhookReceipt";
import { NotificationDelivery } from "@/models/NotificationDelivery";
import { ConsentService } from "@/lib/communications/services/consent.service";

/**
 * WhatsApp Meta Cloud API Webhook
 * GET: Verification Challenge
 * POST: Delivery & Status Updates
 */

/** Verifies Meta's `X-Hub-Signature-256: sha256=<hex-hmac>` header over the raw body. */
function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader?.startsWith("sha256=")) return false;

  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const providedSignature = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expectedSignature);
  const providedBuf = Buffer.from(providedSignature);
  return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (verifyToken && mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden verification challenge" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signatureValid = verifyWhatsAppSignature(rawBody, request.headers.get("x-hub-signature-256"));
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

    const entry = (payload.entry as Array<Record<string, unknown>>)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = changes?.value as Record<string, unknown>;
    const statuses = value?.statuses as Array<Record<string, unknown>>;

    if (Array.isArray(statuses) && statuses.length > 0) {
      for (const statusObj of statuses) {
        const msgId = String(statusObj.id || "");
        const statusStr = String(statusObj.status || "").toLowerCase();
        const recipientId = String(statusObj.recipient_id || "");
        const eventId = `wa_${msgId}_${statusStr}`;

        // Idempotent check
        const existing = await WebhookReceipt.findOne({
          provider: "WHATSAPP",
          providerEventId: eventId,
        }).lean();

        if (existing) continue;

        await WebhookReceipt.create({
          provider: "WHATSAPP",
          providerEventId: eventId,
          eventType: `whatsapp.message.${statusStr}`,
          signatureValid,
          receivedAt: new Date(),
          processingStatus: "PROCESSED",
          processedAt: new Date(),
        });

        const now = new Date();
        if (statusStr === "delivered") {
          await NotificationDelivery.findOneAndUpdate(
            { provider: "WHATSAPP_CLOUD", providerMessageId: msgId },
            { $set: { status: "DELIVERED", deliveredAt: now, webhookTimestamp: now } }
          );
        } else if (statusStr === "read") {
          await NotificationDelivery.findOneAndUpdate(
            { provider: "WHATSAPP_CLOUD", providerMessageId: msgId },
            { $set: { status: "READ", readAt: now, webhookTimestamp: now } }
          );
        } else if (statusStr === "failed") {
          const errors = statusObj.errors as Array<Record<string, unknown>>;
          const errCode = errors?.[0]?.code ? String(errors[0].code) : "WA_FAILED";
          const errTitle = errors?.[0]?.title ? String(errors[0].title) : "WhatsApp delivery failed";

          await NotificationDelivery.findOneAndUpdate(
            { provider: "WHATSAPP_CLOUD", providerMessageId: msgId },
            {
              $set: {
                status: "FAILED",
                failedAt: now,
                providerStatusCode: errCode,
                failureCategory: errCode === "131026" ? "PERMANENT_MISSING_CONSENT" : "UNKNOWN",
                failureMessage: errTitle,
                webhookTimestamp: now,
              },
            }
          );

          if (errCode === "131026" && recipientId) {
            await ConsentService.recordSuppression(recipientId, "WHATSAPP", "USER_OPT_OUT");
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[WhatsAppWebhook] Error handling webhook:", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
