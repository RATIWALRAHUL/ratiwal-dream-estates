import React from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/guard";
import { BookingService } from "@/lib/services/booking.service";

export const dynamic = "force-dynamic";

interface BookingsPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  await requireAdminSession(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const params = await searchParams;

  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10);

  const { bookings, total } = await BookingService.listBookings({
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
              PRD 14 • Operational Bookings
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Operational Bookings Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified booking records locking units as SOLD with mandatory compliance checklists.
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

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.06)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#fbfaf8] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking #</th>
                <th className="py-3.5 px-4">Unit & Property</th>
                <th className="py-3.5 px-4">Deal / Buyer</th>
                <th className="py-3.5 px-4">Contract Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Confirmed At</th>
                <th className="py-3.5 px-4">Confirmed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No confirmed bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#071a28]">
                        {b.unitNumber ? `Unit ${b.unitNumber}` : "Allocated Unit"}
                      </div>
                      <div className="text-[11px] text-slate-500">{b.propertyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/deals/${b.dealId}`}
                        className="font-bold text-[#071a28] hover:text-[#c5a880] transition-colors"
                      >
                        {b.dealNumber}
                      </Link>
                      <div className="text-[11px] text-slate-500">{b.leadName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      ₹{b.finalAmountRupees.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.confirmedAt ? new Date(b.confirmedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{b.confirmedByName || "Staff"}</td>
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
