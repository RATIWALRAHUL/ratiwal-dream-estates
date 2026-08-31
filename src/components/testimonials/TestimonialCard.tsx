"use client";

import { useState } from "react";
import Link from "next/link";
import { Quote, Star, ShieldCheck, MapPin, Info } from "lucide-react";
import { Testimonial } from "@/types/testimonial";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const displayLocation = testimonial.consentScope.showLocation && testimonial.city
    ? `${testimonial.city}, ${testimonial.state}`
    : testimonial.state || "Verified Client";

  const isLongQuote = testimonial.quote.length > 220;

  return (
    <article
      className="bg-white rounded-2xl p-6 sm:p-7 border border-[rgba(7,26,40,0.1)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_12px_32px_rgba(7,26,40,0.08)] hover:border-[rgba(7,132,200,0.3)] transition-all duration-300 flex flex-col justify-between"
      aria-labelledby={`test-card-client-${testimonial.id}`}
    >
      <div>
        {/* Card Header: Category Badge & Verified Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {testimonial.propertyType && (
              <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#edf5f9] text-[#076fa7] font-semibold">
                {testimonial.propertyType}
              </span>
            )}
          </div>

          {/* Verified Tooltip Badge */}
          {testimonial.verified && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(36,209,127,0.12)] border border-[rgba(36,209,127,0.3)] text-[#10854d] text-[11px] font-bold tracking-tight focus-visible:outline"
                aria-label="Verified client story explanation"
              >
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Verified Client</span>
                <Info className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {showTooltip && (
                <div
                  role="tooltip"
                  className="absolute right-0 top-full mt-2 w-64 p-3 rounded-xl bg-[#031C2B] text-white text-[11.5px] leading-relaxed shadow-xl z-20 border border-[rgba(255,255,255,0.15)] animate-in fade-in duration-200"
                >
                  <p className="font-semibold text-[#52BDE9] mb-1">Internal Verification Standard:</p>
                  <p className="text-[#c5d8e4]">
                    {testimonial.verificationMethod ||
                      "Verified means Ratiwal Dream Estates has confirmed this review is connected to a genuine advisory interaction or transaction record."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Stars (when available) */}
        {testimonial.rating && (
          <div className="flex items-center gap-1 text-[#d3a34e] mb-3" aria-label={`${testimonial.rating} out of 5 stars`}>
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-current" />
            ))}
          </div>
        )}

        {/* Quote Content */}
        <div className="relative mb-5">
          <Quote className="w-8 h-8 text-[#0784C8] opacity-15 mb-2 -ml-1" aria-hidden="true" />
          <p className={`text-sm text-[#2c3e50] leading-relaxed italic ${!isExpanded && isLongQuote ? "line-clamp-4" : ""}`}>
            “{testimonial.quote}”
          </p>

          {isLongQuote && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-[#0784C8] hover:underline mt-2 inline-block"
            >
              {isExpanded ? "Show less" : "Read full review"}
            </button>
          )}
        </div>
      </div>

      {/* Card Footer: Client Identity */}
      <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0784C8] to-[#52BDE9] text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
            {testimonial.clientDisplayName.charAt(0)}
          </div>
          <div>
            <h3 id={`test-card-client-${testimonial.id}`} className="font-heading text-sm font-bold text-[#031C2B]">
              {testimonial.clientDisplayName}
            </h3>
            <p className="text-[11px] text-[#667d8f] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#0784C8]" />
              <span>{testimonial.clientType || displayLocation}</span>
            </p>
          </div>
        </div>

        {/* Review Date */}
        {testimonial.reviewDate && (
          <span className="text-[10.5px] text-[#7a93a5] font-mono flex-shrink-0">
            {testimonial.reviewDate}
          </span>
        )}
      </div>
    </article>
  );
}
