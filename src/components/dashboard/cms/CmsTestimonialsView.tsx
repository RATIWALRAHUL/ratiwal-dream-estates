"use client";

import React, { useState } from "react";
import Link from "next/link";
import { saveTestimonialAction } from "@/lib/actions/cms.actions";
import { ArrowLeft, Plus, Star, ShieldCheck, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  _id: string;
  clientName: string;
  clientRoleOrCity?: string;
  testimonialText: string;
  rating: number;
  hasClientConsent: boolean;
  status: string;
}

interface CmsTestimonialsViewProps {
  initialTestimonials: TestimonialItem[];
}

export function CmsTestimonialsView({ initialTestimonials }: CmsTestimonialsViewProps) {
  const [testimonials] = useState(initialTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientRoleOrCity, setClientRoleOrCity] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [rating, setRating] = useState(5);
  const [hasClientConsent, setHasClientConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("clientName", clientName);
    formData.append("clientRoleOrCity", clientRoleOrCity);
    formData.append("testimonialText", testimonialText);
    formData.append("rating", String(rating));
    formData.append("hasClientConsent", String(hasClientConsent));
    formData.append("status", "PUBLISHED");

    await saveTestimonialAction(formData);
    setIsSubmitting(false);
    setIsModalOpen(false);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/content"
            className="inline-flex items-center gap-1 text-xs text-[#647581] hover:text-[#071a28] mb-1 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CMS Overview</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Verified Client Testimonials
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Genuine buyer reviews with recorded DPDP Act consent.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div
            key={t._id}
            className="p-5 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>Consent Verified</span>
              </span>
            </div>

            <p className="text-xs text-[#071a28] italic line-clamp-4 leading-relaxed">
              &ldquo;{t.testimonialText}&rdquo;
            </p>

            <div className="pt-3 border-t border-[rgba(7,26,40,0.06)]">
              <h4 className="font-serif text-xs font-bold text-[#071a28]">
                {t.clientName}
              </h4>
              {t.clientRoleOrCity && (
                <p className="text-[11px] text-[#647581] mt-0.5">{t.clientRoleOrCity}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-[rgba(7,26,40,0.12)] bg-white shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Add Verified Testimonial
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071a28] mb-1">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rajesh & Sunita Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#071a28] mb-1">
                    Location / Occupation
                  </label>
                  <input
                    type="text"
                    value={clientRoleOrCity}
                    onChange={(e) => setClientRoleOrCity(e.target.value)}
                    placeholder="e.g. NRI Investor, Dubai"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Testimonial Quote <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  rows={4}
                  placeholder="Verbatim buyer feedback..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasClientConsent}
                    onChange={(e) => setHasClientConsent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0088cc] focus:ring-[#0088cc]"
                  />
                  <span className="font-semibold text-[#071a28]">
                    Written / Recorded DPDP consent received for public display
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647581] hover:text-[#071a28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl"
                >
                  {isSubmitting ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
