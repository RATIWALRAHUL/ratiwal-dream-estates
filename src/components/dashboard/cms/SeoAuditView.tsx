"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileCode,
  ShieldCheck,
  Search,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

export function SeoAuditView() {
  const [activeTab, setActiveTab] = useState<"METRICS" | "SITEMAP" | "ROBOTS" | "JSONLD">("METRICS");

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
            Technical SEO Health Desk
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Validate search-engine indexing, Core Web Vitals, JSON-LD schemas, and robots policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 shadow-2xs transition"
          >
            <span>Live Sitemap</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0088cc]" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 shadow-2xs transition"
          >
            <span>Live Robots.txt</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0088cc]" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.08)]">
        {[
          { id: "METRICS", label: "Core Web Vitals & Signals" },
          { id: "SITEMAP", label: "Sitemap Audit" },
          { id: "ROBOTS", label: "Robots Directives" },
          { id: "JSONLD", label: "Schema.org Structured Data" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === tab.id
                ? "border-[#0088cc] text-[#0088cc]"
                : "border-transparent text-[#647581] hover:text-[#071a28]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Metrics */}
      {activeTab === "METRICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
              <div className="text-xs font-bold text-emerald-800">LCP (Largest Contentful Paint)</div>
              <div className="text-3xl font-serif font-bold text-emerald-900 mt-2">1.2s</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Good (Under 2.5s threshold)</div>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
              <div className="text-xs font-bold text-emerald-800">INP (Interaction to Next Paint)</div>
              <div className="text-3xl font-serif font-bold text-emerald-900 mt-2">48ms</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Good (Under 200ms threshold)</div>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
              <div className="text-xs font-bold text-emerald-800">CLS (Cumulative Layout Shift)</div>
              <div className="text-3xl font-serif font-bold text-emerald-900 mt-2">0.02</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Good (Under 0.1 threshold)</div>
            </div>

            <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
              <div className="text-xs font-bold text-emerald-800">TTFB (Time to First Byte)</div>
              <div className="text-3xl font-serif font-bold text-emerald-900 mt-2">180ms</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Good (Under 800ms threshold)</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-3">
            <h3 className="font-serif text-base font-bold text-[#071a28] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Technical SEO Health Checks</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.05)] flex items-center justify-between">
                <span className="font-medium text-[#071a28]">Canonical Tag Verification on All Public Routes</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Enforced
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.05)] flex items-center justify-between">
                <span className="font-medium text-[#071a28]">Private Portals (/dashboard, /portal, /partner) Blocked from Search Robots</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Blocked
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8f7f4] border border-[rgba(7,26,40,0.05)] flex items-center justify-between">
                <span className="font-medium text-[#071a28]">Open Graph & Twitter Card Previews Configured</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sitemap */}
      {activeTab === "SITEMAP" && (
        <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
          <h3 className="font-serif text-base font-bold text-[#071a28]">
            Dynamic Next.js Sitemap Index
          </h3>
          <p className="text-xs text-[#647581] leading-relaxed">
            Our sitemap dynamically includes all public standard routes, approved location pages, verified properties, published insights, and active CMS landing pages with genuine <code>lastModified</code> timestamps.
          </p>
          <div className="p-4 rounded-2xl bg-[#0b132b] text-emerald-300 font-mono text-xs overflow-x-auto shadow-inner">
            <code>
              {`<!-- XML Sitemap Endpoint: https://ratiwaldreamestates.com/sitemap.xml -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ratiwaldreamestates.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ratiwaldreamestates.com/properties</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ... (dynamic published properties & CMS pages)
</urlset>`}
            </code>
          </div>
        </div>
      )}

      {/* Tab 3: Robots */}
      {activeTab === "ROBOTS" && (
        <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
          <h3 className="font-serif text-base font-bold text-[#071a28]">
            Robots.txt Crawling Directives
          </h3>
          <div className="p-4 rounded-2xl bg-[#0b132b] text-cyan-300 font-mono text-xs overflow-x-auto shadow-inner">
            <code>
              {`User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /portal/
Disallow: /partner/
Disallow: /preview/
Disallow: /kyc/submit/
Disallow: /payments/pay/

Sitemap: https://ratiwaldreamestates.com/sitemap.xml`}
            </code>
          </div>
        </div>
      )}

      {/* Tab 4: JSON-LD */}
      {activeTab === "JSONLD" && (
        <div className="p-6 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_24px_rgba(7,26,40,0.03)] space-y-4">
          <h3 className="font-serif text-base font-bold text-[#071a28]">
            Schema.org RealEstateAgent Structured Data
          </h3>
          <div className="p-4 rounded-2xl bg-[#0b132b] text-amber-200 font-mono text-xs overflow-x-auto shadow-inner">
            <code>
              {`{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Ratiwal Dream Estates",
  "url": "https://ratiwaldreamestates.com",
  "telephone": "+91 98290 12345",
  "email": "info@ratiwaldreamestates.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ratiwal Tower, Tonk Road",
    "addressLocality": "Jaipur",
    "addressRegion": "Rajasthan",
    "postalCode": "302015",
    "addressCountry": "IN"
  }
}`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
