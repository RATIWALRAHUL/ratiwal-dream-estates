import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryUnit } from "@/models/InventoryUnit";
import { Property } from "@/models/Property";
import { UnitForm } from "@/components/dashboard/inventory/UnitForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Unit Specifications | Ratiwal Dream Estates Dashboard",
  description: "Update inventory unit specifications, dimensions, and notes with concurrency protection.",
};

interface EditUnitPageProps {
  params: Promise<{ unitId: string }>;
}

export default async function EditInventoryUnitPage({ params }: EditUnitPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { unitId } = await params;
  await connectToDatabase();

  const [unit, properties] = await Promise.all([
    InventoryUnit.findById(unitId).lean(),
    Property.find().select("title").sort({ title: 1 }).lean(),
  ]);

  if (!unit) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/inventory/${unitId}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Unit {unit.unitNumber}</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
          Edit Unit {unit.unitNumber} ({unit.referenceCode})
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Update specifications with optimistic concurrency version checking.
        </p>
      </div>

      <UnitForm
        properties={properties.map((p) => ({ _id: p._id.toString(), title: p.title }))}
        initialData={{
          ...unit,
          _id: unit._id.toString(),
          propertyId: unit.propertyId.toString(),
        }}
        isEdit={true}
      />
    </div>
  );
}
