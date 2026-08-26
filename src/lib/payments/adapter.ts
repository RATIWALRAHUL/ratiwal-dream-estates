import { PaymentMethod, PaymentProvider } from "@/types/payment";

export interface CreateOrderParams {
  amountPaise: number;
  currency: string;
  receiptId: string;
  notes?: Record<string, string>;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface ProviderOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  status: "created" | "attempted" | "paid";
  checkoutKeyId: string;
}

export interface VerifyCheckoutSignatureParams {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
}

export interface VerifyWebhookSignatureParams {
  rawBody: string | Buffer;
  signature: string;
  webhookSecret: string;
}

export interface CreateRefundParams {
  providerPaymentId: string;
  amountPaise: number;
  reason?: string;
  idempotencyKey: string;
  notes?: Record<string, string>;
}

export interface ProviderRefundResult {
  providerRefundId: string;
  providerPaymentId: string;
  amountPaise: number;
  currency: string;
  status: "created" | "pending" | "processed" | "failed";
}

export interface PaymentDetailsResult {
  providerPaymentId: string;
  providerOrderId?: string;
  amountPaise: number;
  currency: string;
  status: "captured" | "authorized" | "failed" | "refunded";
  method: PaymentMethod;
  capturedAt?: Date;
  bank?: string;
  wallet?: string;
  vpa?: string;
  cardLast4?: string;
  errorCode?: string;
  errorDescription?: string;
}

export interface PaymentProviderAdapter {
  providerName: PaymentProvider;
  providerMode: "disabled" | "test" | "live";

  createOrder(params: CreateOrderParams): Promise<ProviderOrderResult>;
  verifyCheckoutSignature(params: VerifyCheckoutSignatureParams): boolean;
  verifyWebhookSignature(params: VerifyWebhookSignatureParams): boolean;
  fetchPayment(providerPaymentId: string): Promise<PaymentDetailsResult>;
  createRefund(params: CreateRefundParams): Promise<ProviderRefundResult>;
}
