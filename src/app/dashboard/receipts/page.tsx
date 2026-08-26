import "server-only";
import { PaymentReceipt } from "@/models/PaymentReceipt";
import { PaymentReceiptsView } from "@/components/dashboard/payments/PaymentReceiptsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Receipts Directory | Admin Dashboard",
  description: "View and manage issued official payment acknowledgement receipts.",
};

export default async function PaymentReceiptsPage() {
  const receipts = await PaymentReceipt.find()
    .populate("bookingId", "bookingNumber")
    .populate("partyId", "displayName")
    .sort({ createdAt: -1 })
    .lean();

  return <PaymentReceiptsView receipts={receipts} />;
}
