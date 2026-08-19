"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteVisitSchema, SiteVisitSchema } from "@/lib/validations/site-visit";
import { Calendar, CheckCircle2, Clock, User, Phone, Users, ShieldCheck, Video, MapPin } from "lucide-react";
import { Property } from "@/types/property";

interface EmbeddedSiteVisitProps {
  property: Property;
}

export function EmbeddedSiteVisit({ property }: EmbeddedSiteVisitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [visitType, setVisitType] = useState<"physical" | "virtual">("physical");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteVisitSchema>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      propertyId: property.id,
      propertyName: property.name,
      numberOfVisitors: 1,
      preferredDate: "",
      preferredTime: "11:00 AM",
      message: "",
      honeypot: "",
    },
  });

  const onSubmit = async (values: SiteVisitSchema) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...values,
        message: `[${visitType === "physical" ? "On-Ground Site Visit" : "Virtual Consultation"}] ${values.message || ""}`,
      };

      const response = await fetch("/api/site-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Form submission failed");
      }

      setSubmitSuccess(true);
      reset();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "An error occurred while booking. Please try again or reach out on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-site-visit" aria-labelledby="site-visit-heading" className="mb-12">
      <div className="p-7 sm:p-10 rounded-3xl bg-gradient-to-br from-[#031C2B] via-[#072435] to-[#082B3B] text-white border border-[rgba(255,255,255,0.12)] shadow-[0_16px_40px_rgba(3,28,43,0.3)] relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#52BDE9_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider mb-3">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Direct Booking</span>
            </div>
            <h2
              id="site-visit-heading"
              className="font-heading text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight tracking-tight mb-2"
            >
              Schedule a site visit or virtual consultation.
            </h2>
            <p className="text-xs sm:text-sm text-[#c5d8e4] max-w-lg mx-auto">
              Inspect on-ground boundary demarcation, sector roads, and title deeds with our local land advisors.
            </p>
          </div>

          {/* Visit Type Toggle */}
          <div className="flex rounded-2xl bg-[rgba(255,255,255,0.08)] p-1.5 border border-[rgba(255,255,255,0.12)] mb-6 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setVisitType("physical")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                visitType === "physical"
                  ? "bg-[#0784C8] text-white shadow-sm"
                  : "text-[#c5d8e4] hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Physical Site Visit</span>
            </button>

            <button
              type="button"
              onClick={() => setVisitType("virtual")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                visitType === "virtual"
                  ? "bg-[#0784C8] text-white shadow-sm"
                  : "text-[#c5d8e4] hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Virtual Consultation</span>
            </button>
          </div>

          {/* Success State */}
          {submitSuccess ? (
            <div className="p-8 rounded-2xl bg-[rgba(36,209,127,0.12)] border border-[rgba(36,209,127,0.3)] text-center text-white">
              <div className="w-12 h-12 rounded-full bg-[#24D17F] text-[#031C2B] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">
                Booking Request Confirmed
              </h3>
              <p className="text-xs sm:text-sm text-[#c5d8e4] mb-6">
                Our property advisor will contact you within 4 business hours to confirm your {visitType === "physical" ? "on-site inspection" : "virtual consultation"} itinerary for {property.name}.
              </p>
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="px-5 py-2.5 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-xs font-semibold uppercase tracking-wider transition-colors border border-[rgba(255,255,255,0.2)]"
              >
                Schedule Another Visit
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-xs text-red-200">
                  {submitError}
                </div>
              )}

              {/* Honeypot */}
              <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("honeypot")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Phone Number (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("phone")}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("preferredDate")}
                  />
                  {errors.preferredDate && <p className="text-xs text-red-400 mt-1">{errors.preferredDate.message}</p>}
                </div>

                {/* Preferred Time */}
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Preferred Time *
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("preferredTime")}
                  >
                    <option value="10:00 AM" className="bg-[#031C2B] text-white">10:00 AM - Morning</option>
                    <option value="12:00 PM" className="bg-[#031C2B] text-white">12:00 PM - Noon</option>
                    <option value="03:00 PM" className="bg-[#031C2B] text-white">03:00 PM - Afternoon</option>
                    <option value="05:00 PM" className="bg-[#031C2B] text-white">05:00 PM - Evening</option>
                  </select>
                  {errors.preferredTime && <p className="text-xs text-red-400 mt-1">{errors.preferredTime.message}</p>}
                </div>

                {/* Number of Visitors */}
                <div>
                  <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                    Visitors
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={1}
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                    {...register("numberOfVisitors", { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Specific Requirements Note */}
              <div>
                <label className="block text-xs font-bold text-[#a0b6c6] uppercase tracking-wider mb-1.5">
                  Specific Requirements or Plot Dimensions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Interested in 200 Sq. Yd corner plots, need revenue search verification report."
                  className="w-full px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#52BDE9]"
                  {...register("message")}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md focus-visible:outline disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Booking..." : `Confirm ${visitType === "physical" ? "Site Visit" : "Virtual Consultation"}`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7a93a5] text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#24D17F]" />
                <span>Your information is strictly protected under our privacy policy. No promotional spam.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
