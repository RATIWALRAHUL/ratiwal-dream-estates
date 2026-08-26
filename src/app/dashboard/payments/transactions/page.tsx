import "server-only";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { PaymentTransactionList } from "@/components/dashboard/payments/PaymentTransactionList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Transactions Ledger | Admin Dashboard",
  description: "View all payment gateway and offline transactions.",
};

export default async function PaymentTransactionsPage() {
  const transactions = await PaymentTransaction.find()
    .populate("bookingId", "bookingNumber")
    .populate("partyId", "displayName")
    .sort({ createdAt: -1 })
    .lean();

  return <PaymentTransactionList transactions={transactions} />;
}
