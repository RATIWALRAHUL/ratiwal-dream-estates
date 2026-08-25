import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { UnitForm } from "@/components/dashboard/inventory/UnitForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Add Inventory Unit / Plot | Ratiwal Dream Estates Dashboard",
  description: "Register a new sellable apartment unit, commercial space, villa, or plotted asset.",
};

export default async function NewInventoryUnitPage() {
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
          Register New Sellable Unit or Plot
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Create individual sellable units with deterministic inventory keys and category-conditional dimensions.
        </p>
      </div>

      <UnitForm properties={properties.map((p) => ({ _id: p._id.toString(), title: p.title }))} />
    </div>
  );
}
