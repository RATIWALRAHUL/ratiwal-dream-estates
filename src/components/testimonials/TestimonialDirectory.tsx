"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Quote, RotateCcw } from "lucide-react";
import { Testimonial } from "@/types/testimonial";
import { TestimonialCard } from "./TestimonialCard";
import { TestimonialFilters } from "./TestimonialFilters";

interface TestimonialDirectoryProps {
  testimonials: Testimonial[];
}

export function TestimonialDirectory({ testimonials }: TestimonialDirectoryProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeLocation = searchParams.get("location") || "all";

  // Derive filter options based on real data
  const categoryOptions = useMemo(() => {
    return [
      { label: "Residential Plots", value: "Residential" },
      { label: "Commercial & Logistics", value: "Commercial" },
      { label: "NRI / Remote Buyers", value: "NRI" },
    ];
  }, []);

  const locationOptions = useMemo(() => {
    return [
      { label: "Jaipur Corridors", value: "Jaipur" },
      { label: "Navi Mumbai / Panvel", value: "Mumbai" },
      { label: "Ajmer & Bhiwadi", value: "Ajmer" },
    ];
  }, []);

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchCategory =
        activeCategory === "all" ||
        (t.propertyType && t.propertyType.toLowerCase().includes(activeCategory.toLowerCase())) ||
        (t.clientType && t.clientType.toLowerCase().includes(activeCategory.toLowerCase()));

      const matchLocation =
        activeLocation === "all" ||
        (t.city && t.city.toLowerCase().includes(activeLocation.toLowerCase())) ||
        (t.state && t.state.toLowerCase().includes(activeLocation.toLowerCase()));

      return matchCategory && matchLocation;
    });
  }, [testimonials, activeCategory, activeLocation]);

  return (
    <section id="stories-directory" className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="stories-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <Quote className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Client Perspectives</span>
          </div>
          <h2
            id="stories-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Experiences across different property journeys.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Read verified feedback from home-seekers, NRI investors, and commercial enterprises who partnered with Ratiwal Dream Estates.
          </p>
        </div>

        {/* Filters */}
        <TestimonialFilters
          activeCategory={activeCategory}
          activeLocation={activeLocation}
          categoryOptions={categoryOptions}
          locationOptions={locationOptions}
          totalCount={testimonials.length}
        />

        {/* Testimonials Grid */}
        {filteredTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          /* Honest Empty State */
          <div className="text-center py-16 px-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] max-w-[620px] mx-auto">
            <Quote className="w-10 h-10 text-[#0784C8] mx-auto mb-4" aria-hidden="true" />
            <h3 className="font-heading text-2xl text-[#031C2B] font-normal mb-2">
              No matching client stories found
            </h3>
            <p className="text-sm text-[#4a6171] mb-6">
              We publish reviews only after verified client authorization. Try clearing your active filters.
            </p>
            <Link
              href="/testimonials#stories-directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#031C2B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#082B3B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Verified Stories</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
