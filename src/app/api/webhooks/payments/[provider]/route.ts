import { NextRequest, NextResponse } from "next/server";
import { PaymentWebhookService } from "@/lib/services/payment-webhook.service";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const providerUpper = provider.toUpperCase() as "RAZORPAY" | "MOCK";

    const signature =
      request.headers.get("x-razorpay-signature") ||
      request.headers.get("x-signature") ||
      "";

    const providerEventId =
      request.headers.get("x-razorpay-event-id") ||
      request.headers.get("x-event-id") ||
      `evt_${Date.now()}`;

    // Read raw buffer for HMAC verification
    const rawBuffer = Buffer.from(await request.arrayBuffer());
    let payload = {};
    try {
      payload = JSON.parse(rawBuffer.toString("utf8"));
    } catch {
      // Ignored
    }

    const result = await PaymentWebhookService.processWebhook({
      provider: providerUpper,
      rawBody: rawBuffer,
      signature,
      providerEventId,
      payload,
    });

    return NextResponse.json({
      received: true,
      status: result.status || "OK",
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Webhook processing error" },
      { status: 400 }
    );
  }
}
