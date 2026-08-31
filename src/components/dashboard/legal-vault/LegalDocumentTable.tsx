"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Lock,
  ExternalLink,
  ChevronRight,
  Share2,
} from "lucide-react";
import {
  LegalDocumentSummary,
  DocumentStatus,
  DocumentClassification,
} from "@/types/legal-vault";

const STATUS_BADGES: Record<DocumentStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  UPLOADING: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  QUARANTINED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  SCAN_PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  UNDER_REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  ACTION_REQUIRED: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  INTERNALLY_VERIFIED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  REJECTED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  EXPIRED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
  SUPERSEDED: { bg: "bg-zinc-100", text: "text-zinc-500", border: "border-zinc-300" },
  ARCHIVED: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" },
};

const CLASSIFICATION_BADGES: Record<DocumentClassification, { bg: string; text: string }> = {
  INTERNAL: { bg: "bg-slate-100", text: "text-slate-700" },
  CONFIDENTIAL: { bg: "bg-indigo-50", text: "text-indigo-700" },
  RESTRICTED: { bg: "bg-rose-50", text: "text-rose-700" },
  PUBLIC_APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700" },
};

interface LegalDocumentTableProps {
  documents: LegalDocumentSummary[];
  total: number;
  page: number;
  perPage: number;
}

export function LegalDocumentTable({
  documents,
  total,
  page,
  perPage,
}: LegalDocumentTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
              <th className="py-3 px-4">Document Reference</th>
              <th className="py-3 px-4">Title & Category</th>
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(7,26,40,0.04)] font-mono text-xs">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-[#647581] italic">
                  No legal documents found matching your active filter criteria.
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const statusBadge = STATUS_BADGES[doc.status] || STATUS_BADGES.DRAFT;
                const classBadge = CLASSIFICATION_BADGES[doc.classification] || CLASSIFICATION_BADGES.CONFIDENTIAL;

                const isExpiringSoon =
                  doc.expiryDate &&
                  new Date(doc.expiryDate).getTime() > Date.now() &&
                  new Date(doc.expiryDate).getTime() <= Date.now() + 30 * 86400000;

                const isExpired =
                  doc.expiryDate && new Date(doc.expiryDate).getTime() <= Date.now();

                return (
                  <tr key={doc._id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/legal-vault/documents/${doc._id}`}
                        className="font-bold text-[#071a28] hover:text-[#087fc3] block font-mono"
                      >
                        {doc.documentReference}
                      </Link>
                      <span className="text-[10px] text-[#647581]">
                        v{doc.currentVersionNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#071a28] font-sans">
                      <Link
                        href={`/dashboard/legal-vault/documents/${doc._id}`}
                        className="font-bold block hover:text-[#087fc3] truncate max-w-[220px]"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-[#647581] font-mono block">
                        {doc.category.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#071a28] font-sans font-medium truncate max-w-[160px]">
                      {doc.propertyName}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${classBadge.bg} ${classBadge.text}`}
                      >
                        {doc.classification}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {doc.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {doc.expiryDate ? (
                        <div className="flex items-center gap-1.5">
                          {isExpired ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{doc.expiryDate.slice(0, 10)}</span>
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="text-amber-700 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{doc.expiryDate.slice(0, 10)}</span>
                            </span>
                          ) : (
                            <span className="text-[#647581]">{doc.expiryDate.slice(0, 10)}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <Link
                          href={`/dashboard/legal-vault/documents/${doc._id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#087fc3] hover:bg-[#f8f7f4]"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {doc.currentVersionId && (
                          <a
                            href={`/api/legal-vault/download/${doc._id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#071a28] hover:bg-[#f8f7f4]"
                            title="Download Signed File"
                            download
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
          <span>
            Page {page} of {totalPages} ({total} total legal documents)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
