import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/guard";
import { Lead } from "@/models/Lead";
import { Property } from "@/models/Property";
import { InventoryUnit } from "@/models/InventoryUnit";
import { connectToDatabase } from "@/lib/db/mongoose";
import { CreateDealForm } from "./CreateDealForm";

export const dynamic = "force-dynamic";

export default async function NewDealPage() {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  await connectToDatabase();

  const [leads, properties, units] = await Promise.all([
    Lead.find({}, "fullName email displayPhone assignedAdvisorId assignedAdvisorName")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    Property.find({ status: "PUBLISHED" }, "title slug")
      .sort({ title: 1 })
      .lean(),
    InventoryUnit.find({ status: "AVAILABLE" }, "unitNumber referenceCode propertyId basePricePaise")
      .lean(),
  ]);

  const sanitizedLeads = (leads as any[]).map((l) => ({
    _id: l._id.toString(),
    fullName: l.fullName,
    email: l.email,
    displayPhone: l.displayPhone,
    assignedAdvisorId: l.assignedAdvisorId,
    assignedAdvisorName: l.assignedAdvisorName,
  }));

  const sanitizedProperties = (properties as any[]).map((p) => ({
    _id: p._id.toString(),
    title: p.title,
    slug: p.slug,
  }));

  const sanitizedUnits = (units as any[]).map((u) => ({
    _id: u._id.toString(),
    unitNumber: u.unitNumber,
    referenceCode: u.referenceCode,
    propertyId: u.propertyId.toString(),
    basePriceRupees: Math.round(u.basePricePaise / 100),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <Link
          href="/dashboard/deals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#647581] hover:text-[#071a28] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deals & Pipeline</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 sm:p-8 shadow-[0_4px_24px_rgba(7,26,40,0.02)] space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
              Sales Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Create New Sales Deal</h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Initiate a structured sales closure deal linked to an existing buyer lead and property asset.
          </p>
        </div>

        <CreateDealForm
          leads={sanitizedLeads}
          properties={sanitizedProperties}
          units={sanitizedUnits}
        />
      </div>
    </div>
  );
}
