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

export class MockPaymentAdapter implements PaymentProviderAdapter {
  public providerName = "MOCK" as const;
  public providerMode = "test" as const;
  private keySecret = "mock_secret_key_for_testing";

  public async createOrder(params: CreateOrderParams): Promise<ProviderOrderResult> {
    const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
    return {
      providerOrderId: orderId,
      amountPaise: params.amountPaise,
      currency: params.currency || "INR",
      status: "created",
      checkoutKeyId: "rzp_test_mock_public_key_12345",
    };
  }

  public verifyCheckoutSignature(params: VerifyCheckoutSignatureParams): boolean {
    if (!params.providerSignature) return false;
    // Standard HMAC check or simulation
    const expected = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${params.providerOrderId}|${params.providerPaymentId}`)
      .digest("hex");

    return (
      params.providerSignature === expected ||
      params.providerSignature.startsWith("mock_valid_signature_")
    );
  }

  public verifyWebhookSignature(params: VerifyWebhookSignatureParams): boolean {
    if (!params.signature) return false;
    const bodyStr = typeof params.rawBody === "string" ? params.rawBody : params.rawBody.toString("utf8");
    const expected = crypto
      .createHmac("sha256", params.webhookSecret || this.keySecret)
      .update(bodyStr)
      .digest("hex");

    return (
      params.signature === expected ||
      params.signature.startsWith("mock_valid_webhook_sig_")
    );
  }

  public async fetchPayment(providerPaymentId: string): Promise<PaymentDetailsResult> {
    return {
      providerPaymentId,
      amountPaise: 100000,
      currency: "INR",
      status: "captured",
      method: "UPI",
      capturedAt: new Date(),
      vpa: "buyer@okhdfcbank",
    };
  }

  public async createRefund(params: CreateRefundParams): Promise<ProviderRefundResult> {
    const refundId = `rfnd_mock_${crypto.randomBytes(8).toString("hex")}`;
    return {
      providerRefundId: refundId,
      providerPaymentId: params.providerPaymentId,
      amountPaise: params.amountPaise,
      currency: "INR",
      status: "processed",
    };
  }
}
