import "server-only";
import { PaymentSettingsView } from "@/components/dashboard/payments/PaymentSettingsView";

export const metadata = {
  title: "Payment Settings & Governance | Admin Dashboard",
  description: "Gateway adapters, webhook secrets, and statutory tax disclaimers.",
};

export default function PaymentSettingsPage() {
  return <PaymentSettingsView />;
}
