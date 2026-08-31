import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminSession } from "@/lib/auth/guard";
import { HoldService } from "@/lib/services/hold.service";

export const dynamic = "force-dynamic";

interface HoldsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function HoldsPage({ searchParams }: HoldsPageProps) {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const params = await searchParams;

  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10);

  const { holds, total } = await HoldService.listHolds({
    status: status === "ALL" ? undefined : status,
    page,
    perPage: 25,
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
              PRD 14 • Operational Holds
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Inventory Holds Register</h1>
          <p className="text-xs md:text-sm text-[#647581] mt-0.5">
            Atomic temporary locks on sellable units with automated 72h TTL expiration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/deals"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[rgba(7,26,40,0.12)] text-[#071a28] font-semibold text-xs hover:bg-stone-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Deals</span>
          </Link>
        </div>
      </div>

      {/* Holds Table */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-[#647581] font-semibold">
                <th className="py-3.5 px-4 text-[#071a28]">Hold Number</th>
                <th className="py-3.5 px-4 text-[#071a28]">Unit & Property</th>
                <th className="py-3.5 px-4 text-[#071a28]">Deal / Buyer</th>
                <th className="py-3.5 px-4 text-[#071a28]">Status</th>
                <th className="py-3.5 px-4 text-[#071a28]">Starts At</th>
                <th className="py-3.5 px-4 text-[#071a28]">Expires At</th>
                <th className="py-3.5 px-4 text-[#071a28]">Held By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
              {holds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#647581]">
                    No inventory holds found.
                  </td>
                </tr>
              ) : (
                holds.map((h) => {
                  const isExpired = new Date(h.expiresAt) <= new Date() && h.status === "ACTIVE";
                  return (
                    <tr key={h._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{h.holdNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#071a28]">
                          {h.unitNumber ? `Unit ${h.unitNumber}` : "Allocated Unit"}
                        </div>
                        <div className="text-[11px] text-[#647581]">{h.propertyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/deals/${h.dealId}`}
                          className="font-bold text-[#071a28] hover:text-[#0088cc] transition-colors"
                        >
                          {h.dealNumber}
                        </Link>
                        <div className="text-[11px] text-[#647581]">{h.leadName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            h.status === "ACTIVE"
                              ? isExpired
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-stone-100 text-stone-600 border border-stone-200"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : h.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#647581]">
                        {new Date(h.startsAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-semibold ${isExpired ? "text-rose-600" : "text-[#071a28]"}`}>
                          {new Date(h.expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#071a28]">{h.heldByName || "Advisor"}</td>
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
