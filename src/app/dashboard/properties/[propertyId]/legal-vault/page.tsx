import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { LegalVaultService } from "@/lib/services/legal-vault.service";
import { LegalChecklistService } from "@/lib/services/legal-checklist.service";
import { LegalDocumentTable } from "@/components/dashboard/legal-vault/LegalDocumentTable";
import { PropertyChecklistCard } from "@/components/dashboard/legal-vault/PropertyChecklistCard";
import { ArrowLeft, Plus } from "lucide-react";

interface PropertyLegalVaultPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function PropertyLegalVaultPage({ params }: PropertyLegalVaultPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { propertyId } = await params;
  await connectToDatabase();

  const property = await Property.findById(propertyId).select("title").lean();
  if (!property) notFound();

  const [queryResult, checklist] = await Promise.all([
    LegalVaultService.queryDocuments({ propertyId, perPage: 50 }, session),
    LegalChecklistService.evaluatePropertyChecklist(propertyId, session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/properties/${propertyId}`}
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {property.title}</span>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            {property.title} — Legal Vault & Compliance
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Statutory title records, JDA/RERA approvals, and checklist readiness.
          </p>
        </div>

        <Link
          href={`/dashboard/legal-vault/documents/new?propertyId=${propertyId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-serif text-[#071a28]">
              Attached Legal Documents ({queryResult.total})
            </h2>
          </div>
          <LegalDocumentTable
            documents={queryResult.documents}
            total={queryResult.total}
            page={queryResult.page}
            perPage={queryResult.perPage}
          />
        </div>

        <div>
          <PropertyChecklistCard
            propertyId={propertyId}
            propertyName={property.title}
            items={checklist.items}
            readinessPercentage={checklist.readinessPercentage}
          />
        </div>
      </div>
    </div>
  );
}
