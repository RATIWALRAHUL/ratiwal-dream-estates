import "server-only";
import { notFound } from "next/navigation";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PublicPaymentPortal } from "@/components/payments/PublicPaymentPortal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Secure Payment Portal | Ratiwal Dream Estates",
  description: "Complete your luxury land conveyance instalment online.",
};

export default async function PublicPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const payment = await PaymentTransaction.findOne({ paymentNumber: token.toUpperCase() })
    .populate("bookingId", "bookingNumber")
    .populate("partyId", "displayName")
    .lean();

  if (!payment) {
    notFound();
  }

  const checkoutKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";

  return <PublicPaymentPortal payment={payment} checkoutKeyId={checkoutKeyId} />;
}
