"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LifeBuoy, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { createSupportRequestAction } from "@/lib/actions/portal.actions";
import { SupportCategory, SupportPriority } from "@/types/portal";

interface PortalSupportNewFormProps {
  bookings: any[];
}

export function PortalSupportNewForm({ bookings }: PortalSupportNewFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState<SupportCategory>("BOOKING_QUERY");
  const [priority, setPriority] = useState<SupportPriority>("NORMAL");
  const [bookingId, setBookingId] = useState(bookings[0]?._id?.toString() || "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim() || !description.trim()) {
      setError("Please fill in both the subject and description.");
      return;
    }

    startTransition(async () => {
      const res = await createSupportRequestAction({
        category,
        priority,
        bookingId: bookingId || undefined,
        subject,
        description,
      });

      if (!res.success) {
        setError(res.error || "Failed to create support request.");
      } else {
        router.push("/portal/support");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/portal/support"
        className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Support</span>
      </Link>

      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Open a Support Request
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Our luxury customer success desk responds to all requests within 4 business hours.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value="BOOKING_QUERY" className="bg-[#071a28]">Booking Inquiry</option>
                <option value="PAYMENT_AND_RECEIPTS" className="bg-[#071a28]">Payments & Receipts</option>
                <option value="KYC_DOCUMENTATION" className="bg-[#071a28]">KYC & Verification</option>
                <option value="SITE_VISIT" className="bg-[#071a28]">Site Visits</option>
                <option value="CONVEYANCE_AND_REGISTRATION" className="bg-[#071a28]">Conveyance & Registration</option>
                <option value="TECHNICAL_ISSUE" className="bg-[#071a28]">Portal Technical Issue</option>
                <option value="GENERAL_INQUIRY" className="bg-[#071a28]">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value="LOW" className="bg-[#071a28]">Low</option>
                <option value="NORMAL" className="bg-[#071a28]">Normal</option>
                <option value="HIGH" className="bg-[#071a28]">High</option>
                <option value="URGENT" className="bg-[#071a28]">Urgent</option>
              </select>
            </div>
          </div>

          {bookings.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Related Booking (Optional)
              </label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              >
                <option value="" className="bg-[#071a28]">None</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id.toString()} className="bg-[#071a28]">
                    {b.bookingNumber} — {b.propertyId?.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Summary of your inquiry..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your inquiry or issue with full details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <Link
              href="/portal/support"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-lg flex items-center space-x-2"
            >
              <span>{isPending ? "Submitting..." : "Submit Ticket"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
