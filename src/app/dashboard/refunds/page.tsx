import "server-only";
import { RefundRequest } from "@/models/RefundRequest";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { RefundsManagementView } from "@/components/dashboard/payments/RefundsManagementView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refunds & Settlements | Admin Dashboard",
  description: "Customer payment refunds, cancellations, and return workflows.",
};

export default async function RefundsPage() {
  const [refundRequests, eligiblePayments] = await Promise.all([
    RefundRequest.find()
      .populate("bookingId", "bookingNumber")
      .populate("partyId", "displayName")
      .sort({ createdAt: -1 })
      .lean(),
    PaymentTransaction.find({ status: { $in: ["CAPTURED", "PARTIALLY_REFUNDED"] } })
      .populate("bookingId", "bookingNumber")
      .limit(50)
      .lean(),
  ]);

  return (
    <RefundsManagementView
      refundRequests={refundRequests}
      eligiblePayments={eligiblePayments}
    />
  );
}
