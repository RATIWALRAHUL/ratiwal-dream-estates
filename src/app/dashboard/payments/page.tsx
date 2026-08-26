import "server-only";
import { Suspense } from "react";
import { PaymentTransactionService } from "@/lib/services/payment-transaction.service";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { ManualPaymentSubmission } from "@/models/ManualPaymentSubmission";
import { PaymentsOverviewView } from "@/components/dashboard/payments/PaymentsOverviewView";
import { PaymentsOverviewSkeleton } from "@/components/dashboard/payments/PaymentSkeletons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments & Financial Operations | Admin Dashboard",
  description: "Payment plans, online transactions, offline verification, receipts, and refunds.",
};

export default async function PaymentsOverviewPage() {
  const [metrics, recentTransactions, pendingManuals] = await Promise.all([
    PaymentTransactionService.getOverviewMetrics(),
    PaymentTransaction.find()
      .populate("bookingId", "bookingNumber")
      .populate("partyId", "displayName")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    ManualPaymentSubmission.find({ status: { $in: ["SUBMITTED", "UNDER_REVIEW"] } })
      .limit(5)
      .lean(),
  ]);

  return (
    <Suspense fallback={<PaymentsOverviewSkeleton />}>
      <PaymentsOverviewView
        metrics={metrics}
        recentTransactions={recentTransactions}
        pendingManuals={pendingManuals}
      />
    </Suspense>
  );
}
