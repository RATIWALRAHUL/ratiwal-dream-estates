"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ExternalLink,
  Edit,
  Eye,
  Layers,
  Send,
  CheckCircle2,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  MoreVertical,
  X,
  AlertTriangle,
} from "lucide-react";
import type { PaginatedPropertiesResult } from "@/lib/services/dashboard.service";
import type { AdminRole } from "@/lib/auth/session";
import {
  submitPropertyForReviewAction,
  publishPropertyAction,
  archivePropertyAction,
  restorePropertyToDraftAction,
} from "@/lib/actions/property.actions";

interface PropertyTableProps {
  data: PaginatedPropertiesResult;
  userRole?: AdminRole;
}

export function PropertyTable({ data, userRole = "ADMIN" }: PropertyTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { items, pagination } = data;

  // Active action modal states
  const [archiveModal, setArchiveModal] = useState<{ id: string; title: string; version: number } | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const statusBadges: Record<string, { bg: string; text: string; border: string }> = {
    PUBLISHED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    DRAFT: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
    ARCHIVED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  };

  const listingBadges: Record<string, { bg: string; text: string }> = {
    AVAILABLE: { bg: "bg-blue-50 text-blue-700", text: "Available" },
    LIMITED: { bg: "bg-orange-50 text-orange-700", text: "Limited" },
    RESERVED: { bg: "bg-purple-50 text-purple-700", text: "Reserved" },
    SOLD: { bg: "bg-rose-50 text-rose-700", text: "Sold Out" },
    UNAVAILABLE: { bg: "bg-gray-100 text-gray-600", text: "Unavailable" },
  };

  // Lifecycle handlers
  const handleSubmitForReview = async (id: string, version: number) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await submitPropertyForReviewAction(id, version);
      if (res.success) {
        setActionSuccess(res.message);
        router.refresh();
      } else {
        setActionError(res.message);
      }
    });
  };

  const handlePublish = async (id: string, version: number) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await publishPropertyAction(id, version);
      if (res.success) {
        setActionSuccess(res.message);
        router.refresh();
      } else {
        setActionError(res.message);
      }
    });
  };

  const handleArchiveConfirm = async () => {
    if (!archiveModal) return;
    if (!archiveReason.trim()) {
      setActionError("Please provide a reason for archiving this property.");
      return;
    }

    startTransition(async () => {
      const res = await archivePropertyAction(archiveModal.id, archiveReason, archiveModal.version);
      if (res.success) {
        setActionSuccess(res.message);
        setArchiveModal(null);
        setArchiveReason("");
        router.refresh();
      } else {
        setActionError(res.message);
      }
    });
  };

  const handleRestore = async (id: string, version: number) => {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await restorePropertyToDraftAction(id, version);
      if (res.success) {
        setActionSuccess(res.message);
        router.refresh();
      } else {
        setActionError(res.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        {/* Table Top Counter */}
        <div className="p-4 sm:p-5 border-b border-[rgba(7,26,40,0.06)] flex items-center justify-between">
          <span className="text-xs font-mono text-[#647581]">
            Showing <strong className="text-[#071a28]">{items.length}</strong> of{" "}
            <strong className="text-[#071a28]">{pagination.totalItems}</strong> properties
          </span>

          <span className="text-xs font-mono text-[#647581]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Building className="w-10 h-10 text-[#647581]/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#071a28]">No properties found</h3>
            <p className="text-xs text-[#647581] mt-1 max-w-sm mx-auto">
              No real-estate properties matched your current search filters. Try clearing filters or create a new property.
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard/properties/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors"
              >
                <span>Add First Property</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(7,26,40,0.08)] bg-[#f7f5ef]/40 text-[#647581] font-mono uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 font-semibold">Property & Corridor</th>
                    <th className="py-3.5 px-4 font-semibold">Classification</th>
                    <th className="py-3.5 px-4 font-semibold">Publication</th>
                    <th className="py-3.5 px-4 font-semibold">Inventory</th>
                    <th className="py-3.5 px-4 font-semibold">Diligence</th>
                    <th className="py-3.5 px-4 font-semibold">Updated</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
                  {items.map((item) => {
                    const pubStyle = statusBadges[item.publicationStatus] || statusBadges.DRAFT;
                    const listStyle = listingBadges[item.listingStatus] || listingBadges.AVAILABLE;

                    return (
                      <tr key={item.id} className="hover:bg-[#f7f5ef]/40 transition-colors group">
                        {/* Title & Corridor */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {item.primaryImageUrl ? (
                              <img
                                src={item.primaryImageUrl}
                                alt={item.title}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                <Building className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-[#071a28] line-clamp-1">{item.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#647581] font-mono">
                                <span>{item.locationName}</span>
                                <span>•</span>
                                <span className="text-[#087fc3]">/{item.slug}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Classification */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-[#071a28]">
                            {item.propertyType.replace("_", " ")}
                          </span>
                        </td>

                        {/* Publication Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${pubStyle.bg} ${pubStyle.text} ${pubStyle.border}`}
                          >
                            {item.publicationStatus}
                          </span>
                        </td>

                        {/* Listing Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${listStyle.bg}`}>
                            {listStyle.text}
                          </span>
                        </td>

                        {/* Diligence */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            {item.verificationStatus === "VERIFIED" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium text-[11px] font-mono">
                                {item.verificationStatus}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Updated Date */}
                        <td className="py-3.5 px-4 text-[11px] font-mono text-[#647581]">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>

                        {/* Actions Toolbar */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            {/* 1. Edit */}
                            <Link
                              href={`/dashboard/properties/${item.id}/edit`}
                              title="Edit Property"
                              className="p-1.5 rounded-lg text-[#071a28] hover:bg-[#071a28] hover:text-white transition-colors border border-[rgba(7,26,40,0.1)]"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* 2. Inventory */}
                            <Link
                              href={`/dashboard/properties/${item.id}/inventory`}
                              title="Manage Plot Inventory"
                              className="p-1.5 rounded-lg text-[#087fc3] hover:bg-[#087fc3] hover:text-white transition-colors border border-[rgba(7,26,40,0.1)]"
                            >
                              <Layers className="w-3.5 h-3.5" />
                            </Link>

                            {/* 3. Preview */}
                            <Link
                              href={`/dashboard/properties/${item.id}/preview`}
                              target="_blank"
                              title="Protected Preview"
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-600 hover:text-white transition-colors border border-[rgba(7,26,40,0.1)]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            {/* 4. Public URL if published */}
                            {item.publicationStatus === "PUBLISHED" && (
                              <Link
                                href={`/properties/${item.slug}`}
                                target="_blank"
                                title="Public Landing Page"
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors border border-[rgba(7,26,40,0.1)]"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {/* 5. Status Workflow Actions */}
                            {item.publicationStatus === "DRAFT" && (
                              <button
                                type="button"
                                onClick={() => handleSubmitForReview(item.id, 0)}
                                disabled={isPending}
                                title="Submit for Review"
                                className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-600 hover:text-white transition-colors border border-[rgba(7,26,40,0.1)] cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") &&
                              item.publicationStatus === "REVIEW" && (
                                <button
                                  type="button"
                                  onClick={() => handlePublish(item.id, 0)}
                                  disabled={isPending}
                                  title="Publish Property"
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") &&
                              item.publicationStatus === "PUBLISHED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setArchiveModal({ id: item.id, title: item.title, version: 0 })
                                  }
                                  disabled={isPending}
                                  title="Archive Property"
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-colors border border-[rgba(7,26,40,0.1)] cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}

                            {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") &&
                              item.publicationStatus === "ARCHIVED" && (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item.id, 0)}
                                  disabled={isPending}
                                  title="Restore to Draft"
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border border-[rgba(7,26,40,0.1)] cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[rgba(7,26,40,0.06)] p-3 space-y-3">
              {items.map((item) => {
                const pubStyle = statusBadges[item.publicationStatus] || statusBadges.DRAFT;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Building className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#071a28] line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-[#647581]">{item.locationName}</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border mt-1 ${pubStyle.bg} ${pubStyle.text} ${pubStyle.border}`}
                        >
                          {item.publicationStatus}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="pt-2 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between gap-2">
                      <Link
                        href={`/dashboard/properties/${item.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#071a28] text-white text-xs font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>

                      <Link
                        href={`/dashboard/properties/${item.id}/inventory`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold bg-white"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#087fc3]" />
                        <span>Plots</span>
                      </Link>

                      <Link
                        href={`/dashboard/properties/${item.id}/preview`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[rgba(7,26,40,0.12)] text-amber-700 text-xs font-semibold bg-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs">
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-[#647581]">
            Page <strong className="text-[#071a28]">{pagination.page}</strong> of{" "}
            <strong className="text-[#071a28]">{pagination.totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Archive Modal Dialog */}
      {archiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white shadow-2xl border border-rose-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#071a28]">Archive Property</h3>
                <p className="text-xs text-[#647581]">{archiveModal.title}</p>
              </div>
            </div>

            <p className="text-xs text-[#647581]">
              Archiving will immediately remove this property from public search results and investor portals. Historical plot reservations and audit trails will remain preserved.
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#071a28] font-bold mb-1">
                Reason for Archiving <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="e.g. Land parcel fully acquired / Delisted upon developer request"
                rows={3}
                className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] placeholder:text-[#647581] focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArchiveModal(null)}
                className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                disabled={isPending || !archiveReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {isPending ? "Archiving..." : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
