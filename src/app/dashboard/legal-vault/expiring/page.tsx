import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LegalVaultService } from "@/lib/services/legal-vault.service";
import { LegalDocumentTable } from "@/components/dashboard/legal-vault/LegalDocumentTable";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Expiring Documents Monitor | Ratiwal Dream Estates Dashboard",
  description: "Monitor statutory validity expiration and required document renewals.",
};

export default async function LegalExpiringPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const [expiringSoonResult, expiredResult] = await Promise.all([
    LegalVaultService.queryDocuments({ expiringWithinDays: 30, perPage: 25 }, session),
    LegalVaultService.queryDocuments({ isExpired: true, perPage: 25 }, session),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/legal-vault"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Legal Vault</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Expiring & Expired Documents Monitor
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Statutory certificates, fire NOCs, and environmental clearances requiring renewal or re-verification.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold font-serif text-[#071a28]">
            Expiring Within Next 30 Days ({expiringSoonResult.total})
          </h2>
        </div>
        <LegalDocumentTable
          documents={expiringSoonResult.documents}
          total={expiringSoonResult.total}
          page={expiringSoonResult.page}
          perPage={expiringSoonResult.perPage}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-bold font-serif text-[#071a28]">
            Expired Documents Requiring Action ({expiredResult.total})
          </h2>
        </div>
        <LegalDocumentTable
          documents={expiredResult.documents}
          total={expiredResult.total}
          page={expiredResult.page}
          perPage={expiredResult.perPage}
        />
      </div>
    </div>
  );
}
