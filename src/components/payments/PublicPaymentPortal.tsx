"use client";

import React, { useState, useTransition } from "react";
import Script from "next/script";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { processCheckoutReturnAction } from "@/lib/actions/payment.actions";
import { MoneyUtils } from "@/lib/utils/money";

interface PublicPaymentPortalProps {
  payment: any;
  checkoutKeyId: string;
}

export function PublicPaymentPortal({
  payment,
  checkoutKeyId,
}: PublicPaymentPortalProps) {
  const [isPending, startTransition] = useTransition();
  const [isPaid, setIsPaid] = useState(payment.status === "CAPTURED");
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePayNow = () => {
    setErrorMsg(null);

    // If Razorpay SDK is loaded
    if (typeof (window as any).Razorpay !== "undefined" && checkoutKeyId && !checkoutKeyId.includes("placeholder")) {
      const rzp = new (window as any).Razorpay({
        key: checkoutKeyId,
        amount: payment.amountPaise,
        currency: payment.currency || "INR",
        name: "Ratiwal Dream Estates",
        description: `Payment for ${payment.paymentNumber}`,
        order_id: payment.providerOrderId,
        handler: async function (response: any) {
          startTransition(async () => {
            const res = await processCheckoutReturnAction({
              paymentNumber: payment.paymentNumber,
              providerOrderId: payment.providerOrderId || response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              providerSignature: response.razorpay_signature,
            });

            if (res.success) {
              setIsPaid(true);
              setReceiptNumber((res.data as any)?.receiptNumber);
            } else {
              setErrorMsg(res.message);
            }
          });
        },
        theme: { color: "#071a28" },
      });
      rzp.open();
    } else {
      // Test / Simulated Checkout flow
      startTransition(async () => {
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        const simulatedSignature = `sim_valid_sig_${Date.now()}`;

        const res = await processCheckoutReturnAction({
          paymentNumber: payment.paymentNumber,
          providerOrderId: payment.providerOrderId || `order_sim_${Date.now()}`,
          providerPaymentId: simulatedPaymentId,
          providerSignature: simulatedSignature,
        });

        if (res.success) {
          setIsPaid(true);
          setReceiptNumber((res.data as any)?.receiptNumber);
        } else {
          setErrorMsg(res.message);
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#071a28] text-white flex flex-col items-center justify-center p-4 antialiased">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-md w-full bg-white text-[#071a28] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1 border-b border-slate-100 pb-4">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
            Ratiwal Dream Estates
          </div>
          <h1 className="text-xl font-bold font-serif tracking-tight">
            Secure Payment Gateway
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Payment Ref: {payment.paymentNumber}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isPaid ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-serif text-[#071a28]">
                Payment Received Successfully!
              </h2>
              <p className="text-xs text-slate-500">
                Your payment of {MoneyUtils.format(payment.amountPaise, payment.currency)} has been captured and allocated.
              </p>
            </div>

            {receiptNumber && (
              <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-200 text-xs space-y-1">
                <div className="text-slate-400 uppercase text-[10px] font-bold">Official Receipt</div>
                <div className="font-mono font-bold text-[#071a28] text-sm">{receiptNumber}</div>
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              A formal acknowledgement receipt has been sent to your registered email and SMS.
            </p>
          </div>
        ) : (
          <div className="space-y-6 text-xs">
            {/* Amount Box */}
            <div className="p-5 rounded-2xl bg-[#fbfaf8] border border-slate-200 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Payable Consideration
              </div>
              <div className="text-3xl font-bold font-serif text-[#071a28]">
                {MoneyUtils.format(payment.amountPaise, payment.currency)}
              </div>
              <div className="text-[11px] text-slate-500">
                Booking: {payment.bookingId?.bookingNumber || "—"}
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Purchasing Entity:</span>
                <span className="font-semibold">{payment.partyId?.displayName || "Valued Buyer"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="font-semibold">UPI, Cards, Netbanking & NEFT</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handlePayNow}
              className="w-full py-3.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#42b7e8]" />
              <span>
                {isPending ? "Processing..." : `Pay ${MoneyUtils.format(payment.amountPaise, payment.currency)}`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted • RBI & PCI-DSS Compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
