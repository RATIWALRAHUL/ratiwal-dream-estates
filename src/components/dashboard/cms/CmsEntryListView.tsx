"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CmsEntryListItemDTO, CMS_PUBLISHING_STATUSES } from "@/types/cms";
import { Plus, Search, ArrowLeft } from "lucide-react";

interface CmsEntryListViewProps {
  initialEntries: CmsEntryListItemDTO[];
  defaultType?: string;
  title: string;
  description: string;
}

export function CmsEntryListView({
  initialEntries,
  defaultType,
  title,
  description,
}: CmsEntryListViewProps) {
  const [entries] = useState(initialEntries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>(defaultType || "ALL");

  const filteredEntries = entries.filter((e) => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.slug.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && e.contentType !== typeFilter) return false;
    return true;
  });

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
            {title}
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            {description}
          </p>
        </div>

        <Link
          href={`/dashboard/content/editor/new${defaultType ? `?type=${defaultType}` : ""}`}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Entry</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white shadow-[0_4px_20px_rgba(7,26,40,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content by title, slug, or reference..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] focus:outline-hidden focus:ring-2 focus:ring-[#0088cc]"
            >
              <option value="ALL">All Statuses</option>
              {CMS_PUBLISHING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-[0_4px_24px_rgba(7,26,40,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4] text-[#647581] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Title & Ref</th>
                <th className="p-4 font-bold">Slug</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Version</th>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 font-bold">Last Updated</th>
                <th className="p-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.05)] text-[#071a28]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#647581]">
                    No content entries found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-[#fbf9f5] transition">
                    <td className="p-4 font-semibold text-[#071a28]">
                      <div>{e.title}</div>
                      <span className="font-mono text-[10px] text-[#647581] font-normal">{e.entryReference}</span>
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
                    <td className="p-4 text-[#647581]">
                      {new Date(e.updatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
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
