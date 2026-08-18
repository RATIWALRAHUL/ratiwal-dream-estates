import React from "react";
import { LegalPageData } from "@/types/legal";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { LegalSidebar } from "./LegalSidebar";
import { LegalMobileNavigation } from "./LegalMobileNavigation";
import { LegalSection } from "./LegalSection";
import { LegalContactCard } from "./LegalContactCard";
import { siteConfig } from "@/config/site";
import { Calendar, FileCheck, Scale, ShieldAlert } from "lucide-react";

interface LegalPageLayoutProps {
  data: LegalPageData;
}

export function LegalPageLayout({ data }: LegalPageLayoutProps) {
  const breadcrumbItems = [
    { label: "Legal & Compliance", href: "/terms-of-service" },
    { label: data.title, href: data.slug },
  ];

  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Legal & Compliance",
        item: `${siteConfig.url}/terms-of-service`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.title,
        item: `${siteConfig.url}${data.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-[var(--alabaster)] pt-24 sm:pt-28 pb-16 sm:pb-24 text-[var(--midnight)]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Editorial Page Header */}
          <header className="max-w-4xl pb-8 sm:pb-12 border-b border-[rgba(7,26,40,0.1)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[rgba(7,26,40,0.1)] text-[var(--ratwal-blue)] text-xs font-bold uppercase tracking-wider mb-4">
              <Scale size={13} />
              <span>{data.category}</span>
            </div>

            <h1 className="font-instrument text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--midnight)] font-normal leading-[1.08] tracking-tight mb-5">
              {data.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-normal mb-6 max-w-3xl">
              {data.summary}
            </p>

            {/* Meta Timestamps */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--ratwal-blue)]" />
                <span>Effective Date: {data.effectiveDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileCheck size={14} className="text-[var(--ratwal-blue)]" />
                <span>Last Updated: {data.lastUpdated}</span>
              </div>
            </div>

            {/* Notice Callout Banner if present */}
            {data.noticeBanner && (
              <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-[var(--cyan)]/40 shadow-xs">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[var(--ratwal-blue)] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--ratwal-blue)] block mb-1">
                      {data.noticeBanner.badge}
                    </span>
                    <p className="text-xs sm:text-[13px] text-[var(--midnight)] leading-relaxed font-medium">
                      {data.noticeBanner.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 sm:mt-12 items-start">
            {/* Left Column: Sidebar Table of Contents (25% on desktop - 3 of 12 cols) */}
            <div className="lg:col-span-4 xl:col-span-3">
              <LegalMobileNavigation sections={data.sections} />
              <LegalSidebar sections={data.sections} />
            </div>

            {/* Right Column: Main Legal Content Body (75% on desktop - 9 of 12 cols) */}
            <main className="lg:col-span-8 xl:col-span-9 bg-white p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-sm">
              <div className="space-y-10 sm:space-y-12">
                {data.sections.map((section) => (
                  <LegalSection key={section.id} section={section} />
                ))}
              </div>

              {/* Verified Contact & Compliance Footer Card */}
              <LegalContactCard />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
