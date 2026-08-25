import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InventoryStatusHistory } from "@/models/InventoryStatusHistory";
import { InventoryUnit } from "@/models/InventoryUnit";
import { Property } from "@/models/Property";
import { ArrowLeft, History, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Inventory Transition Audit Log | Ratiwal Dream Estates Dashboard",
  description: "Complete append-only audit trail of inventory unit status transitions and pricing updates.",
};

export default async function InventoryHistoryPage() {
  const session = await getAdminSession();
  if (!session) redirect("/dashboard/login");

  await connectToDatabase();

  const [historyItems, units, properties] = await Promise.all([
    InventoryStatusHistory.find().sort({ changedAt: -1 }).limit(100).lean(),
    InventoryUnit.find().select("unitNumber referenceCode").lean(),
    Property.find().select("title").lean(),
  ]);

  const unitMap = new Map(units.map((u) => [u._id.toString(), u]));
  const propMap = new Map(properties.map((p) => [p._id.toString(), p.title]));

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
          Inventory Lifecycle & Transition Audit Log
        </h1>
        <p className="text-sm text-[#647581] mt-1">
          Append-only historical audit trail of all manual and automated status transitions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] uppercase text-[#647581]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Unit / Plot</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Transition</th>
                <th className="py-3 px-4">Reason Code</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {historyItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#647581] italic">
                    No status transition events logged yet.
                  </td>
                </tr>
              ) : (
                historyItems.map((item) => {
                  const unit = unitMap.get(item.unitId.toString());
                  const propName = propMap.get(item.propertyId.toString()) || "Property";
                  return (
                    <tr key={item._id.toString()} className="hover:bg-[#f8f7f4]/60">
                      <td className="py-3 px-4 text-[#647581]">
                        {new Date(item.changedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#071a28]">
                        <Link href={`/dashboard/inventory/${item.unitId}`} className="hover:text-[#087fc3]">
                          {unit?.unitNumber || "Unit"} ({unit?.referenceCode || "—"})
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-[#071a28] font-sans font-medium">
                        {propName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#071a28]">
                          {item.fromStatus} → {item.toStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#071a28] text-[10px] font-bold">
                          {item.reasonCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#647581] font-sans">
                        {item.changedByName || item.changedBy} ({item.changedByRole})
                      </td>
                      <td className="py-3 px-4 text-[10px] text-[#8c9ba5]">
                        {item.source}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
