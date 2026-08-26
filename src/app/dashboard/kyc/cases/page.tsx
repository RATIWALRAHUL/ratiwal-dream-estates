import "server-only";
import { Suspense } from "react";
import { KycCaseService } from "@/lib/services/kyc-case.service";
import { Property } from "@/models/Property";
import { KycCaseList } from "@/components/dashboard/kyc/KycCaseList";
import { KycCaseListSkeleton } from "@/components/dashboard/kyc/KycSkeletons";
import { KycCaseStatus } from "@/types/kyc";

export const metadata = {
  title: "KYC Cases Directory | Admin Dashboard",
  description: "Browse, filter and manage customer KYC verification cases.",
};

export default async function KycCasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    propertyId?: string;
    blockingBookingOnly?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;

  const [casesResult, properties] = await Promise.all([
    KycCaseService.getCases({
      status: (params.status as KycCaseStatus) || "ALL",
      propertyId: params.propertyId,
      blockingBookingOnly: params.blockingBookingOnly === "true",
      searchQuery: params.search,
      page: Number(params.page) || 1,
      limit: 20,
    }),
    Property.find({ status: { $ne: "ARCHIVED" } }).select("title slug code").lean(),
  ]);

  return (
    <Suspense fallback={<KycCaseListSkeleton />}>
      <KycCaseList
        initialCases={casesResult.cases}
        total={casesResult.total}
        currentPage={casesResult.page}
        totalPages={casesResult.totalPages}
        properties={properties}
      />
    </Suspense>
  );
}
