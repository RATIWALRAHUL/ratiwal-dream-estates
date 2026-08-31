
import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { LegalDocument } from "@/models/LegalDocument";
import { LegalVaultService } from "@/lib/services/legal-vault.service";
import { LegalDocumentTable } from "@/components/dashboard/legal-vault/LegalDocumentTable";
import {
  FileText,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plus,
  History,
  CheckSquare,
  Lock,
  Search,
} from "lucide-react";
import { LegalVaultFilterParams } from "@/types/legal-vault";

export const metadata: Metadata = {
  title: "Secure Legal Vault & Compliance | Ratiwal Dream Estates Dashboard",
  description: "Property statutory compliance, legal checklists, versioning, and document reviews.",
};

interface LegalVaultPageProps {
  searchParams: Promise<{
    propertyId?: string;
    category?: string;
    classification?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function LegalVaultPage({ searchParams }: LegalVaultPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  const properties = await Property.find().select("title").sort({ title: 1 }).lean();

  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const filterParams: LegalVaultFilterParams = {
    propertyId: params.propertyId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (params.category as any) || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    classification: (params.classification as any) || undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: (params.status as any) || undefined,
    search: params.search,
    page,
    perPage: 25,
  };

  const [queryResult, totalCount, verifiedCount, reviewCount, expiringCount] = await Promise.all([
    LegalVaultService.queryDocuments(filterParams, session),
    LegalDocument.countDocuments({ status: { $ne: "ARCHIVED" } }),
    LegalDocument.countDocuments({ status: "INTERNALLY_VERIFIED" }),
    LegalDocument.countDocuments({ status: { $in: ["UNDER_REVIEW", "ACTION_REQUIRED"] } }),
    LegalDocument.countDocuments({
      status: "INTERNALLY_VERIFIED",
      expiryDate: { $lte: new Date(Date.now() + 30 * 86400000) },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#647581] mb-1">
            STATUTORY COMPLIANCE & TITLE DUE DILIGENCE
          </p>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            Secure Legal Vault
          </h1>
          <p className="text-sm text-[#647581] mt-1">
            Property document repositories, statutory checklists, immutable version ledgers, and internal review workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/legal-vault/checklists"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Checklists</span>
          </Link>

          <Link
            href="/dashboard/legal-vault/review"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Review Queue</span>
          </Link>

          <Link
            href="/dashboard/legal-vault/expiring"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Expiring</span>
          </Link>

          <Link
            href="/dashboard/legal-vault/access-log"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-white text-xs font-bold transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Access Log</span>
          </Link>

          <Link
            href="/dashboard/legal-vault/documents/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#647581] font-bold">Total Legal Documents</span>
          <p className="text-3xl font-bold font-serif text-[#071a28]">{totalCount}</p>
          <p className="text-[10px] text-[#647581]">Across all registered properties</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">Internally Reviewed</span>
          <p className="text-3xl font-bold font-serif text-emerald-800">{verifiedCount}</p>
          <p className="text-[10px] text-emerald-700">
            {totalCount > 0 ? `${Math.round((verifiedCount / totalCount) * 100)}% verified for internal use` : "—"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">Review / Action Pending</span>
          <p className="text-3xl font-bold font-serif text-amber-800">{reviewCount}</p>
          <p className="text-[10px] text-amber-700">Awaiting legal counsel review</p>
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-rose-700 font-bold">Expiring in 30 Days</span>
          <p className="text-3xl font-bold font-serif text-rose-800">{expiringCount}</p>
          <p className="text-[10px] text-rose-700">Statutory validity renewals</p>
        </div>
      </div>

      {/* Main Document Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-serif text-[#071a28]">
            Document Repository Explorer
          </h2>
          <span className="text-xs font-mono text-[#647581]">
            Showing {queryResult.documents.length} of {queryResult.total} documents
          </span>
        </div>

        <LegalDocumentTable
          documents={queryResult.documents}
          total={queryResult.total}
          page={queryResult.page}
          perPage={queryResult.perPage}
        />
      </div>
    </div>
  );
}
