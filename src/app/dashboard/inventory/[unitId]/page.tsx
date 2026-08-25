import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryUnit } from "@/models/InventoryUnit";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { InventoryPriceHistory } from "@/models/InventoryPriceHistory";
import { Property } from "@/models/Property";
import {
  ArrowLeft,
  Building,
  Edit,
  History,
  Clock,
  Tag,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { paiseToRupees } from "@/lib/utils/currency";

export const metadata: Metadata = {
  title: "Unit Details & History | Ratiwal Dream Estates Dashboard",
  description: "Unit specifications, lifecycle status history, and price change timeline.",
};

interface UnitDetailPageProps {
  params: Promise<{ unitId: string }>;
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  const { unitId } = await params;
  await connectToDatabase();

  const [unit, statusHistory, priceHistory] = await Promise.all([
    InventoryUnit.findById(unitId).lean(),
    InventoryStatusHistory.find({ unitId }).sort({ changedAt: -1 }).lean(),
    InventoryPriceHistory.find({ unitId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!unit) notFound();

  const property = await Property.findById(unit.propertyId).select("title slug").lean();

  const area = unit.plotAreaSqFt || unit.superBuiltUpAreaSqFt || unit.builtUpAreaSqFt || unit.carpetAreaSqFt || 0;
  const areaSqYd = area ? Math.round((area / 9) * 100) / 100 : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/inventory"
            className="inline-flex items-center gap-1.5 text-xs text-[#647581] hover:text-[#071a28] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inventory</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight">
              Unit {unit.unitNumber}
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#087fc3]/10 text-[#087fc3] font-mono text-xs font-bold">
              {unit.referenceCode}
            </span>
          </div>
          <p className="text-xs text-[#647581] mt-1">
            {property?.title} • {[unit.phaseName, unit.towerBlockSector, unit.floorLevel].filter(Boolean).join(" • ") || "Main Block"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/inventory/${unitId}/edit`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Specifications</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Unit Specs & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Physical Specifications */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
              Physical & Structural Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#f8f7f4]">
                <span className="text-[10px] text-[#647581] block uppercase">Category</span>
                <span className="font-bold text-[#071a28] text-sm">{unit.unitCategory.replace(/_/g, " ")}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f7f4]">
                <span className="text-[10px] text-[#647581] block uppercase">Configuration</span>
                <span className="font-bold text-[#071a28] text-sm">{unit.configuration}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f7f4]">
                <span className="text-[10px] text-[#647581] block uppercase">Primary Area</span>
                <span className="font-bold text-[#071a28] text-sm">{area} sq.ft</span>
                {areaSqYd && <span className="text-[10px] text-[#647581] block font-mono">({areaSqYd} sq.yd)</span>}
              </div>

              {unit.facing && (
                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Facing Direction</span>
                  <span className="font-bold text-[#071a28] text-sm">{unit.facing.replace(/_/g, " ")}</span>
                </div>
              )}

              {unit.cornerUnit && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block uppercase font-bold">Corner Advantage</span>
                  <span className="font-bold text-emerald-900 text-sm">Corner Unit / Plot</span>
                </div>
              )}

              {unit.bedrooms && (
                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Bedrooms & Baths</span>
                  <span className="font-bold text-[#071a28] text-sm">{unit.bedrooms} BHK / {unit.bathrooms || 0} Baths</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Matrix */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
              Pricing Breakdown (INR)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#f8f7f4]">
                <span className="text-[10px] text-[#647581] block uppercase">Base Price</span>
                <span className="font-bold text-[#071a28] text-base">
                  {unit.basePricePaise ? `₹${(unit.basePricePaise / 10000000).toFixed(2)} Cr` : "On Request"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f7f4]">
                <span className="text-[10px] text-[#647581] block uppercase">Display Price</span>
                <span className="font-bold text-[#087fc3] text-base">
                  {unit.displayPricePaise ? `₹${(unit.displayPricePaise / 10000000).toFixed(2)} Cr` : "On Request"}
                </span>
              </div>

              {session.user.role === "SUPER_ADMIN" && unit.discountCeilingPaise && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-amber-800 block uppercase font-bold">Internal Discount Ceiling</span>
                  <span className="font-bold text-amber-900 text-sm">
                    Max ₹{(unit.discountCeilingPaise / 100000).toFixed(2)} L
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Append-Only Status Lifecycle Timeline */}
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
              <h3 className="text-sm font-bold font-serif text-[#071a28] flex items-center gap-2">
                <History className="w-4 h-4 text-[#087fc3]" />
                <span>Status Lifecycle Timeline ({statusHistory.length} Transitions)</span>
              </h3>
            </div>

            <div className="space-y-4">
              {statusHistory.length === 0 ? (
                <p className="text-xs text-[#647581] italic">No status transitions logged yet.</p>
              ) : (
                statusHistory.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#f8f7f4] flex items-start justify-between text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#071a28]">
                          {item.fromStatus} → {item.toStatus}
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-slate-200 text-[#071a28] text-[9px] font-bold">
                          {item.reasonCode}
                        </span>
                      </div>
                      {item.sanitizedComment && (
                        <p className="text-[11px] text-[#647581] font-sans">{item.sanitizedComment}</p>
                      )}
                      <p className="text-[10px] text-[#8c9ba5]">By {item.changedByName || "System"}</p>
                    </div>

                    <span className="text-[10px] text-[#647581]">
                      {new Date(item.changedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Current State Card & Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#647581] font-bold">
              CURRENT INVENTORY STATUS
            </h3>

            <div className="p-4 rounded-xl bg-[#f8f7f4] space-y-2">
              <span className="text-2xl font-bold font-serif text-[#071a28] block">
                {unit.status}
              </span>
              <span className="text-xs text-[#647581] block">
                Visibility: <strong>{unit.visibility}</strong>
              </span>
              <span className="text-[10px] font-mono text-[#8c9ba5] block">
                Version: {unit.version}
              </span>
            </div>

            {unit.internalNotes && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">
                  Internal Staff Notes
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-sans">
                  {unit.internalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
