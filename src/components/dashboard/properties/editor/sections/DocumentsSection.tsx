"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, ShieldCheck } from "lucide-react";
import type { DocumentType, DocumentVisibility, VerificationStatus } from "@/types/database";
import { ImageKitUpload } from "@/components/shared/ImageKitUpload";

interface DocumentItem {
  title: string;
  type: DocumentType;
  fileUrl: string;
  visibility: DocumentVisibility;
  verificationStatus: VerificationStatus;
  version?: string;
}

interface DocumentsSectionProps {
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export function DocumentsSection({ documents, onChange }: DocumentsSectionProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<DocumentType>("BROCHURE");
  const [newUrl, setNewUrl] = useState("");
  const [newVisibility, setNewVisibility] = useState<DocumentVisibility>("PUBLIC");
  const [newVersion, setNewVersion] = useState("v1.0");

  const handleImageKitSuccess = (result: {
    url: string;
    fileId: string;
    name: string;
  }) => {
    const isLayout = result.name.toLowerCase().includes("layout") || result.name.toLowerCase().includes("map");
    const isRera = result.name.toLowerCase().includes("rera");

    const item: DocumentItem = {
      title: result.name.replace(/[-_]/g, " ").replace(/\.pdf$/i, ""),
      type: isLayout ? "MASTERPLAN" : isRera ? "RERA_CERTIFICATE" : "BROCHURE",
      fileUrl: result.url,
      visibility: "PUBLIC",
      verificationStatus: "VERIFIED",
      version: "v1.0",
    };

    onChange([...documents, item]);
  };

  const addDocument = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    const item: DocumentItem = {
      title: newTitle.trim(),
      type: newType,
      fileUrl: newUrl.trim(),
      visibility: newVisibility,
      verificationStatus: "UNVERIFIED",
      version: newVersion.trim() || undefined,
    };

    onChange([...documents, item]);
    setNewTitle("");
    setNewUrl("");
  };

  const removeDocument = (idx: number) => {
    onChange(documents.filter((_, i) => i !== idx));
  };

  const toggleVerification = (idx: number) => {
    const copy = [...documents];
    const curr = copy[idx].verificationStatus;
    copy[idx].verificationStatus = curr === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
    onChange(copy);
  };

  return (
    <div id="section-documents" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">7. Document Metadata & Legal Vault</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Attach official brochures, high-res masterplans, and legal due diligence records.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#087fc3]">
          {documents.length} Document(s)
        </span>
      </div>

      {/* Direct ImageKit Document Upload */}
      <div className="space-y-3">
        <ImageKitUpload
          onSuccess={handleImageKitSuccess}
          folder="/ratiwal/documents"
          accept="application/pdf,image/jpeg,image/png"
          label="Upload Document / PDF Brochure to ImageKit Vault"
          helperText="Drag and drop or browse official masterplans, RERA certificates, or brochures (PDF up to 30MB)"
          maxSizeBytes={30 * 1024 * 1024}
        />
      </div>

      {/* Add Document Box */}
      <div className="p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)] space-y-3">
        <h3 className="text-xs font-bold text-[#071a28]">Or Add Document via URL / Cloud Storage</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master Layout & Demarcation Scheme"
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Category Type</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as DocumentType)}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white font-medium focus:outline-none"
            >
              <option value="BROCHURE">Investor Brochure</option>
              <option value="MASTERPLAN">Masterplan / Layout Map</option>
              <option value="RERA_CERTIFICATE">RERA Certificate</option>
              <option value="TITLE_DEED">Title Search / 90A Conversion</option>
              <option value="APPROVAL">Statutory Authority Approval</option>
              <option value="PRICE_SHEET">Price List / Cost Sheet</option>
              <option value="OTHER">Other Diligence Record</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#647581] mb-1">Access Visibility</label>
            <select
              value={newVisibility}
              onChange={(e) => setNewVisibility(e.target.value as DocumentVisibility)}
              className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white font-medium focus:outline-none"
            >
              <option value="PUBLIC">Public (Downloadable on Web)</option>
              <option value="PRIVATE">Private (Verified Buyers Only)</option>
              <option value="INTERNAL">Internal Legal Diligence Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="File URL or path (e.g. /documents/royal-palms-masterplan.pdf)"
            className="flex-1 p-2 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] bg-white focus:outline-none"
          />

          <button
            type="button"
            onClick={addDocument}
            className="px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-semibold hover:bg-[#0a6ba3] transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Attach Document
          </button>
        </div>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <p className="text-[11px] text-[#647581] italic">No documents attached.</p>
      ) : (
        <div className="space-y-2.5">
          {documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] shadow-2xs text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eaf5fa] text-[#087fc3] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#071a28]">{doc.title}</p>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#071a28]">
                      {doc.type}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        doc.visibility === "PUBLIC"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : doc.visibility === "PRIVATE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {doc.visibility}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-[#647581] mt-0.5 truncate max-w-md">
                    {doc.fileUrl}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleVerification(idx)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                    doc.verificationStatus === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-[#647581] border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{doc.verificationStatus === "VERIFIED" ? "Verified" : "Verify"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => removeDocument(idx)}
                  aria-label="Remove document"
                  className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
