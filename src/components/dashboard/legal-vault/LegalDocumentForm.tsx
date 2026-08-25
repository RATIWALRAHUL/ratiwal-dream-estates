"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DocumentClassification,
  DOCUMENT_CLASSIFICATIONS,
  PublicVisibilityMode,
  PUBLIC_VISIBILITY_MODES,
} from "@/types/legal-vault";
import {
  createLegalDocumentAction,
  addLegalDocumentVersionAction,
} from "@/lib/actions/legal-vault.actions";
import { Loader2, Save, ArrowLeft, Upload, FileText, Lock } from "lucide-react";
import Link from "next/link";

interface LegalDocumentFormProps {
  properties: { _id: string; title: string }[];
  initialPropertyId?: string;
  initialCategory?: string;
  initialChecklistItemKey?: string;
}

export function LegalDocumentForm({
  properties,
  initialPropertyId,
  initialCategory,
  initialChecklistItemKey,
}: LegalDocumentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [propertyId, setPropertyId] = useState<string>(initialPropertyId || properties[0]?._id || "");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<DocumentCategory>((initialCategory as DocumentCategory) || "TITLE_CHAIN");
  const [subCategory, setSubCategory] = useState<string>("");
  const [classification, setClassification] = useState<DocumentClassification>("CONFIDENTIAL");
  const [issuingAuthority, setIssuingAuthority] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<string>("Jaipur, Rajasthan");
  const [documentNumberMasked, setDocumentNumberMasked] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [reviewDueDate, setReviewDueDate] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(true);
  const [checklistItemKey, setChecklistItemKey] = useState<string>(initialChecklistItemKey || "");
  const [publicVisibility, setPublicVisibility] = useState<PublicVisibilityMode>("PRIVATE");
  const [internalNotes, setInternalNotes] = useState<string>("");

  // File upload state
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!validMimes.includes(selected.type)) {
        setError("Only PDF, JPEG, PNG, and WebP files are allowed for legal documents.");
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }

    startTransition(async () => {
      // 1. Create Legal Document root record
      const createRes = await createLegalDocumentAction({
        propertyId,
        title,
        category,
        subCategory,
        classification,
        issuingAuthority,
        jurisdiction,
        documentNumberMasked,
        issueDate: issueDate || undefined,
        expiryDate: expiryDate || undefined,
        reviewDueDate: reviewDueDate || undefined,
        isRequired,
        checklistItemKey: checklistItemKey || undefined,
        publicVisibility,
        internalNotes,
      });

      if (!createRes.success) {
        setError(createRes.message);
        return;
      }

      // 2. If file provided, upload version
      if (file) {
        const providerKey = `legal/${propertyId}/${createRes.documentId}_v1_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const addVerRes = await addLegalDocumentVersionAction({
          legalDocumentId: createRes.documentId,
          providerKey,
          sanitizedOriginalFilename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          versionNote: "Initial registration upload",
        });

        if (!addVerRes.success) {
          setError(addVerRes.message);
          return;
        }
      }

      router.push(`/dashboard/legal-vault/documents/${createRes.documentId}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* 1. Hierarchy & Classification */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          1. Property & Classification Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Parent Property / Township *</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JDA 90-A Land Conversion Order"
              required
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-bold text-[#071a28]"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Document Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Data Classification *</label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value as DocumentClassification)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold text-[#071a28]"
            >
              {DOCUMENT_CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Statutory Details & Dates */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          2. Statutory Authority & Validity Dates
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Issuing Authority / Registrar</label>
            <input
              type="text"
              value={issuingAuthority}
              onChange={(e) => setIssuingAuthority(e.target.value)}
              placeholder="e.g. Jaipur Development Authority"
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Jurisdiction / Tehsil</label>
            <input
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g. Sanganer, Jaipur"
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Document Number (Masked)</label>
            <input
              type="text"
              value={documentNumberMasked}
              onChange={(e) => setDocumentNumberMasked(e.target.value)}
              placeholder="e.g. JDA/LU/2024/9871"
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Issue / Registration Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Statutory Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-[#071a28] block mb-1.5">Review Due Date</label>
            <input
              type="date"
              value={reviewDueDate}
              onChange={(e) => setReviewDueDate(e.target.value)}
              disabled={isPending}
              className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isRequired"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            disabled={isPending}
            className="rounded border-[rgba(7,26,40,0.2)] text-[#087fc3] focus:ring-[#087fc3]"
          />
          <label htmlFor="isRequired" className="text-xs font-semibold text-[#071a28]">
            Mandatory Document (Required for complete document readiness)
          </label>
        </div>
      </div>

      {/* 3. Secure File Upload */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold font-serif text-[#071a28] pb-3 border-b border-[rgba(7,26,40,0.06)]">
          3. Secure File Upload (PDF, JPEG, PNG)
        </h3>

        <div className="border-2 border-dashed border-[rgba(7,26,40,0.15)] hover:border-[#087fc3] rounded-2xl p-6 text-center transition-colors bg-[#f8f7f4]/60">
          <FileText className="w-8 h-8 text-[#087fc3] mx-auto mb-2" />
          <p className="text-xs font-bold text-[#071a28]">
            {file ? file.name : "Select certified copy scan to attach"}
          </p>
          <p className="text-[10px] text-[#647581] mt-0.5">
            PDF, PNG, or JPEG up to 25MB. Files are encrypted and private by default.
          </p>
          <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white hover:bg-[#087fc3] text-xs font-bold cursor-pointer transition-all shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Select File</span>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="font-bold text-[#071a28] block mb-1.5 text-xs">Internal Notes (Confidential)</label>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={2}
            placeholder="Confidential verification notes, legal counsel remarks, or title check observations…"
            disabled={isPending}
            className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-medium text-[#071a28]"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/legal-vault"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Register & Save Document</span>
        </button>
      </div>
    </form>
  );
}
