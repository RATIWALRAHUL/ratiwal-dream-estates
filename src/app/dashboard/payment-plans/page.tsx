import "server-only";
import { Suspense } from "react";
import { PaymentPlanService } from "@/lib/services/payment-plan.service";
import { Property } from "@/models/Property";
import { PaymentPlanList } from "@/components/dashboard/payments/PaymentPlanList";
import { PaymentPlanListSkeleton } from "@/components/dashboard/payments/PaymentSkeletons";
import { PaymentPlanStatus } from "@/types/payment";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payment Plans Directory | Admin Dashboard",
  description: "Browse, filter and manage structured customer payment plans.",
};

export default async function PaymentPlansPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    propertyId?: string;
    bookingId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const [plansResult, properties] = await Promise.all([
    PaymentPlanService.getPlans({
      status: (params.status as PaymentPlanStatus) || "ALL",
      propertyId: params.propertyId,
      bookingId: params.bookingId,
      page: Number(params.page) || 1,
      limit: 20,
    }),
    Property.find({ status: { $ne: "ARCHIVED" } }).select("title slug code").lean(),
  ]);

  return (
    <Suspense fallback={<PaymentPlanListSkeleton />}>
      <PaymentPlanList
        initialPlans={plansResult.plans}
        total={plansResult.total}
        currentPage={plansResult.page}
        totalPages={plansResult.totalPages}
        properties={properties}
      />
    </Suspense>
  );
}
