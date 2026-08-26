import { PaymentProviderAdapter } from "./adapter";
import { RazorpayAdapter } from "./razorpay";
import { MockPaymentAdapter } from "./mock";

export class PaymentProviderFactory {
  private static instance: PaymentProviderAdapter | null = null;

  public static getAdapter(provider: "RAZORPAY" | "MOCK" = "RAZORPAY"): PaymentProviderAdapter {
    if (provider === "MOCK" || process.env.NODE_ENV === "test") {
      return new MockPaymentAdapter();
    }

    if (!this.instance) {
      this.instance = new RazorpayAdapter();
    }
    return this.instance;
  }
}
