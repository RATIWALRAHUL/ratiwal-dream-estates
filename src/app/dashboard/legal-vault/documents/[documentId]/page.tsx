import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LegalDocument } from "@/models/LegalDocument";
import { LegalDocumentVersion } from "@/models/LegalDocumentVersion";
import { LegalDocumentReview } from "@/models/LegalDocumentReview";
import { LegalDocumentAccessLog } from "@/models/LegalDocumentAccessLog";
import { Property } from "@/models/Property";
import { LegalDocumentDetailClient } from "@/components/dashboard/legal-vault/LegalDocumentDetailClient";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal Document Workspace | Ratiwal Dream Estates Dashboard",
  description: "Document metadata, immutable version ledger, review history, and access audit trail.",
};

interface LegalDocumentDetailPageProps {
  params: Promise<{ documentId: string }>;
}

export default async function LegalDocumentDetailPage({ params }: LegalDocumentDetailPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { documentId } = await params;
  await connectToDatabase();

  const [document, versions, reviews, accessLogs] = await Promise.all([
    LegalDocument.findById(documentId).lean(),
    LegalDocumentVersion.find({ legalDocumentId: documentId }).sort({ versionNumber: -1 }).lean(),
    LegalDocumentReview.find({ legalDocumentId: documentId }).sort({ reviewedAt: -1 }).lean(),
    LegalDocumentAccessLog.find({ legalDocumentId: documentId }).sort({ timestamp: -1 }).limit(50).lean(),
  ]);

  if (!document) notFound();

  const property = await Property.findById(document.propertyId).select("title").lean();

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
            {document.title}
          </h1>
          <span className="px-3 py-1 rounded-full bg-[#087fc3]/10 text-[#087fc3] font-mono text-xs font-bold">
            {document.documentReference}
          </span>
        </div>
        <p className="text-xs text-[#647581] mt-1 font-sans">
          {property?.title} • {document.category.replace(/_/g, " ")} • Version {document.currentVersionNumber}
        </p>
      </div>

      <LegalDocumentDetailClient
        document={JSON.parse(JSON.stringify(document))}
        versions={JSON.parse(JSON.stringify(versions))}
        reviews={JSON.parse(JSON.stringify(reviews))}
        accessLogs={JSON.parse(JSON.stringify(accessLogs))}
        userRole={session.user.role}
      />
    </div>
  );
}
