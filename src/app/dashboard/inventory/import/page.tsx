import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { InventoryImportWizard } from "@/components/dashboard/inventory/InventoryImportWizard";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Bulk Inventory Import | Ratiwal Dream Estates Dashboard",
  description: "Bulk import units, villas, and plots from CSV with server-side validation and preview.",
};

export default async function InventoryImportPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();
  const properties = await Property.find().select("title").sort({ title: 1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/inventory"
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inventory</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Bulk Inventory CSV Import
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Upload structured spreadsheets, preview validated rows, and commit batch mutations.
        </p>
      </div>

      <InventoryImportWizard properties={properties.map((p) => ({ _id: p._id.toString(), title: p.title }))} />
    </div>
  );
}
