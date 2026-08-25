import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LegalVaultService } from "@/lib/services/legal-vault.service";
import { LegalDocumentTable } from "@/components/dashboard/legal-vault/LegalDocumentTable";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal Review Queue | Ratiwal Dream Estates Dashboard",
  description: "Queue for legal counsel and admins to verify title deeds, approvals, and statutory documents.",
};

export default async function LegalReviewQueuePage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const queryResult = await LegalVaultService.queryDocuments(
    {
      status: "UNDER_REVIEW",
      perPage: 50,
    },
    session
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/legal-vault"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Legal Vault</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Legal Review & Verification Queue
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Documents currently submitted and awaiting legal counsel review or internal verification.
        </p>
      </div>

      <LegalDocumentTable
        documents={queryResult.documents}
        total={queryResult.total}
        page={queryResult.page}
        perPage={queryResult.perPage}
      />
    </div>
  );
}
