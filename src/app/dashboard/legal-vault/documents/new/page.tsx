import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { LegalDocumentForm } from "@/components/dashboard/legal-vault/LegalDocumentForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Upload Legal Document | Ratiwal Dream Estates Dashboard",
  description: "Register and upload statutory compliance documents, title deeds, and NOCs.",
};

interface NewLegalDocumentPageProps {
  searchParams: Promise<{
    propertyId?: string;
    category?: string;
    checklistItemKey?: string;
  }>;
}

export default async function NewLegalDocumentPage({ searchParams }: NewLegalDocumentPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  const properties = await Property.find().select("title").sort({ title: 1 }).lean();
  const params = await searchParams;

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
          Register & Upload Legal Document
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Upload statutory title deeds, JDA conversion orders, RERA certificates, and municipal NOCs.
        </p>
      </div>

      <LegalDocumentForm
        properties={properties.map((p) => ({ _id: p._id.toString(), title: p.title }))}
        initialPropertyId={params.propertyId}
        initialCategory={params.category}
        initialChecklistItemKey={params.checklistItemKey}
      />
    </div>
  );
}
