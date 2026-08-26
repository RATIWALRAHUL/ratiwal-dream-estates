import "server-only";
import { ManualPaymentSubmission } from "@/models/ManualPaymentSubmission";
import { ManualPaymentReviewView } from "@/components/dashboard/payments/ManualPaymentReviewView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Offline Payments Verification Queue | Admin Dashboard",
  description: "Review and verify NEFT, RTGS, cheque, and offline payments.",
};

export default async function ManualPaymentsPage() {
  const submissions = await ManualPaymentSubmission.find()
    .populate("bookingId", "bookingNumber")
    .populate("partyId", "displayName")
    .sort({ createdAt: -1 })
    .lean();

  return <ManualPaymentReviewView submissions={submissions} />;
}
