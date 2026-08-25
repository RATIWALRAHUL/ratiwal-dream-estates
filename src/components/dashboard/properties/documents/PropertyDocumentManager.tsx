"use client";

import { useState, useCallback, useRef, useId } from "react";
import {
  Upload, X, CheckCircle2, AlertCircle, Loader2, FileText, Lock,
  Eye, Shield, ShieldOff, ShieldCheck, Trash2, RotateCcw, ChevronDown
} from "lucide-react";
import {
  approveAssetAction,
  changeDocumentVisibilityAction,
  detachAssetAction,
  updateDocumentMetadataAction,
} from "@/lib/actions/media.actions";

type AssetAccess = "PUBLIC" | "PRIVATE" | "INTERNAL";
type AssetStatus = "PENDING" | "UPLOADING" | "PROCESSING" | "READY" | "REJECTED" | "QUARANTINED" | "DELETED";
type AssetPurpose =
  | "BROCHURE" | "MASTERPLAN" | "RERA_CERTIFICATE" | "TITLE_DOCUMENT"
  | "APPROVAL" | "PRICE_SHEET" | "OTHER";

interface DocumentAssetDto {
  id: string;
  purpose: AssetPurpose;
  access: AssetAccess;
  status: AssetStatus;
  safeDisplayName: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes?: number;
  documentTitle?: string;
  documentVersion?: string;
  uploadedByEmail?: string;
  uploadedAt?: string;
  rejectionReason?: string;
  verifiedBy?: string;
}

interface UploadQueueItem {
  localId: string;
  file: File;
  purpose: AssetPurpose;
  access: AssetAccess;
  state: "idle" | "authorizing" | "uploading" | "completing" | "done" | "error";
  progress: number;
  error?: string;
  assetId?: string;
}

interface PropertyDocumentManagerProps {
  propertyId: string;
  propertyTitle: string;
  initialDocuments: DocumentAssetDto[];
  userRole: "EDITOR" | "ADMIN" | "SUPER_ADMIN";
}

const PURPOSE_LABELS: Record<AssetPurpose, string> = {
  BROCHURE: "Brochure",
  MASTERPLAN: "Masterplan",
  RERA_CERTIFICATE: "RERA Certificate",
  TITLE_DOCUMENT: "Title Document",
  APPROVAL: "Govt. Approval",
  PRICE_SHEET: "Price Sheet",
  OTHER: "Other Document",
};

const PURPOSE_DEFAULT_ACCESS: Record<AssetPurpose, AssetAccess> = {
  BROCHURE: "PUBLIC",
  MASTERPLAN: "PUBLIC",
  RERA_CERTIFICATE: "INTERNAL",
  TITLE_DOCUMENT: "PRIVATE",
  APPROVAL: "PRIVATE",
  PRICE_SHEET: "PRIVATE",
  OTHER: "INTERNAL",
};

const ACCESS_STYLES: Record<AssetAccess, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  PUBLIC:   { bg: "bg-emerald-50", text: "text-emerald-700", icon: Eye,        label: "Public" },
  INTERNAL: { bg: "bg-blue-50",    text: "text-blue-700",    icon: ShieldCheck, label: "Internal" },
  PRIVATE:  { bg: "bg-red-50",     text: "text-red-700",     icon: Lock,        label: "Private" },
};

const STATUS_STYLES: Record<AssetStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Pending" },
  UPLOADING:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400",   label: "Uploading" },
  PROCESSING: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", label: "Awaiting Approval" },
  READY:      { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-500",label: "Approved" },
  REJECTED:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Rejected" },
  QUARANTINED:{ bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", label: "Quarantined" },
  DELETED:    { bg: "bg-stone-50",  text: "text-stone-500",  dot: "bg-stone-400",  label: "Deleted" },
};

const ALWAYS_PRIVATE: Set<AssetPurpose> = new Set(["TITLE_DOCUMENT", "APPROVAL", "PRICE_SHEET"]);
const PUBLICLY_ALLOWABLE: Set<AssetPurpose> = new Set(["BROCHURE", "MASTERPLAN"]);

const MAX_DOC_BYTES = 25 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function PropertyDocumentManager({
  propertyId,
  propertyTitle,
  initialDocuments,
  userRole,
}: PropertyDocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentAssetDto[]>(initialDocuments);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [editingTitle, setEditingTitle] = useState<Record<string, string>>({});
  const [editingVersion, setEditingVersion] = useState<Record<string, string>>({});
  const [savingMeta, setSavingMeta] = useState<Record<string, boolean>>({});
  const [approving, setApproving] = useState<Record<string, boolean>>({});
  const [detaching, setDetaching] = useState<Record<string, boolean>>({});
  const [visibilityModal, setVisibilityModal] = useState<{ docId: string; currentAccess: AssetAccess; purpose: AssetPurpose } | null>(null);
  const [visibilityReason, setVisibilityReason] = useState("");
  const [visibilityTarget, setVisibilityTarget] = useState<AssetAccess>("INTERNAL");
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Upload form state
  const [selectedPurpose, setSelectedPurpose] = useState<AssetPurpose>("BROCHURE");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // ─── Upload lifecycle ─────────────────────────────────────────────────
  const enqueueFile = useCallback((file: File, purpose: AssetPurpose) => {
    if (file.type !== "application/pdf") {
      showToast(`"${file.name}" must be a PDF.`, "error");
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      showToast(`"${file.name}" exceeds 25 MB.`, "error");
      return;
    }

    const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const defaultAccess = PURPOSE_DEFAULT_ACCESS[purpose];
    const item: UploadQueueItem = { localId, file, purpose, access: defaultAccess, state: "idle", progress: 0 };
    setQueue((prev) => [...prev, item]);
    startDocUpload(item);
  }, []); // eslint-disable-line

  async function startDocUpload(item: UploadQueueItem) {
    const update = (patch: Partial<UploadQueueItem>) =>
      setQueue((prev) => prev.map((i) => i.localId === item.localId ? { ...i, ...patch } : i));

    update({ state: "authorizing", progress: 5 });

    let authData: {
      assetId: string; token: string; signature: string; expire: number;
      publicKey: string; uploadUrl: string; folder: string; fileName: string;
    };
    try {
      const res = await fetch("/api/dashboard/uploads/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerType: "PROPERTY",
          ownerId: propertyId,
          purpose: item.purpose,
          category: "DOCUMENT",
          access: item.access,
          originalFilename: item.file.name,
          proposedMimeType: item.file.type,
          proposedSizeBytes: item.file.size,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        update({ state: "error", error: json.error || "Authorization failed." });
        return;
      }
      authData = json;
    } catch {
      update({ state: "error", error: "Network error." });
      return;
    }

    update({ state: "uploading", progress: 20, assetId: authData.assetId });

    const formData = new FormData();
    formData.append("file", item.file);
    formData.append("fileName", authData.fileName);
    formData.append("folder", authData.folder);
    formData.append("token", authData.token);
    formData.append("signature", authData.signature);
    formData.append("expire", String(authData.expire));
    formData.append("publicKey", authData.publicKey);
    formData.append("useUniqueFileName", "false");

    let ikResponse: { fileId: string; filePath: string; url?: string; size: number };
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", authData.uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) update({ progress: 20 + Math.round((e.loaded / e.total) * 60) });
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) { ikResponse = JSON.parse(xhr.responseText); resolve(); }
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error."));
        xhr.send(formData);
      });
    } catch (e: unknown) {
      update({ state: "error", error: e instanceof Error ? e.message : "Upload failed." });
      return;
    }

    update({ state: "completing", progress: 85 });

    try {
      const res = await fetch("/api/dashboard/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: authData.assetId,
          providerFileId: ikResponse!.fileId,
          providerKey: ikResponse!.filePath,
          reportedSizeBytes: ikResponse!.size,
          reportedMimeType: item.file.type,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { update({ state: "error", error: json.error || "Completion failed." }); return; }

      const newDoc: DocumentAssetDto = {
        id: authData.assetId,
        purpose: item.purpose,
        access: item.access,
        status: "PROCESSING",
        safeDisplayName: item.file.name,
        originalFilename: item.file.name,
        mimeType: "application/pdf",
        sizeBytes: item.file.size,
      };
      setDocuments((prev) => [...prev, newDoc]);
      update({ state: "done", progress: 100 });
      showToast("Document uploaded — awaiting approval.");
    } catch {
      update({ state: "error", error: "Server error." });
    }
  }

  // ─── Approve document ─────────────────────────────────────────────────
  const approve = async (docId: string) => {
    setApproving((prev) => ({ ...prev, [docId]: true }));
    const result = await approveAssetAction(docId);
    setApproving((prev) => ({ ...prev, [docId]: false }));
    if (result.success) {
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, status: "READY" } : d));
      showToast("Document approved.");
    } else {
      showToast(result.message, "error");
    }
  };

  // ─── Detach ───────────────────────────────────────────────────────────
  const detach = async (docId: string) => {
    if (!window.confirm("Remove this document? It will be soft-deleted.")) return;
    setDetaching((prev) => ({ ...prev, [docId]: true }));
    const result = await detachAssetAction(docId);
    setDetaching((prev) => ({ ...prev, [docId]: false }));
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      showToast("Document removed.");
    } else {
      showToast(result.message, "error");
    }
  };

  // ─── Save metadata ────────────────────────────────────────────────────
  const saveMeta = async (docId: string) => {
    const title = editingTitle[docId] ?? "";
    const version = editingVersion[docId];
    setSavingMeta((prev) => ({ ...prev, [docId]: true }));
    const result = await updateDocumentMetadataAction(docId, title, version);
    setSavingMeta((prev) => ({ ...prev, [docId]: false }));
    if (result.success) {
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, documentTitle: title, documentVersion: version } : d));
      showToast("Metadata saved.");
    } else {
      showToast(result.message, "error");
    }
  };

  // ─── Visibility change ────────────────────────────────────────────────
  const openVisibilityModal = (doc: DocumentAssetDto) => {
    setVisibilityReason("");
    setVisibilityTarget(doc.access === "PUBLIC" ? "INTERNAL" : "PUBLIC");
    setVisibilityModal({ docId: doc.id, currentAccess: doc.access, purpose: doc.purpose });
  };

  const submitVisibilityChange = async () => {
    if (!visibilityModal) return;
    setVisibilityLoading(true);
    const result = await changeDocumentVisibilityAction(
      visibilityModal.docId,
      visibilityTarget,
      visibilityReason
    );
    setVisibilityLoading(false);
    if (result.success) {
      setDocuments((prev) => prev.map((d) => d.id === visibilityModal.docId ? { ...d, access: visibilityTarget } : d));
      setVisibilityModal(null);
      showToast(`Visibility changed to ${visibilityTarget}.`);
    } else {
      showToast(result.message, "error");
    }
  };

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas, #F5F2EC)" }}>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Visibility Change Modal */}
      {visibilityModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="visibility-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setVisibilityModal(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 id="visibility-modal-title" className="text-lg font-semibold text-stone-900 mb-1">
              Change Document Visibility
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Current: <span className="font-medium">{visibilityModal.currentAccess}</span>
            </p>

            {ALWAYS_PRIVATE.has(visibilityModal.purpose) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <Lock size={14} className="mt-0.5 flex-shrink-0" />
                <span>Documents of type <strong>{PURPOSE_LABELS[visibilityModal.purpose]}</strong> must remain PRIVATE and cannot be made public.</span>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="visibility-target" className="block text-xs font-medium text-stone-700 mb-1">
                New Visibility
              </label>
              <div className="relative">
                <select
                  id="visibility-target"
                  value={visibilityTarget}
                  onChange={(e) => setVisibilityTarget(e.target.value as AssetAccess)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="PUBLIC" disabled={!PUBLICLY_ALLOWABLE.has(visibilityModal.purpose)}>
                    Public — visible on website
                  </option>
                  <option value="INTERNAL">Internal — admin only</option>
                  <option value="PRIVATE">Private — signed URL only</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="visibility-reason" className="block text-xs font-medium text-stone-700 mb-1">
                Justification <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="visibility-reason"
                value={visibilityReason}
                onChange={(e) => setVisibilityReason(e.target.value)}
                rows={3}
                placeholder="Explain the reason for this visibility change (required, min 10 chars)..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                aria-required="true"
              />
              <p className="text-xs text-stone-400 mt-1">{visibilityReason.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setVisibilityModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitVisibilityChange}
                disabled={visibilityLoading || visibilityReason.trim().length < 10 || ALWAYS_PRIVATE.has(visibilityModal.purpose) && visibilityTarget === "PUBLIC"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {visibilityLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-stone-400 font-mono mb-1">Property Documents</p>
          <h1 className="text-2xl font-semibold text-stone-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            {propertyTitle}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {documents.length} document{documents.length !== 1 ? "s" : ""} · Upload PDF files · Max 25 MB
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
          <h2 className="text-sm font-semibold text-stone-800 mb-4">Upload New Document</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="doc-purpose-select" className="block text-xs text-stone-500 mb-1">Document Type</label>
              <div className="relative">
                <select
                  id="doc-purpose-select"
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value as AssetPurpose)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {(Object.entries(PURPOSE_LABELS) as [AssetPurpose, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true" />
              </div>
              {ALWAYS_PRIVATE.has(selectedPurpose) && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Lock size={10} />
                  This document type is always classified as PRIVATE.
                </p>
              )}
            </div>
            <div className="sm:pt-5">
              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept="application/pdf"
                aria-label="Select a PDF document to upload"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { enqueueFile(file, selectedPurpose); e.target.value = ""; }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors whitespace-nowrap"
              >
                <Upload size={15} />
                Select PDF
              </button>
            </div>
          </div>
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="mb-6 space-y-3" role="list" aria-label="Document upload queue">
            {queue.map((item) => (
              <div key={item.localId} role="listitem" className="flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-200">
                <FileText size={20} className="flex-shrink-0 text-stone-400" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{item.file.name}</p>
                  <p className="text-xs text-stone-400">{PURPOSE_LABELS[item.purpose]} · {formatBytes(item.file.size)}</p>
                  {(item.state === "uploading" || item.state === "authorizing" || item.state === "completing") && (
                    <div className="mt-1.5">
                      <div className="h-1 bg-stone-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  )}
                  {item.state === "error" && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                      <AlertCircle size={11} /> {item.error}
                    </p>
                  )}
                  {item.state === "done" && (
                    <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Uploaded — awaiting admin approval
                    </p>
                  )}
                </div>
                {(item.state === "uploading" || item.state === "authorizing" || item.state === "completing") && (
                  <Loader2 size={16} className="text-blue-500 animate-spin flex-shrink-0" aria-hidden="true" />
                )}
                <button
                  onClick={() => setQueue((prev) => prev.filter((q) => q.localId !== item.localId))}
                  className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${item.file.name} from queue`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Document List */}
        {documents.length === 0 && queue.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No documents uploaded yet. Select a type and upload a PDF above.</p>
          </div>
        ) : (
          <div className="space-y-4" role="list" aria-label="Property documents">
            {documents.map((doc) => {
              const statusStyle = STATUS_STYLES[doc.status];
              const accessStyle = ACCESS_STYLES[doc.access];
              const AccessIcon = accessStyle.icon;
              const titleValue = editingTitle[doc.id] ?? doc.documentTitle ?? "";
              const versionValue = editingVersion[doc.id] ?? doc.documentVersion ?? "";

              return (
                <article
                  key={doc.id}
                  role="listitem"
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top bar */}
                  <div className="flex items-start gap-4 p-5 border-b border-stone-100">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText size={18} className="text-red-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {doc.documentTitle || doc.safeDisplayName}
                      </p>
                      <p className="text-xs text-stone-400 font-mono truncate">{doc.originalFilename}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {PURPOSE_LABELS[doc.purpose]}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${accessStyle.bg} ${accessStyle.text}`}>
                          <AccessIcon size={10} />
                          {accessStyle.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} aria-hidden="true" />
                          {statusStyle.label}
                        </span>
                        {doc.sizeBytes && (
                          <span className="text-xs text-stone-400">{formatBytes(doc.sizeBytes)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Metadata editing */}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label htmlFor={`title-${doc.id}`} className="block text-xs text-stone-500 mb-1">Document Title</label>
                        <input
                          id={`title-${doc.id}`}
                          type="text"
                          value={titleValue}
                          onChange={(e) => setEditingTitle((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                          placeholder="e.g. Site Plan v2.0"
                          maxLength={300}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div className="w-full sm:w-28">
                        <label htmlFor={`version-${doc.id}`} className="block text-xs text-stone-500 mb-1">Version</label>
                        <input
                          id={`version-${doc.id}`}
                          type="text"
                          value={versionValue}
                          onChange={(e) => setEditingVersion((prev) => ({ ...prev, [doc.id]: e.target.value }))}
                          placeholder="v1.0"
                          maxLength={50}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {/* Save metadata */}
                      <button
                        onClick={() => saveMeta(doc.id)}
                        disabled={savingMeta[doc.id] || titleValue.length < 2}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Save metadata for ${doc.safeDisplayName}`}
                      >
                        {savingMeta[doc.id] ? <Loader2 size={12} className="animate-spin" /> : null}
                        Save
                      </button>

                      {/* Approve (admin only) */}
                      {isAdmin && (doc.status === "PROCESSING" || doc.status === "PENDING") && (
                        <button
                          onClick={() => approve(doc.id)}
                          disabled={approving[doc.id]}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors"
                          aria-label={`Approve ${doc.safeDisplayName}`}
                        >
                          {approving[doc.id] ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                          Approve
                        </button>
                      )}

                      {/* Change visibility (admin only) */}
                      {isAdmin && !ALWAYS_PRIVATE.has(doc.purpose) && (
                        <button
                          onClick={() => openVisibilityModal(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                          aria-label={`Change visibility for ${doc.safeDisplayName}`}
                        >
                          {doc.access === "PUBLIC" ? <ShieldOff size={12} /> : <Shield size={12} />}
                          Visibility
                        </button>
                      )}

                      {/* Download (private documents — admin only) */}
                      {doc.status === "READY" && (doc.access === "PRIVATE" || doc.access === "INTERNAL") && isAdmin && (
                        <a
                          href={`/api/dashboard/assets/${doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-stone-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label={`Download ${doc.safeDisplayName}`}
                        >
                          <Eye size={12} />
                          Download
                        </a>
                      )}

                      {/* Detach */}
                      <button
                        onClick={() => detach(doc.id)}
                        disabled={detaching[doc.id]}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-stone-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-colors"
                        aria-label={`Remove ${doc.safeDisplayName}`}
                      >
                        {detaching[doc.id] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Remove
                      </button>
                    </div>

                    {/* Rejection reason */}
                    {doc.status === "REJECTED" && doc.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700" role="alert">
                        <strong>Rejected:</strong> {doc.rejectionReason}
                      </div>
                    )}

                    {/* Private access notice */}
                    {ALWAYS_PRIVATE.has(doc.purpose) && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
                        <Lock size={11} />
                        This document is permanently classified as PRIVATE. Only admin download is permitted.
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
