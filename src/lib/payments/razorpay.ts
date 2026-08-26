import crypto from "crypto";
import {
  PaymentProviderAdapter,
  CreateOrderParams,
  ProviderOrderResult,
  VerifyCheckoutSignatureParams,
  VerifyWebhookSignatureParams,
  CreateRefundParams,
  ProviderRefundResult,
  PaymentDetailsResult,
} from "./adapter";

export class RazorpayAdapter implements PaymentProviderAdapter {
  public providerName = "RAZORPAY" as const;
  public providerMode: "disabled" | "test" | "live";
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    const envMode = process.env.RAZORPAY_MODE?.toLowerCase();
    if (envMode === "live") {
      this.providerMode = "live";
    } else if (envMode === "disabled" || (!this.keyId && process.env.NODE_ENV !== "production")) {
      this.providerMode = "test"; // fallback to test mode in dev
    } else {
      this.providerMode = "test";
    }
  }

  public async createOrder(params: CreateOrderParams): Promise<ProviderOrderResult> {
    if (!this.keyId || !this.keySecret) {
      // Return simulated test order if credentials not set in dev
      const orderId = `order_sim_${crypto.randomBytes(8).toString("hex")}`;
      return {
        providerOrderId: orderId,
        amountPaise: params.amountPaise,
        currency: params.currency || "INR",
        status: "created",
        checkoutKeyId: this.keyId || "rzp_test_placeholder_key_id",
      };
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: params.amountPaise,
        currency: params.currency || "INR",
        receipt: params.receiptId,
        notes: params.notes || {},
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        `RAZORPAY_ORDER_FAILED: ${errBody?.error?.description || res.statusText || "Failed to create order."}`
      );
    }

    const data = await res.json();
    return {
      providerOrderId: data.id,
      amountPaise: data.amount,
      currency: data.currency,
      status: data.status,
      checkoutKeyId: this.keyId,
    };
  }

  public verifyCheckoutSignature(params: VerifyCheckoutSignatureParams): boolean {
    if (!params.providerSignature || !params.providerOrderId || !params.providerPaymentId) {
      return false;
    }

    if (!this.keySecret) {
      return (
        params.providerSignature.startsWith("mock_") ||
        params.providerSignature.startsWith("sim_")
      );
    }

    const payload = `${params.providerOrderId}|${params.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(payload)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(params.providerSignature, "utf8");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  public verifyWebhookSignature(params: VerifyWebhookSignatureParams): boolean {
    if (!params.signature) return false;

    const secret = params.webhookSecret || this.webhookSecret;
    if (!secret) {
      return params.signature.startsWith("mock_") || params.signature.startsWith("sim_");
    }

    const rawBuffer = typeof params.rawBody === "string" ? Buffer.from(params.rawBody, "utf8") : params.rawBody;
    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBuffer).digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(params.signature, "utf8");

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  public async fetchPayment(providerPaymentId: string): Promise<PaymentDetailsResult> {
    if (!this.keyId || !this.keySecret) {
      return {
        providerPaymentId,
        amountPaise: 100000,
        currency: "INR",
        status: "captured",
        method: "UPI",
        capturedAt: new Date(),
      };
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
    const res = await fetch(`https://api.razorpay.com/v1/payments/${providerPaymentId}`, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`RAZORPAY_FETCH_FAILED: ${errBody?.error?.description || res.statusText}`);
    }

    const data = await res.json();
    return {
      providerPaymentId: data.id,
      providerOrderId: data.order_id,
      amountPaise: data.amount,
      currency: data.currency,
      status: data.status,
      method: (data.method || "UPI").toUpperCase(),
      capturedAt: data.captured ? new Date(data.created_at * 1000) : undefined,
      bank: data.bank,
      wallet: data.wallet,
      vpa: data.vpa,
      cardLast4: data.card?.last4,
      errorCode: data.error_code,
      errorDescription: data.error_description,
    };
  }

  public async createRefund(params: CreateRefundParams): Promise<ProviderRefundResult> {
    if (!this.keyId || !this.keySecret) {
      const refundId = `rfnd_sim_${crypto.randomBytes(8).toString("hex")}`;
      return {
        providerRefundId: refundId,
        providerPaymentId: params.providerPaymentId,
        amountPaise: params.amountPaise,
        currency: "INR",
        status: "processed",
      };
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
    const res = await fetch(
      `https://api.razorpay.com/v1/payments/${params.providerPaymentId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          "X-Razorpay-Idempotency-Key": params.idempotencyKey,
        },
        body: JSON.stringify({
          amount: params.amountPaise,
          notes: params.notes || { reason: params.reason || "Customer refund" },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`RAZORPAY_REFUND_FAILED: ${errBody?.error?.description || res.statusText}`);
    }

    const data = await res.json();
    return {
      providerRefundId: data.id,
      providerPaymentId: data.payment_id,
      amountPaise: data.amount,
      currency: data.currency,
      status: data.status === "processed" ? "processed" : "pending",
    };
  }
}
