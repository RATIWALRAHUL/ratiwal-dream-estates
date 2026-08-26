import "server-only";
import { Suspense } from "react";
import { KycCaseService } from "@/lib/services/kyc-case.service";
import { KycOverviewView } from "@/components/dashboard/kyc/KycOverviewView";
import { KycOverviewSkeleton } from "@/components/dashboard/kyc/KycSkeletons";

export const metadata = {
  title: "Customer KYC & Verification | Admin Dashboard",
  description: "Customer identity verification, document compliance, and DPDPA management.",
};

export default async function KycOverviewPage() {
  const [metrics, casesResult] = await Promise.all([
    KycCaseService.getOverviewMetrics(),
    KycCaseService.getCases({ limit: 6 }),
  ]);

  return (
    <Suspense fallback={<KycOverviewSkeleton />}>
      <KycOverviewView metrics={metrics} recentCases={casesResult.cases} />
    </Suspense>
  );
}
