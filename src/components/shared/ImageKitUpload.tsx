"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, Image as FileText } from "lucide-react";

interface ImageKitUploadProps {
  onSuccess: (result: {
    url: string;
    fileId: string;
    name: string;
    width?: number;
    height?: number;
    size: number;
    thumbnailUrl?: string;
  }) => void;
  folder?: string;
  accept?: string;
  maxSizeBytes?: number;
  label?: string;
  helperText?: string;
}

export function ImageKitUpload({
  onSuccess,
  folder = "/ratiwal/properties",
  accept = "image/jpeg,image/png,image/webp,image/avif,application/pdf",
  maxSizeBytes = 15 * 1024 * 1024, // 15MB
  label = "Upload Asset to ImageKit",
  helperText = "Drag and drop or browse high-resolution property imagery or PDF documents (Max 15MB)",
}: ImageKitUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUploaded, setLastUploaded] = useState<{ name: string; url: string; isImage: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // File size check
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds maximum allowed of ${Math.round(maxSizeBytes / (1024 * 1024))}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("fileName", file.name);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Upload to ImageKit failed");
      }

      const isImage = file.type.startsWith("image/");
      setLastUploaded({ name: file.name, url: json.data.url, isImage });
      setUploadProgress(null);
      setIsUploading(false);

      onSuccess({
        url: json.data.url,
        fileId: json.data.fileId,
        name: json.data.name,
        width: json.data.width,
        height: json.data.height,
        size: json.data.size,
        thumbnailUrl: json.data.thumbnailUrl,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to upload file");
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          isDragging
            ? "border-[#087fc3] bg-[#eaf5fa]"
            : "border-[rgba(7,26,40,0.15)] bg-[#fffdf8] hover:border-[#087fc3] hover:bg-[#f7f5ef]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#eaf5fa] text-[#087fc3] flex items-center justify-center shadow-xs">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#087fc3]" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-[#071a28]">{label}</p>
            <p className="text-[11px] text-[#647581] mt-0.5 max-w-xs mx-auto">
              {helperText}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071a28] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
            <span>Powered by ImageKit CDN</span>
          </div>
        </div>
      </div>

      {/* Progress / Status / Error Indicators */}
      {isUploading && uploadProgress && (
        <div className="p-3 rounded-xl bg-[#eaf5fa] border border-[#42b7e8]/30 flex items-center gap-2 text-xs text-[#087fc3] font-medium">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="truncate">{uploadProgress}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-100 rounded-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {lastUploaded && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="font-semibold truncate">Uploaded: {lastUploaded.name}</p>
              <p className="text-[10px] font-mono text-emerald-600 truncate">{lastUploaded.url}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 shrink-0">
            CDN Ready
          </span>
        </div>
      )}
    </div>
  );
}
