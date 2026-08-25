import React from "react";
import Link from "next/link";
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider">
              PRD 14 • Operational Holds
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Inventory Holds Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Atomic temporary locks on sellable units with automated 72h TTL expiration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/deals"
            className="px-4 py-2 rounded-xl bg-slate-100 text-[#071a28] font-bold text-xs hover:bg-slate-200"
          >
            ← View Deals
          </Link>
        </div>
      </div>

      {/* Holds Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fbfaf8] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Hold Number</th>
                <th className="py-3.5 px-4">Unit & Property</th>
                <th className="py-3.5 px-4">Deal / Buyer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Starts At</th>
                <th className="py-3.5 px-4">Expires At</th>
                <th className="py-3.5 px-4">Held By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No inventory holds found.
                  </td>
                </tr>
              ) : (
                holds.map((h) => {
                  const isExpired = new Date(h.expiresAt) <= new Date() && h.status === "ACTIVE";
                  return (
                    <tr key={h._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{h.holdNumber}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#071a28]">
                          {h.unitNumber ? `Unit ${h.unitNumber}` : "Allocated Unit"}
                        </div>
                        <div className="text-[11px] text-slate-500">{h.propertyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/dashboard/deals/${h.dealId}`}
                          className="font-bold text-[#071a28] hover:text-[#c5a880] transition-colors"
                        >
                          {h.dealNumber}
                        </Link>
                        <div className="text-[11px] text-slate-500">{h.leadName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            h.status === "ACTIVE"
                              ? isExpired
                                ? "bg-rose-100 text-rose-800"
                                : "bg-purple-100 text-purple-900"
                              : h.status === "CONVERTED"
                              ? "bg-indigo-100 text-indigo-900"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isExpired ? "EXPIRED (Pending worker)" : h.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{new Date(h.startsAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">{new Date(h.expiresAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4 text-slate-600">{h.heldByName || "Advisor"}</td>
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
