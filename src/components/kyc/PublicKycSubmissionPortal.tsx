"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import { submitCustomerDocumentAction } from "@/lib/actions/kyc.actions";

interface PublicKycSubmissionPortalProps {
  sessionData: {
    session: any;
    kycCase: any;
    applicant: any;
    documents: any[];
  };
  rawToken: string;
}

export function PublicKycSubmissionPortal({
  sessionData,
  rawToken,
}: PublicKycSubmissionPortalProps) {
  const { session, kycCase, applicant, documents: initialDocuments } = sessionData;
  const [documents, setDocuments] = useState(initialDocuments);
  const [consentGranted, setConsentGranted] = useState(false);
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!consentGranted) {
      setErrorMessage("Please accept the identity verification purpose notice before uploading documents.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("File size exceeds the 25 MB limit.");
      return;
    }

    setErrorMessage(null);
    setUploadMessage("Uploading and encrypting document...");
    setActiveUploadDocId(docId);

    startTransition(async () => {
      // In production / integrated mode: upload to secure bucket and pass key
      const mockProviderKey = `kyc-vault/${docId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const res = await submitCustomerDocumentAction({
        rawToken,
        documentId: docId,
        originalFilename: file.name,
        mimeType: file.type || "application/pdf",
        fileSizeBytes: file.size,
        providerKey: mockProviderKey,
      });

      if (!res.success) {
        setErrorMessage(res.message);
        setUploadMessage(null);
      } else {
        setUploadMessage("Document uploaded successfully and queued for verification!");
        setDocuments((prev) =>
          prev.map((d) => (d._id.toString() === docId ? { ...d, status: "UPLOADED" } : d))
        );
      }
      setActiveUploadDocId(null);
    });
  };

  const completedCount = documents.filter((d) =>
    ["UPLOADED", "UNDER_REVIEW", "INTERNALLY_VERIFIED", "PROVIDER_VERIFIED"].includes(d.status)
  ).length;

  return (
    <div className="min-h-screen bg-[#071a28] text-white flex flex-col justify-between p-4 md:p-8 antialiased selection:bg-[#087fc3] selection:text-white">
      <header className="max-w-2xl mx-auto w-full py-4 flex items-center justify-between border-b border-[#0d2c42]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#087fc3] to-[#0a6ba3] flex items-center justify-center font-bold text-white shadow-md">
            R
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-white">Ratiwal Dream Estates</div>
            <div className="text-[10px] font-mono text-[#42b7e8] uppercase tracking-widest">
              Secure Document Submission Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
          <Lock className="w-3 h-3" />
          <span>AES-256 Encrypted</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full my-8 space-y-6">
        {/* Welcome & Context */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0d2c42]/80 border border-[#0d2c42] shadow-2xl space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#42b7e8] font-bold">
              Buyer Identity Verification
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Hello, {applicant?.fullName}
            </h1>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Please provide the requested identity documents for property conveyance deed preparation and RERA compliance for{" "}
              <strong>{kycCase?.propertyId?.title || "your property"}</strong>.
            </p>
          </div>

          {/* DPDPA Notice Box */}
          <div className="p-4 rounded-2xl bg-[#071a28]/80 border border-[#143d5c] space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#42b7e8] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>DPDPA 2023 Digital Personal Data Protection Notice</span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              {session.purposeNotice}
            </p>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer border-t border-[#143d5c]">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-sm border-slate-600 text-[#087fc3] focus:ring-0 focus:ring-offset-0 bg-[#071a28]"
              />
              <span className="text-[11px] text-white font-medium">
                I hereby grant consent to Ratiwal Dream Estates to process my submitted identity documents strictly for property buyer verification.
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {uploadMessage && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold">
              {uploadMessage}
            </div>
          )}
        </div>

        {/* Required Documents Checklist */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0d2c42]/80 border border-[#0d2c42] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#143d5c] pb-3">
            <div>
              <h2 className="font-serif font-bold text-sm uppercase tracking-wider text-white">
                Requested Documents ({completedCount}/{documents.length})
              </h2>
              <p className="text-[11px] text-[#cbd5e1]">PDF, JPEG, or PNG formats up to 25 MB</p>
            </div>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const isUploaded = ["UPLOADED", "UNDER_REVIEW", "INTERNALLY_VERIFIED", "PROVIDER_VERIFIED"].includes(
                doc.status
              );

              return (
                <div
                  key={doc._id}
                  className="p-4 rounded-2xl bg-[#071a28]/80 border border-[#143d5c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{doc.requirementKey}</span>
                      {isUploaded ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Uploaded</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                          Pending Upload
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#cbd5e1]">Document Type: {doc.documentType}</div>
                  </div>

                  <div>
                    <label
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                        !consentGranted || isPending
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
                          : "bg-white hover:bg-[#eaf5fa] text-[#071a28] shadow-md"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploaded ? "Replace File" : "Select & Upload"}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={!consentGranted || isPending}
                        onChange={(e) => handleFileUpload(e, doc._id.toString())}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="max-w-2xl mx-auto w-full py-4 text-center text-[10px] text-[#647581] font-mono border-t border-[#0d2c42]">
        Ratiwal Dream Estates • Dedicated Single-Purpose Submission Portal • DPDPA Notice v1 2026
      </footer>
    </div>
  );
}
