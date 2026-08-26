import "server-only";
import { notFound } from "next/navigation";
import { PaymentPlanService } from "@/lib/services/payment-plan.service";
import { PaymentPlanWorkspace } from "@/components/dashboard/payments/PaymentPlanWorkspace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Plan Workspace | Admin Dashboard",
  description: "Milestone payment plan and instalment schedule.",
};

export default async function PaymentPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  try {
    const planData = await PaymentPlanService.getPlanDetails(planId);
    return <PaymentPlanWorkspace planData={planData} />;
  } catch (error) {
    notFound();
  }
}
