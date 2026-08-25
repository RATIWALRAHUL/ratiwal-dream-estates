"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  History,
  Clock,
  Download,
  Share2,
  Lock,
  Eye,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { LegalReviewModal } from "./LegalReviewModal";
import { LegalShareModal } from "./LegalShareModal";
import {
  addLegalDocumentVersionAction,
  toggleLegalHoldAction,
} from "@/lib/actions/legal-vault.actions";

interface LegalDocumentDetailClientProps {
  document: any;
  versions: any[];
  reviews: any[];
  accessLogs: any[];
  userRole: string;
}

export function LegalDocumentDetailClient({
  document,
  versions,
  reviews,
  accessLogs,
  userRole,
}: LegalDocumentDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"specs" | "versions" | "reviews" | "access" | "preview">("specs");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadVersionOpen, setIsUploadVersionOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [versionNote, setVersionNote] = useState("");
  const [previewData, setPreviewData] = useState<{ url: string; mimeType: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleFetchPreview = async () => {
    try {
      const res = await fetch(`/api/legal-vault/preview/${document._id}`);
      const data = await res.json();
      if (data.previewUrl) {
        setPreviewData({ url: data.previewUrl, mimeType: data.mimeType });
        setActiveTab("preview");
      }
    } catch {
      // Ignore
    }
  };

  const handleUploadVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionFile) return;

    startTransition(async () => {
      const providerKey = `legal/${document.propertyId}/${document._id}_v${document.currentVersionNumber + 1}_${newVersionFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const res = await addLegalDocumentVersionAction({
        legalDocumentId: document._id,
        providerKey,
        sanitizedOriginalFilename: newVersionFile.name,
        mimeType: newVersionFile.type,
        fileSize: newVersionFile.size,
        versionNote,
      });

      if (res.success) {
        setIsUploadVersionOpen(false);
        setNewVersionFile(null);
        setVersionNote("");
        router.refresh();
      }
    });
  };

  const handleToggleHold = () => {
    const reason = prompt(
      document.legalHold
        ? "Enter reason for removing legal hold:"
        : "Enter reason for applying legal hold:"
    );
    if (!reason) return;

    startTransition(async () => {
      await toggleLegalHoldAction(document._id, !document.legalHold, reason);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            {document.classification}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
            {document.status.replace(/_/g, " ")}
          </span>
          {document.legalHold && (
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-mono font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-rose-600" />
              <span>LEGAL HOLD ACTIVE</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFetchPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Secure Preview</span>
          </button>

          {document.currentVersionId && (
            <a
              href={`/api/legal-vault/download/${document._id}`}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          )}

          {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
            <>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-all shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-[#087fc3]" />
                <span>Expiring Share</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadVersionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] hover:bg-[#f8f7f4] text-xs font-bold transition-all shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Version</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review / Transition</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[rgba(7,26,40,0.06)] pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === "specs"
              ? "bg-[#071a28] text-white"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          Specifications & Metadata
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("versions")}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === "versions"
              ? "bg-[#071a28] text-white"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          Version History ({versions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === "reviews"
              ? "bg-[#071a28] text-white"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          Review History ({reviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("access")}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === "access"
              ? "bg-[#071a28] text-white"
              : "text-[#647581] hover:text-[#071a28]"
          }`}
        >
          Access Audit Trail ({accessLogs.length})
        </button>

        {previewData && (
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeTab === "preview"
                ? "bg-[#071a28] text-white"
                : "text-[#647581] hover:text-[#071a28]"
            }`}
          >
            Preview Viewer
          </button>
        )}
      </div>

      {/* Tab 1: Specs */}
      {activeTab === "specs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
                Statutory & Authority Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Issuing Authority</span>
                  <span className="font-bold text-[#071a28] text-sm">{document.issuingAuthority || "—"}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Jurisdiction</span>
                  <span className="font-bold text-[#071a28] text-sm">{document.jurisdiction || "—"}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Document Reference Number</span>
                  <span className="font-bold text-[#071a28] text-sm font-mono">{document.documentNumberMasked || "—"}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Registration Date</span>
                  <span className="font-bold text-[#071a28] text-sm font-mono">{document.issueDate?.slice(0, 10) || "—"}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Statutory Expiry Date</span>
                  <span className="font-bold text-[#071a28] text-sm font-mono">{document.expiryDate?.slice(0, 10) || "Indefinite"}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f7f4]">
                  <span className="text-[10px] text-[#647581] block uppercase">Review Due Date</span>
                  <span className="font-bold text-[#071a28] text-sm font-mono">{document.reviewDueDate?.slice(0, 10) || "—"}</span>
                </div>
              </div>
            </div>

            {document.internalNotes && (
              <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-2">
                <h3 className="text-xs font-mono uppercase text-[#647581] font-bold">Internal Counsel Notes</h3>
                <p className="text-xs text-[#071a28] leading-relaxed font-sans">{document.internalNotes}</p>
              </div>
            )}
          </div>

          {/* Right Col: Current File Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#647581] font-bold">
                CURRENT FILE VERSION
              </h3>

              {versions.length > 0 ? (
                <div className="p-4 rounded-xl bg-[#f8f7f4] space-y-2 text-xs">
                  <span className="font-bold text-sm text-[#071a28] block truncate">
                    {versions[0].sanitizedOriginalFilename}
                  </span>
                  <span className="text-[11px] text-[#647581] block font-mono">
                    {(versions[0].fileSize / 1024).toFixed(1)} KB • {versions[0].mimeType}
                  </span>
                  <span className="text-[10px] font-mono text-[#8c9ba5] block">
                    SHA-256: {versions[0].sha256Checksum.slice(0, 16)}…
                  </span>
                  <span className="text-[10px] font-mono text-[#087fc3] block">
                    Malware: {versions[0].malwareScanStatus}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#647581] italic">No file attached yet.</p>
              )}

              {["SUPER_ADMIN", "ADMIN"].includes(userRole) && (
                <button
                  type="button"
                  onClick={handleToggleHold}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    document.legalHold
                      ? "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
                      : "border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28]"
                  }`}
                >
                  {document.legalHold ? "Release Legal Hold" : "Apply Legal Hold"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Versions */}
      {activeTab === "versions" && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
            Append-Only Version History
          </h3>

          <div className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver._id}
                className="p-4 rounded-xl bg-[#f8f7f4] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#071a28]">
                      Version {ver.versionNumber}: {ver.sanitizedOriginalFilename}
                    </span>
                    {ver.versionNumber === document.currentVersionNumber && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#647581] font-mono">
                    SHA-256: {ver.sha256Checksum} • {(ver.fileSize / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-[10px] text-[#8c9ba5]">
                    Uploaded by {ver.uploadedByName || ver.uploadedBy} on {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === "reviews" && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
            Append-Only Review History
          </h3>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-xs text-[#647581] italic">No review events logged yet.</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#f8f7f4] flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#071a28]">
                        {rev.fromStatus} → {rev.toStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[#071a28] text-[9px] font-mono font-bold">
                        {rev.reasonCode}
                      </span>
                    </div>
                    {rev.sanitizedNote && (
                      <p className="text-[11px] text-[#647581] font-sans">{rev.sanitizedNote}</p>
                    )}
                    <p className="text-[10px] text-[#8c9ba5]">
                      Reviewer: {rev.reviewerName || rev.reviewerId} ({rev.reviewerRole})
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-[#647581]">
                    {new Date(rev.reviewedAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Access Log */}
      {activeTab === "access" && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
            Document Access & Download Audit Trail
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] uppercase text-[#647581]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor Type</th>
                  <th className="py-2.5 px-3">Actor / Email</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
                {accessLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#f8f7f4]/60">
                    <td className="py-2.5 px-3 text-[#647581]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-[#071a28]">{log.actorType}</td>
                    <td className="py-2.5 px-3 text-[#071a28]">{log.actorEmail || log.actorId || "External"}</td>
                    <td className="py-2.5 px-3 font-bold text-[#087fc3]">{log.action}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          log.accessResult === "GRANTED" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.accessResult}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Preview Viewer */}
      {activeTab === "preview" && previewData && (
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
            <h3 className="text-sm font-bold font-serif text-[#071a28]">
              Secure Preview (15-Minute Token)
            </h3>
            <span className="text-[10px] font-mono text-[#647581]">
              Strict Content Security Policy Active
            </span>
          </div>

          <div className="w-full h-[600px] rounded-xl border border-[rgba(7,26,40,0.1)] overflow-hidden bg-slate-50">
            {previewData.mimeType.startsWith("image/") ? (
              <img src={previewData.url} alt="Document Preview" className="w-full h-full object-contain p-4" />
            ) : (
              <iframe src={previewData.url} className="w-full h-full" title="Legal Document PDF Viewer" />
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <LegalReviewModal
        documentId={document._id}
        documentReference={document.documentReference}
        currentStatus={document.status}
        currentVersion={document.version}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Share Modal */}
      <LegalShareModal
        documentId={document._id}
        documentReference={document.documentReference}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Upload Version Modal */}
      {isUploadVersionOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadVersion}
            className="bg-white rounded-3xl border border-[rgba(7,26,40,0.1)] shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
              <h3 className="text-base font-bold font-serif text-[#071a28]">Upload Replacement Version</h3>
              <button type="button" onClick={() => setIsUploadVersionOpen(false)} className="text-slate-400 hover:text-[#071a28]">
                ✕
              </button>
            </div>

            <div className="border-2 border-dashed border-[rgba(7,26,40,0.15)] rounded-2xl p-6 text-center bg-[#f8f7f4]/60">
              <FileText className="w-8 h-8 text-[#087fc3] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#071a28]">{newVersionFile ? newVersionFile.name : "Select certified replacement copy"}</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => e.target.files && setNewVersionFile(e.target.files[0])}
                className="mt-2 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-[#071a28] block mb-1 text-xs">Version Notes</label>
              <input
                type="text"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="e.g. Certified correction slip from JDA registrar"
                className="w-full px-3 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] bg-[#f8f7f4] text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsUploadVersionOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newVersionFile || isPending}
                className="px-5 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#087fc3]"
              >
                Upload Version
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
