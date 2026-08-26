import "server-only";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { KycCaseService } from "@/lib/services/kyc-case.service";
import { KycCaseWorkspace } from "@/components/dashboard/kyc/KycCaseWorkspace";
import { KycCaseWorkspaceSkeleton } from "@/components/dashboard/kyc/KycSkeletons";

export const metadata = {
  title: "KYC Case Workspace | Admin Dashboard",
  description: "Identity verification and compliance workspace for property buyer.",
};

export default async function KycCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  try {
    const caseData = await KycCaseService.getCaseDetails(caseId);

    return (
      <Suspense fallback={<KycCaseWorkspaceSkeleton />}>
        <KycCaseWorkspace caseData={caseData} />
      </Suspense>
    );
  } catch (error) {
    notFound();
  }
}
