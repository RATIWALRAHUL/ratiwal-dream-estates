"use client";

import { useState, useCallback, useRef, useId } from "react";
import Image from "next/image";
import {
  Upload, X, CheckCircle2, AlertCircle, Loader2, Star, StarOff,
  ChevronLeft, ChevronRight, FileImage, RotateCcw, Trash2, Eye
} from "lucide-react";
import {
  updateAltTextAction,
  setPrimaryImageAction,
  reorderMediaAction,
  detachAssetAction,
} from "@/lib/actions/media.actions";

type AssetStatus = "PENDING" | "UPLOADING" | "PROCESSING" | "READY" | "REJECTED" | "QUARANTINED" | "DELETED";

interface MediaAssetDto {
  id: string;
  assetCategory: "IMAGE" | "DOCUMENT";
  purpose: string;
  access: string;
  status: AssetStatus;
  safeDisplayName: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  publicUrl?: string;
  altText?: string;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  uploadedByEmail?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

interface UploadQueueItem {
  localId: string;
  file: File;
  state: "idle" | "authorizing" | "uploading" | "completing" | "done" | "error" | "cancelled";
  progress: number;
  error?: string;
  assetId?: string;
  preview?: string;
}

interface PropertyMediaManagerProps {
  propertyId: string;
  propertyTitle: string;
  initialAssets: MediaAssetDto[];
  userRole: "EDITOR" | "ADMIN" | "SUPER_ADMIN";
}

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const STATUS_STYLES: Record<AssetStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:    { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Pending" },
  UPLOADING:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400",   label: "Uploading" },
  PROCESSING: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400", label: "Processing" },
  READY:      { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-500",label: "Ready" },
  REJECTED:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Rejected" },
  QUARANTINED:{ bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", label: "Quarantined" },
  DELETED:    { bg: "bg-stone-50",  text: "text-stone-500",  dot: "bg-stone-400",  label: "Deleted" },
};

export default function PropertyMediaManager({
  propertyId,
  propertyTitle,
  initialAssets,
  userRole,
}: PropertyMediaManagerProps) {
  const [assets, setAssets] = useState<MediaAssetDto[]>(initialAssets);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [editingAlt, setEditingAlt] = useState<Record<string, string>>({});
  const [savingAlt, setSavingAlt] = useState<Record<string, boolean>>({});
  const [detaching, setDetaching] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneId = useId();
  const fileInputId = useId();
  const isDragging = useRef(false);
  const [dragOver, setDragOver] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── File validation (client-side fast feedback) ───────────────────────
  function validateFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return `"${file.name}" is ${formatBytes(file.size)} — exceeds the 15 MB limit.`;
    }
    return null;
  }

  // ─── Add files to upload queue ─────────────────────────────────────────
  const enqueueFiles = useCallback((files: File[]) => {
    const newItems: UploadQueueItem[] = [];
    for (const file of files) {
      const clientError = validateFile(file);
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      if (clientError) {
        newItems.push({ localId, file, state: "error", progress: 0, error: clientError, preview });
      } else {
        newItems.push({ localId, file, state: "idle", progress: 0, preview });
      }
    }
    setQueue((prev) => [...prev, ...newItems]);
    // Auto-start valid uploads
    newItems.filter((i) => i.state === "idle").forEach((item) => startUpload(item.localId, item.file));
  }, []); // eslint-disable-line

  // ─── Upload lifecycle ─────────────────────────────────────────────────
  async function startUpload(localId: string, file: File) {
    const update = (patch: Partial<UploadQueueItem>) =>
      setQueue((prev) => prev.map((i) => (i.localId === localId ? { ...i, ...patch } : i)));

    update({ state: "authorizing", progress: 5 });

    // 1. Get upload authorization from our server
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
          purpose: "PROPERTY_GALLERY",
          category: "IMAGE",
          access: "PUBLIC",
          originalFilename: file.name,
          proposedMimeType: file.type,
          proposedSizeBytes: file.size,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        update({ state: "error", error: json.error || "Authorization failed." });
        return;
      }
      authData = json;
    } catch {
      update({ state: "error", error: "Network error during authorization." });
      return;
    }

    update({ state: "uploading", progress: 20, assetId: authData.assetId });

    // 2. Direct-to-ImageKit upload with XHR for progress tracking
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", authData.fileName);
    formData.append("folder", authData.folder);
    formData.append("token", authData.token);
    formData.append("signature", authData.signature);
    formData.append("expire", String(authData.expire));
    formData.append("publicKey", authData.publicKey);
    formData.append("useUniqueFileName", "false");

    let ikResponse: {
      fileId: string; filePath: string; url: string;
      width?: number; height?: number; size: number; fileType: string;
    };
    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", authData.uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = 20 + Math.round((e.loaded / e.total) * 60);
            update({ progress: pct });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            ikResponse = JSON.parse(xhr.responseText);
            resolve();
          } else {
            reject(new Error(`ImageKit upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(formData);
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed.";
      update({ state: "error", error: msg });
      return;
    }

    update({ state: "completing", progress: 85 });

    // 3. Notify our server of completion
    try {
      const complRes = await fetch("/api/dashboard/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: authData.assetId,
          providerFileId: ikResponse!.fileId,
          providerKey: ikResponse!.filePath,
          reportedSizeBytes: ikResponse!.size,
          reportedMimeType: file.type,
          reportedWidth: ikResponse!.width,
          reportedHeight: ikResponse!.height,
          publicUrl: ikResponse!.url,
        }),
      });
      const complJson = await complRes.json();
      if (!complRes.ok || !complJson.success) {
        update({ state: "error", error: complJson.error || "Completion failed." });
        return;
      }

      // 4. Add to asset list optimistically
      const newAsset: MediaAssetDto = {
        id: authData.assetId,
        assetCategory: "IMAGE",
        purpose: "PROPERTY_GALLERY",
        access: "PUBLIC",
        status: "READY",
        safeDisplayName: file.name,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        width: ikResponse!.width,
        height: ikResponse!.height,
        publicUrl: complJson.publicUrl || ikResponse!.url,
        isPrimary: false,
      };
      setAssets((prev) => [...prev, newAsset]);
      update({ state: "done", progress: 100 });
      showToast("Image uploaded successfully.");
    } catch {
      update({ state: "error", error: "Server error completing upload." });
    }
  }

  // ─── Drag & Drop handlers ─────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging.current) { isDragging.current = true; setDragOver(true); }
  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = false;
    setDragOver(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    isDragging.current = false;
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    enqueueFiles(files);
  }, [enqueueFiles]);

  // ─── Keyboard-accessible dropzone ─────────────────────────────────────
  const onDropzoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  // ─── Reorder ──────────────────────────────────────────────────────────
  const moveAsset = async (assetId: string, direction: "left" | "right") => {
    const idx = assets.findIndex((a) => a.id === assetId);
    if (idx < 0) return;
    const newAssets = [...assets];
    const target = direction === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= newAssets.length) return;
    [newAssets[idx], newAssets[target]] = [newAssets[target], newAssets[idx]];
    setAssets(newAssets);
    await reorderMediaAction("PROPERTY", propertyId, newAssets.map((a) => a.id));
    showToast("Gallery order saved.");
  };

  // ─── Primary image ────────────────────────────────────────────────────
  const setPrimary = async (assetId: string) => {
    const result = await setPrimaryImageAction(assetId);
    if (result.success) {
      setAssets((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === assetId })));
      showToast("Primary image updated.");
    } else {
      showToast(result.message, "error");
    }
  };

  // ─── Alt text save ────────────────────────────────────────────────────
  const saveAltText = async (assetId: string) => {
    const text = editingAlt[assetId] ?? "";
    setSavingAlt((prev) => ({ ...prev, [assetId]: true }));
    const result = await updateAltTextAction(assetId, text);
    setSavingAlt((prev) => ({ ...prev, [assetId]: false }));
    if (result.success) {
      setAssets((prev) => prev.map((a) => a.id === assetId ? { ...a, altText: text } : a));
      showToast("Alt text saved.");
    } else {
      showToast(result.message, "error");
    }
  };

  // ─── Detach ───────────────────────────────────────────────────────────
  const detach = async (assetId: string) => {
    if (!window.confirm("Remove this image from the property? The file will be soft-deleted.")) return;
    setDetaching((prev) => ({ ...prev, [assetId]: true }));
    const result = await detachAssetAction(assetId);
    setDetaching((prev) => ({ ...prev, [assetId]: false }));
    if (result.success) {
      setAssets((prev) => prev.filter((a) => a.id !== assetId));
      showToast("Image removed.");
    } else {
      showToast(result.message, "error");
    }
  };

  const readyImages = assets.filter((a) => a.assetCategory === "IMAGE" && a.status === "READY");
  const pendingImages = assets.filter((a) => a.assetCategory === "IMAGE" && a.status !== "READY" && a.status !== "DELETED");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas, #F5F2EC)" }}>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-stone-400 font-mono mb-1">Property Media</p>
          <h1 className="text-2xl font-semibold text-stone-900" style={{ fontFamily: "var(--font-fraunces, serif)" }}>
            {propertyTitle}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {readyImages.length} approved image{readyImages.length !== 1 ? "s" : ""} · Upload JPEG, PNG, or WebP · Max 15 MB
          </p>
        </div>

        {/* Upload Dropzone */}
        <div
          id={dropzoneId}
          role="button"
          tabIndex={0}
          aria-label="Upload images. Press Enter or Space to select files, or drag and drop."
          aria-busy={queue.some((q) => q.state === "uploading")}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onKeyDown={onDropzoneKeyDown}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50"
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-stone-100"}`}>
            <Upload size={22} className={dragOver ? "text-blue-600" : "text-stone-500"} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700">
              {dragOver ? "Drop images here" : "Drag & drop images, or click to select"}
            </p>
            <p className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP · Max 15 MB per file</p>
          </div>

          {/* Hidden file input (standard fallback) */}
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) enqueueFiles(files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Upload Queue */}
        {queue.length > 0 && (
          <div className="mb-8 space-y-3" role="list" aria-label="Upload queue">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 font-mono">Upload Queue</h2>
            {queue.map((item) => (
              <div
                key={item.localId}
                role="listitem"
                className="flex items-center gap-4 bg-white rounded-xl p-4 border border-stone-200"
              >
                {/* Preview thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                  {item.preview ? (
                    <img src={item.preview} alt="" className="w-full h-full object-cover" aria-hidden="true" />
                  ) : (
                    <FileImage size={20} className="m-auto mt-3 text-stone-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{item.file.name}</p>
                  <p className="text-xs text-stone-400">{formatBytes(item.file.size)}</p>

                  {/* Progress bar */}
                  {(item.state === "uploading" || item.state === "authorizing" || item.state === "completing") && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        <span className="sr-only">Upload progress: </span>
                        {item.state === "authorizing" ? "Authorizing..." : item.state === "completing" ? "Verifying..." : `${item.progress}%`}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {item.state === "error" && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                      <AlertCircle size={12} />
                      {item.error}
                    </p>
                  )}

                  {/* Done */}
                  {item.state === "done" && (
                    <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Upload complete
                    </p>
                  )}
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {(item.state === "uploading" || item.state === "authorizing" || item.state === "completing") && (
                    <Loader2 size={18} className="text-blue-500 animate-spin" aria-hidden="true" />
                  )}
                  {item.state === "done" && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {item.state === "error" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); startUpload(item.localId, item.file); }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                      aria-label={`Retry upload for ${item.file.name}`}
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>

                {/* Remove from queue */}
                <button
                  onClick={(e) => { e.stopPropagation(); setQueue((prev) => prev.filter((q) => q.localId !== item.localId)); }}
                  className="flex-shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${item.file.name} from upload queue`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Processing / Pending images notice */}
        {pendingImages.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
            <Loader2 size={16} className="mt-0.5 animate-spin flex-shrink-0" />
            <span>{pendingImages.length} image{pendingImages.length !== 1 ? "s" : ""} are still processing. They will appear once approved.</span>
          </div>
        )}

        {/* Image Gallery Grid */}
        {readyImages.length === 0 && queue.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <FileImage size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No approved images yet. Upload your first image above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Property image gallery">
            {readyImages.map((asset, idx) => {
              const statusStyle = STATUS_STYLES[asset.status];
              const altValue = editingAlt[asset.id] ?? asset.altText ?? "";
              const isFirst = idx === 0;
              const isLast = idx === readyImages.length - 1;

              return (
                <article
                  key={asset.id}
                  role="listitem"
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
                  aria-label={asset.safeDisplayName}
                >
                  {/* Image preview */}
                  <div className="relative aspect-video bg-stone-100">
                    {asset.publicUrl ? (
                      <Image
                        src={asset.publicUrl}
                        alt={asset.altText || asset.safeDisplayName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileImage size={32} className="text-stone-300" />
                      </div>
                    )}

                    {/* Primary badge */}
                    {asset.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-semibold rounded-full flex items-center gap-1">
                        <Star size={10} />
                        Primary
                      </div>
                    )}

                    {/* Status badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} aria-hidden="true" />
                      {statusStyle.label}
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-4 space-y-3">
                    {/* Filename & size */}
                    <div>
                      <p className="text-xs font-medium text-stone-700 truncate">{asset.safeDisplayName}</p>
                      <p className="text-xs text-stone-400 font-mono">
                        {asset.sizeBytes ? formatBytes(asset.sizeBytes) : "—"}
                        {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                      </p>
                    </div>

                    {/* Alt text */}
                    <div>
                      <label htmlFor={`alt-${asset.id}`} className="block text-xs text-stone-500 mb-1">
                        Alt text <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          id={`alt-${asset.id}`}
                          type="text"
                          value={altValue}
                          onChange={(e) => setEditingAlt((prev) => ({ ...prev, [asset.id]: e.target.value }))}
                          placeholder="Describe this image..."
                          maxLength={300}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          aria-required="true"
                        />
                        <button
                          onClick={() => saveAltText(asset.id)}
                          disabled={savingAlt[asset.id] || altValue.length < 3}
                          className="px-2.5 py-1.5 text-xs rounded-lg bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label={`Save alt text for ${asset.safeDisplayName}`}
                        >
                          {savingAlt[asset.id] ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                        </button>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Reorder */}
                      <div className="flex gap-1" role="group" aria-label={`Reorder ${asset.safeDisplayName}`}>
                        <button
                          onClick={() => moveAsset(asset.id, "left")}
                          disabled={isFirst}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label={`Move ${asset.safeDisplayName} left`}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => moveAsset(asset.id, "right")}
                          disabled={isLast}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label={`Move ${asset.safeDisplayName} right`}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex gap-1">
                        {/* Preview */}
                        {asset.publicUrl && (
                          <a
                            href={asset.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
                            aria-label={`Preview ${asset.safeDisplayName} in new tab`}
                          >
                            <Eye size={14} />
                          </a>
                        )}

                        {/* Set primary */}
                        {!asset.isPrimary && (
                          <button
                            onClick={() => setPrimary(asset.id)}
                            className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-200 transition-colors"
                            aria-label={`Set ${asset.safeDisplayName} as primary image`}
                          >
                            <StarOff size={14} />
                          </button>
                        )}

                        {/* Detach */}
                        <button
                          onClick={() => detach(asset.id)}
                          disabled={detaching[asset.id]}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 disabled:opacity-40 transition-colors"
                          aria-label={`Remove ${asset.safeDisplayName} from gallery`}
                        >
                          {detaching[asset.id] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
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
