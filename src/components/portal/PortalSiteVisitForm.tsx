"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { requestSiteVisitFromPortalAction } from "@/lib/actions/portal.actions";

interface PortalSiteVisitFormProps {
  bookings: any[];
}

export function PortalSiteVisitForm({ bookings }: PortalSiteVisitFormProps) {
  const router = useRouter();
  const [selectedBookingId, setSelectedBookingId] = useState(bookings[0]?._id?.toString() || "");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTimeSlot, setPreferredTimeSlot] = useState("Morning (10:00 AM - 1:00 PM)");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedBooking = bookings.find((b) => b._id.toString() === selectedBookingId) || bookings[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBooking?.propertyId?._id) {
      setError("Please select a valid property booking.");
      return;
    }

    if (!preferredDate) {
      setError("Please choose your preferred visit date.");
      return;
    }

    startTransition(async () => {
      const res = await requestSiteVisitFromPortalAction({
        propertyId: selectedBooking.propertyId._id.toString(),
        bookingId: selectedBooking._id.toString(),
        preferredDate,
        preferredTimeSlot,
        notes,
      });

      if (!res.success) {
        setError(res.error || "Failed to schedule site visit.");
      } else {
        router.push("/portal/site-visits");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/portal/site-visits"
        className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Site Visits</span>
      </Link>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Schedule an On-Site Inspection
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Our luxury relationship managers will prepare the site, documents, and private escort.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {bookings.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Booked Property
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                {bookings.map((b) => (
                  <option key={b._id} value={b._id.toString()} className="bg-[#071a28]">
                    {b.bookingNumber} — {b.propertyId?.title} (Plot #{b.unitId?.plotNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedBooking && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[11px] text-[#087fc3] uppercase font-semibold">Location</span>
              <div className="text-sm font-semibold text-white">{selectedBooking.propertyId?.title}</div>
              <div className="text-xs text-slate-400">
                Plot #{selectedBooking.unitId?.plotNumber || "N/A"} • Area: {selectedBooking.unitId?.plotAreaSqYd || "N/A"} Sq. Yds.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Preferred Time Slot
              </label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value="Morning (10:00 AM - 1:00 PM)" className="bg-[#071a28]">
                  Morning (10:00 AM - 1:00 PM)
                </option>
                <option value="Afternoon (1:00 PM - 4:00 PM)" className="bg-[#071a28]">
                  Afternoon (1:00 PM - 4:00 PM)
                </option>
                <option value="Evening (4:00 PM - 6:30 PM)" className="bg-[#071a28]">
                  Evening (4:00 PM - 6:30 PM)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specific Requirements or Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bringing family members, boundary demarcation survey requested..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <Link
              href="/portal/site-visits"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-lg flex items-center space-x-2"
            >
              <span>{isPending ? "Submitting..." : "Confirm Schedule Request"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
