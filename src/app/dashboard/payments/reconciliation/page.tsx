import "server-only";
import { PaymentReconciliationService } from "@/lib/services/payment-reconciliation.service";
import { PaymentReconciliationView } from "@/components/dashboard/payments/PaymentReconciliationView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Reconciliation Audit | Admin Dashboard",
  description: "Automated integrity scanner for financial ledger balances and receipts.",
};

export default async function ReconciliationPage() {
  const initialResult = await PaymentReconciliationService.runReconciliation();
  return <PaymentReconciliationView initialResult={initialResult} />;
}
