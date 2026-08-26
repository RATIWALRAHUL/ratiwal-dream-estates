import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
              PRD 14 • Unit Reservations
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Reservations Register</h1>
          <p className="text-xs md:text-sm text-[#647581] mt-0.5">
            Structured unit reservations backed by approved pricing proposals and buyer commitments.
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

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-[#647581] font-semibold">
                <th className="py-3.5 px-4 text-[#071a28]">Reservation #</th>
                <th className="py-3.5 px-4 text-[#071a28]">Unit & Property</th>
                <th className="py-3.5 px-4 text-[#071a28]">Deal / Buyer</th>
                <th className="py-3.5 px-4 text-[#071a28]">Reserved Price</th>
                <th className="py-3.5 px-4 text-[#071a28]">Status</th>
                <th className="py-3.5 px-4 text-[#071a28]">Reserved On</th>
                <th className="py-3.5 px-4 text-[#071a28]">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#647581]">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{r.reservationNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#071a28]">
                        {r.unitNumber ? `Unit ${r.unitNumber}` : "Allocated Unit"}
                      </div>
                      <div className="text-[11px] text-[#647581]">{r.propertyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/deals/${r.dealId}`}
                        className="font-bold text-[#071a28] hover:text-[#0088cc] transition-colors"
                      >
                        {r.dealNumber}
                      </Link>
                      <div className="text-[11px] text-[#647581]">{r.leadName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      ₹{r.finalAmountRupees.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === "ACTIVE"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : r.status === "CONVERTED_TO_BOOKING"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#647581]">
                      {new Date(r.reservationDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short" })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#071a28]">{r.approvedByName || r.createdByName || "Advisor"}</td>
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
