"use client";

import React from "react";
import Link from "next/link";
import { CmsOverviewMetrics, CmsEntryListItemDTO } from "@/types/cms";
import {
  FileText,
  Compass,
  ArrowRight,
  Plus,
  Globe,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Layers,
  HelpCircle,
  MessageSquareQuote,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface CmsOverviewViewProps {
  metrics: CmsOverviewMetrics;
  recentEntries: CmsEntryListItemDTO[];
}

export function CmsOverviewView({ metrics, recentEntries }: CmsOverviewViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#071a28]">
            Content & Technical SEO
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Author, review, schedule, and optimize landing pages, insights, and structured data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/seo"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 shadow-2xs transition"
          >
            <Compass className="w-4 h-4 text-[#0088cc]" />
            <span>SEO Health Desk</span>
          </Link>

          <Link
            href="/dashboard/content/editor/new"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Page / Article</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
              Published Pages
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#071a28] mt-2">
            {metrics.totalPublishedCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
              Active Drafts
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#071a28] mt-2">
            {metrics.draftsCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
              Under Review
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#071a28] mt-2">
            {metrics.underReviewCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#087fc3]">
              Scheduled Posts
            </span>
            <span className="w-2 h-2 rounded-full bg-[#087fc3]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#071a28] mt-2">
            {metrics.scheduledCount}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#647581]">
              301 Redirects
            </span>
            <span className="w-2 h-2 rounded-full bg-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#071a28] mt-2">
            {metrics.totalRedirectsCount}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/content/pages"
          className="group relative p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] hover:shadow-[0_8px_32px_rgba(7,26,40,0.07)] hover:border-[#0088cc]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#eaf5fa] text-[#0088cc] border border-[#0088cc]/20 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#071a28] group-hover:text-[#0088cc] transition">
              Pages & Landing Hubs
            </h3>
            <p className="text-xs text-[#647581] mt-1.5 leading-relaxed">
              Standard landing pages and regional node overviews.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0088cc]">
            <span>Manage Pages</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/content/blog"
          className="group relative p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] hover:shadow-[0_8px_32px_rgba(7,26,40,0.07)] hover:border-[#0088cc]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#071a28] group-hover:text-[#0088cc] transition">
              Insights & Guides
            </h3>
            <p className="text-xs text-[#647581] mt-1.5 leading-relaxed">
              RERA guides, registry blueprints, and land investment insights.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0088cc]">
            <span>Manage Insights</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/content/faqs"
          className="group relative p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] hover:shadow-[0_8px_32px_rgba(7,26,40,0.07)] hover:border-[#0088cc]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#071a28] group-hover:text-[#0088cc] transition">
              FAQs & Knowledge Base
            </h3>
            <p className="text-xs text-[#647581] mt-1.5 leading-relaxed">
              Categorized plot buying, legal, and payment FAQs.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0088cc]">
            <span>Manage FAQs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/dashboard/content/testimonials"
          className="group relative p-5 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.03)] hover:shadow-[0_8px_32px_rgba(7,26,40,0.07)] hover:border-[#0088cc]/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-2xs mb-3 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#071a28] group-hover:text-[#0088cc] transition">
              Client Testimonials
            </h3>
            <p className="text-xs text-[#647581] mt-1.5 leading-relaxed">
              Consented buyer testimonials and case studies.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0088cc]">
            <span>Manage Reviews</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Entries Table */}
      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-[0_4px_24px_rgba(7,26,40,0.03)]">
        <div className="px-6 py-4.5 bg-[#fcfbf9] border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#071a28]">
            Recently Updated Content
          </h3>
          <Link
            href="/dashboard/content/pages"
            className="text-xs font-bold text-[#0088cc] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4] text-[#647581] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Title & Ref</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Slug</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Version</th>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.05)] text-[#071a28]">
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#647581]">
                    No CMS entries authored yet.
                  </td>
                </tr>
              ) : (
                recentEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#fbf9f5] transition">
                    <td className="p-4 font-semibold text-[#071a28]">
                      <div>{e.title}</div>
                      <span className="font-mono text-[10px] text-[#647581] font-normal">{e.entryReference}</span>
                    </td>
                    <td className="p-4 text-[#647581]">
                      {e.contentType.replace(/_/g, " ")}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#0088cc] font-semibold">
                      /{e.slug}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-[#071a28] border border-[rgba(7,26,40,0.06)]">
                        {e.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[#647581]">
                      v{e.currentVersionNumber}
                    </td>
                    <td className="p-4 text-[#647581]">
                      {e.authorName}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/content/editor/${e.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-[#0088cc] bg-[#eaf5fa] hover:bg-[#d6ecf7] rounded-lg transition"
                      >
                        Edit
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
