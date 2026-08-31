import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { LegalChecklistService } from "@/lib/services/legal-checklist.service";
import { PropertyChecklistCard } from "@/components/dashboard/legal-vault/PropertyChecklistCard";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Property Legal Checklists | Ratiwal Dream Estates Dashboard",
  description: "Statutory compliance checklists, missing documents, and property document readiness.",
};

export default async function LegalChecklistsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  await LegalChecklistService.seedDefaultTemplates(session.user.id);

  const properties = await Property.find().select("title").lean();

  const checklists = await Promise.all(
    properties.map(async (p) => {
      const cl = await LegalChecklistService.evaluatePropertyChecklist(p._id.toString(), session.user.id);
      return {
        propertyId: p._id.toString(),
        propertyName: p.title,
        items: cl.items,
        readinessPercentage: cl.readinessPercentage,
      };
    })
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
          Property Statutory Checklists & Readiness
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Document readiness evaluation against statutory Rajasthan Plotted & Township compliance standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((cl) => (
          <PropertyChecklistCard
            key={cl.propertyId}
            propertyId={cl.propertyId}
            propertyName={cl.propertyName}
            items={cl.items}
            readinessPercentage={cl.readinessPercentage}
          />
        ))}
      </div>
    </div>
  );
}
