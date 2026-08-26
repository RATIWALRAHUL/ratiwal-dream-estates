import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-[#0088cc] uppercase tracking-wider">
              PRD 14 • Operational Bookings
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28]">Operational Bookings Register</h1>
          <p className="text-xs md:text-sm text-[#647581] mt-0.5">
            Verified booking records locking units as SOLD with mandatory compliance checklists.
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

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f8f7f4] text-[#647581] font-semibold">
                <th className="py-3.5 px-4 text-[#071a28]">Booking #</th>
                <th className="py-3.5 px-4 text-[#071a28]">Unit & Property</th>
                <th className="py-3.5 px-4 text-[#071a28]">Deal / Buyer</th>
                <th className="py-3.5 px-4 text-[#071a28]">Contract Value</th>
                <th className="py-3.5 px-4 text-[#071a28]">Status</th>
                <th className="py-3.5 px-4 text-[#071a28]">Confirmed At</th>
                <th className="py-3.5 px-4 text-[#071a28]">Confirmed By</th>
                <th className="py-3.5 px-4 text-right text-[#071a28]">Payment Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.06)]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#647581]">
                    No confirmed bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#071a28]">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#071a28]">
                        {b.unitNumber ? `Unit ${b.unitNumber}` : "Allocated Unit"}
                      </div>
                      <div className="text-[11px] text-[#647581]">{b.propertyName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/dashboard/deals/${b.dealId}`}
                        className="font-bold text-[#071a28] hover:text-[#0088cc] transition-colors"
                      >
                        {b.dealNumber}
                      </Link>
                      <div className="text-[11px] text-[#647581]">{b.leadName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#071a28]">
                      ₹{b.finalAmountRupees.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#647581]">
                      {b.confirmedAt
                        ? new Date(b.confirmedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short" })
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#071a28]">{b.confirmedByName || "Staff"}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/deals/${b.dealId}`}
                        className="font-semibold text-[#0088cc] hover:underline"
                      >
                        View Deal →
                      </Link>
                    </td>
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
