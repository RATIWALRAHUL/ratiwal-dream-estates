import React from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/guard";
import { ReservationService } from "@/lib/services/reservation.service";

export const dynamic = "force-dynamic";

interface ReservationsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const params = await searchParams;

  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10);

  const { reservations, total } = await ReservationService.listReservations({
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
              PRD 14 • Unit Reservations
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Reservations Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured unit reservations backed by approved pricing proposals and buyer commitments.
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

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fbfaf8] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Reservation #</th>
                <th className="py-3.5 px-4">Unit & Property</th>
                <th className="py-3.5 px-4">Deal / Buyer</th>
                <th className="py-3.5 px-4">Reserved Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Reserved On</th>
                <th className="py-3.5 px-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{r.reservationNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#071a28]">
                        {r.unitNumber ? `Unit ${r.unitNumber}` : "Allocated Unit"}
                      </div>
                      <div className="text-[11px] text-slate-500">{r.propertyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/deals/${r.dealId}`}
                        className="font-bold text-[#071a28] hover:text-[#c5a880] transition-colors"
                      >
                        {r.dealNumber}
                      </Link>
                      <div className="text-[11px] text-slate-500">{r.leadName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      ₹{r.finalAmountRupees.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "ACTIVE"
                            ? "bg-indigo-100 text-indigo-900"
                            : r.status === "CONVERTED_TO_BOOKING"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(r.reservationDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.approvedByName || r.createdByName || "Staff"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
