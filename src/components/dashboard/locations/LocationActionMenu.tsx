"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Eye,
  TrendingUp,
  Send,
  CheckCircle2,
  Archive,
  RotateCcw,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  submitLocationForReviewAction,
  publishLocationAction,
  archiveLocationAction,
  restoreLocationToDraftAction,
} from "@/lib/actions/location.actions";
import type { DashboardLocationItem } from "@/lib/services/dashboard.service";

interface LocationActionMenuProps {
  location: DashboardLocationItem;
}

export function LocationActionMenu({ location }: LocationActionMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  const handleSubmitForReview = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await submitLocationForReviewAction(location.id);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handlePublish = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await publishLocationAction(location.id);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleArchive = () => {
    if (!archiveReason.trim()) {
      setErrorMsg("Archive reason is required.");
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const res = await archiveLocationAction(location.id, { reason: archiveReason });
      if (res.success) {
        setArchiveModalOpen(false);
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  const handleRestore = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await restoreLocationToDraftAction(location.id);
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    });
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-slate-50 hover:text-[#087fc3] transition-colors"
          title="Location actions"
          aria-label="Location actions menu"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xl z-50 py-1.5 text-xs">
              {errorMsg && (
                <div className="px-3 py-2 mx-1.5 mb-1 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                  {errorMsg}
                </div>
              )}

              {/* Edit */}
              <Link
                href={`/dashboard/locations/${location.id}/edit`}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-[#071a28] font-medium transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Edit Corridor</span>
              </Link>

              {/* Preview */}
              <Link
                href={`/dashboard/locations/${location.id}/preview`}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-[#071a28] font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-[#647581]" />
                <span>Preview Draft</span>
              </Link>

              {/* Intelligence Hub */}
              <Link
                href={`/dashboard/locations/${location.id}/intelligence`}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-[#071a28] font-medium transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Market Intelligence</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              {/* Lifecycle Actions */}
              {location.publicationStatus === "DRAFT" && (
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-amber-700 font-medium transition-colors text-left"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit for Review</span>
                </button>
              )}

              {location.publicationStatus === "REVIEW" && (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-emerald-50 text-emerald-700 font-medium transition-colors text-left"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Publish Location</span>
                </button>
              )}

              {location.publicationStatus === "PUBLISHED" && (
                <>
                  <Link
                    href={`/locations/${location.slug}`}
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-[#071a28] font-medium transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#42b7e8]" />
                    <span>Public Landing Page</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setArchiveModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-50 text-rose-700 font-medium transition-colors text-left"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Location</span>
                  </button>
                </>
              )}

              {location.publicationStatus === "ARCHIVED" && (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isPending}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-[#071a28] font-medium transition-colors text-left"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Restore to Draft</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Archive Modal */}
      {archiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[rgba(7,26,40,0.1)] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-normal text-[#071a28]">
                Archive Location Corridor
              </h3>
            </div>

            <p className="text-xs text-[#647581] leading-relaxed font-body">
              Archiving <strong>{location.name}</strong> will remove it from the public directory. If any published property listings still depend on this growth corridor, archival will be blocked.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#071a28] mb-1 font-body">
                Archival Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Reason for archiving this corridor (e.g. Masterplan updated, temporary rezoning pause)..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-[rgba(7,26,40,0.15)] focus:border-[#087fc3] focus:outline-hidden font-body"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArchiveModalOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-xs font-semibold text-[#071a28] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchive}
                disabled={isPending || !archiveReason.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
