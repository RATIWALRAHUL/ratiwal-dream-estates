"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createRedirectAction, deleteRedirectAction } from "@/lib/actions/cms.actions";
import { ArrowLeft, Plus, Trash2, Shield, Globe, ExternalLink } from "lucide-react";

interface RedirectItem {
  _id: string;
  sourcePath: string;
  destinationPath: string;
  redirectType: string;
  status: string;
  reason: string;
  hitCount: number;
  createdAt: string;
}

interface CmsRedirectsViewProps {
  initialRedirects: RedirectItem[];
}

export function CmsRedirectsView({ initialRedirects }: CmsRedirectsViewProps) {
  const [redirects, setRedirects] = useState(initialRedirects);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sourcePath, setSourcePath] = useState("");
  const [destinationPath, setDestinationPath] = useState("");
  const [redirectType, setRedirectType] = useState("301");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sourcePath.trim() || !destinationPath.trim() || !reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const res = await createRedirectAction(sourcePath, destinationPath, redirectType as any, reason);
    setIsSubmitting(false);

    if (res.success) {
      setIsCreateOpen(false);
      setSourcePath("");
      setDestinationPath("");
      setReason("");
      window.location.reload();
    } else {
      setError(res.message || "Failed to create redirect.");
    }
  }

  async function handleDelete(id: string) {
    await deleteRedirectAction(id);
    setRedirects(redirects.filter((r) => r._id !== id));
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
            301 / 302 URL Redirect Rules
          </h1>
          <p className="text-xs md:text-sm text-[#647581] mt-1">
            Preserve SEO link equity and resolve legacy URLs without infinite chains or loops.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl shadow-xs transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Redirect Rule</span>
        </button>
      </div>

      {/* Redirects Table */}
      <div className="rounded-3xl border border-[rgba(7,26,40,0.08)] bg-white overflow-hidden shadow-[0_4px_24px_rgba(7,26,40,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(7,26,40,0.06)] bg-[#f8f7f4] text-[#647581] font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Source Path</th>
                <th className="p-4 font-bold">Destination Path</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Reason</th>
                <th className="p-4 font-bold text-center">Hits</th>
                <th className="p-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.05)] text-[#071a28]">
              {redirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#647581]">
                    No active redirect rules configured.
                  </td>
                </tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r._id} className="hover:bg-[#fbf9f5] transition">
                    <td className="p-4 font-mono text-[11px] font-bold text-rose-700">
                      {r.sourcePath}
                    </td>
                    <td className="p-4 font-mono text-[11px] font-bold text-emerald-700">
                      {r.destinationPath}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-[#071a28] border border-[rgba(7,26,40,0.06)]">
                        {r.redirectType}
                      </span>
                    </td>
                    <td className="p-4 text-[#647581] max-w-xs truncate">
                      {r.reason}
                    </td>
                    <td className="p-4 text-center font-bold text-[#071a28]">
                      {r.hitCount}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        title="Delete redirect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-[rgba(7,26,40,0.12)] bg-white shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#071a28]">
              Create URL Redirect
            </h3>

            {error && (
              <div className="p-3 text-xs text-rose-800 bg-rose-50 rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Source Path (e.g. /blogs/old-post) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sourcePath}
                  onChange={(e) => setSourcePath(e.target.value)}
                  placeholder="/old-path"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#071a28] mb-1">
                  Destination Path (e.g. /insights/new-post) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={destinationPath}
                  onChange={(e) => setDestinationPath(e.target.value)}
                  placeholder="/new-path"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#071a28] mb-1">
                    Redirect Type
                  </label>
                  <select
                    value={redirectType}
                    onChange={(e) => setRedirectType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                  >
                    <option value="301">301 Permanent</option>
                    <option value="302">302 Temporary</option>
                    <option value="307">307 Temporary</option>
                    <option value="308">308 Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#071a28] mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Slug migration"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(7,26,40,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#647581] hover:text-[#071a28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4.5 py-2 text-xs font-semibold text-white bg-[#0088cc] hover:bg-[#0077b5] rounded-xl transition disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Redirect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
