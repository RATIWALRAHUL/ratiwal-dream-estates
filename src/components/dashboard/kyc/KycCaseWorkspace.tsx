"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Download,
  Share2,
  Eye,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Send,
} from "lucide-react";
import {
  updateKycCaseStatusAction,
  recordVerificationAction,
  createSubmissionSessionAction,
} from "@/lib/actions/kyc.actions";
import { KycCaseStatus, VerificationMethod, VerificationResult, KycDocumentStatus } from "@/types/kyc";

interface KycCaseWorkspaceProps {
  caseData: {
    kycCase: any;
    applicants: any[];
    documents: any[];
  };
  userRole?: string;
}

export function KycCaseWorkspace({ caseData, userRole = "SUPER_ADMIN" }: KycCaseWorkspaceProps) {
  const { kycCase, applicants, documents } = caseData;
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Review Drawer State
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [verifMethod, setVerifMethod] = useState<VerificationMethod>("INTERNAL_VISUAL_REVIEW");
  const [verifResult, setVerifResult] = useState<VerificationResult>("PASSED");
  const [actionReason, setActionReason] = useState("");
  const [auditNotes, setAuditNotes] = useState("");
  const [isOverride, setIsOverride] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState("");

  // Customer Submission Modal State
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(applicants[0]?._id?.toString() || "");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active Applicant Tab
  const [activeApplicantTab, setActiveApplicantTab] = useState<string>(applicants[0]?._id?.toString() || "");

  const handleGenerateLink = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await createSubmissionSessionAction({
        kycCaseId: kycCase._id.toString(),
        applicantId: selectedApplicantId,
        expiresInHours: 72,
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        const data = res.data as { submissionUrl: string };
        const fullUrl = `${window.location.origin}${data.submissionUrl}`;
        setGeneratedLink(fullUrl);
      }
    });
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusChange = (newStatus: KycCaseStatus) => {
    setActionError(null);
    startTransition(async () => {
      const res = await updateKycCaseStatusAction({
        caseId: kycCase._id.toString(),
        newStatus,
        currentVersion: kycCase.version,
      });
      if (!res.success) {
        setActionError(res.message);
      }
    });
  };

  const handleRecordVerification = (toStatus: KycDocumentStatus) => {
    if (!selectedDoc) return;
    setActionError(null);

    startTransition(async () => {
      const res = await recordVerificationAction({
        documentId: selectedDoc._id.toString(),
        verificationMethod: verifMethod,
        verificationResult: verifResult,
        toStatus,
        isManualOverride: isOverride,
        overrideJustification: isOverride ? overrideJustification : undefined,
        actionRequiredReason: toStatus === "ACTION_REQUIRED" ? actionReason : undefined,
        rejectionReason: toStatus === "REJECTED" ? actionReason : undefined,
        auditNotes,
        caseId: kycCase._id.toString(),
      });

      if (!res.success) {
        setActionError(res.message);
      } else {
        setSelectedDoc(null);
        setAuditNotes("");
        setActionReason("");
      }
    });
  };

  const statusColors: Record<string, string> = {
    COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    UNDER_REVIEW: "bg-blue-50 text-blue-800 border-blue-200",
    SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
    ACTION_REQUIRED: "bg-rose-50 text-rose-800 border-rose-200",
    IN_PROGRESS: "bg-slate-100 text-slate-700 border-slate-200",
    EXPIRED: "bg-rose-100 text-rose-900 border-rose-300",
  };

  const activeApplicantDocs = documents.filter(
    (d) => d.applicantId.toString() === activeApplicantTab
  );

  return (
    <div className="space-y-6 antialiased">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/kyc/cases"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-slate-500">
                {kycCase.kycCaseNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  statusColors[kycCase.status] || "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {kycCase.status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold font-serif text-[#071a28] tracking-tight mt-0.5">
              {kycCase.partyId?.displayName} • KYC Workspace
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsSubmissionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Generate Upload Link</span>
          </button>

          {kycCase.status !== "COMPLETED" && (
            <button
              type="button"
              disabled={isPending || kycCase.blockingBookingConfirmation}
              onClick={() => handleStatusChange("COMPLETED")}
              className="px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#42b7e8]" />
              <span>Complete KYC</span>
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* Overview Context Card */}
      <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Purchasing Entity</div>
            <div className="font-bold text-[#071a28]">{kycCase.partyId?.displayName}</div>
            <div className="text-[11px] text-slate-500 font-mono">{kycCase.partyId?.partyType}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Target Property</div>
            <div className="font-bold text-[#071a28]">{kycCase.propertyId?.title}</div>
            {kycCase.dealId && (
              <div className="text-[11px] text-slate-500">Deal: {kycCase.dealId.dealNumber}</div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Requirements State</div>
            <div className="font-bold text-[#071a28]">
              {kycCase.satisfiedRequirementsCount} of {kycCase.totalRequirementsCount} Satisfied
            </div>
            <div className="text-[11px] text-slate-500">
              {kycCase.blockingBookingConfirmation ? "Blocking Confirmation" : "Cleared for Booking"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fbfaf8] border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Reviewer</div>
            <div className="font-bold text-[#071a28]">{kycCase.assignedReviewerName || "Staff Pool"}</div>
            <div className="text-[11px] text-slate-500">
              Expiry: {kycCase.expiresAt ? new Date(kycCase.expiresAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Applicants Tabs & Document Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Documents Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {applicants.map((app) => (
              <button
                key={app._id}
                type="button"
                onClick={() => setActiveApplicantTab(app._id.toString())}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition-colors shrink-0 flex items-center gap-2 ${
                  activeApplicantTab === app._id.toString()
                    ? "bg-[#071a28] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{app.fullName}</span>
                <span className="text-[10px] opacity-70">({app.role})</span>
              </button>
            ))}
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                  Required Identity Evidence
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verification status and upload history for selected applicant
                </p>
              </div>
            </div>

            {activeApplicantDocs.length === 0 ? (
              <div className="p-8 text-center bg-[#fbfaf8] rounded-2xl text-xs text-slate-400">
                No requirement items assigned to this applicant role.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeApplicantDocs.map((doc) => {
                  const docStatusColors: Record<string, string> = {
                    INTERNALLY_VERIFIED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    PROVIDER_VERIFIED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    UPLOADED: "bg-blue-50 text-blue-800 border-blue-200",
                    UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
                    ACTION_REQUIRED: "bg-rose-50 text-rose-800 border-rose-200",
                    REQUESTED: "bg-slate-100 text-slate-600 border-slate-200",
                  };

                  return (
                    <div
                      key={doc._id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#071a28]">{doc.requirementKey}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              docStatusColors[doc.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {doc.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Type: <strong>{doc.documentType}</strong> • Version: v
                          {doc.currentVersionNumber}
                          {doc.currentVersionId && (
                            <span> • {doc.currentVersionId.sanitizedOriginalFilename}</span>
                          )}
                        </div>
                        {doc.actionRequiredReason && (
                          <div className="text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 text-[11px]">
                            <strong>Correction Needed:</strong> {doc.actionRequiredReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#087fc3]" />
                          <span>Review / Verify</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Review Drawer & Applicant Details */}
        <div className="space-y-6">
          {/* Review Panel if Doc Selected */}
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border-2 border-[#087fc3] p-6 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold font-serif text-[#071a28] uppercase text-xs">
                  Review: {selectedDoc.requirementKey}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Verification Method</label>
                <select
                  value={verifMethod}
                  onChange={(e) => setVerifMethod(e.target.value as VerificationMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                >
                  <option value="INTERNAL_VISUAL_REVIEW">Internal Visual Review</option>
                  <option value="DOCUMENT_MATCH">Document Match & Inspection</option>
                  <option value="FORMAT_CHECK">Format Check</option>
                  <option value="AUTHORIZED_PROVIDER">Authorized Provider Verification</option>
                  <option value="UIDAI_OFFLINE_SIGNATURE">UIDAI Offline XML Signature</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Audit Notes</label>
                <textarea
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Record verification remarks..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRecordVerification("INTERNALLY_VERIFIED")}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Document (Internal)</span>
                </button>

                <div className="space-y-1 pt-1">
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Reason for correction/rejection..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-[11px]"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRecordVerification("ACTION_REQUIRED")}
                      className="w-full py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition-colors"
                    >
                      Action Required
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRecordVerification("REJECTED")}
                      className="w-full py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-[11px] transition-colors"
                    >
                      Reject Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                Applicant Safe Profile
              </h3>
              {applicants.find((a) => a._id.toString() === activeApplicantTab) && (
                <div className="space-y-2 text-xs">
                  {(() => {
                    const currentApp = applicants.find(
                      (a) => a._id.toString() === activeApplicantTab
                    );
                    return (
                      <>
                        <div className="p-3 rounded-2xl bg-[#fbfaf8] border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Name</div>
                          <div className="font-bold text-[#071a28]">{currentApp.fullName}</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#fbfaf8] border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Masked PAN</div>
                          <div className="font-mono font-bold text-slate-700">
                            {currentApp.maskedPan || "—"}
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#fbfaf8] border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
                            Masked Aadhaar
                          </div>
                          <div className="font-mono font-bold text-slate-700">
                            {currentApp.maskedAadhaarLast4 || "—"}
                          </div>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#fbfaf8] border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Location</div>
                          <div className="font-bold text-slate-700">
                            {currentApp.city || "—"}, {currentApp.state || "—"} ({currentApp.country})
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Submission Modal */}
      {isSubmissionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-sm">
                Customer Upload Session
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsSubmissionModalOpen(false);
                  setGeneratedLink(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Generate a time-bound (72-hour), secure single-purpose link for the customer to upload required KYC identity documents.
            </p>

            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Select Applicant</label>
              <select
                value={selectedApplicantId}
                onChange={(e) => setSelectedApplicantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8]"
              >
                {applicants.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.fullName} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            {generatedLink ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[11px] break-all">
                  {generatedLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Upload Link"}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={handleGenerateLink}
                className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#42b7e8]" />
                <span>{isPending ? "Generating..." : "Generate One-Time Link"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
