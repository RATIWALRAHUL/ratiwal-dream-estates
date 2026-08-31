"use client";

import type { VerificationStatus } from "@/types/database";

export type ReraStatus = "REGISTERED" | "APPLIED" | "EXEMPTED" | "NOT_APPLICABLE" | "VERIFIED" | "PENDING_VERIFICATION";

interface ReraVerificationSectionProps {
  rera: {
    isApplicable: boolean;
    registrationNumber?: string;
    authorityName?: string;
    authorityUrl?: string;
    reraStatus: ReraStatus;
    internalNotes?: string;
  };
  verificationStatus: VerificationStatus;
  errors: Record<string, string[]>;
  onChange: (fields: {
    rera?: Partial<ReraVerificationSectionProps["rera"]>;
    verificationStatus?: VerificationStatus;
  }) => void;
}

export function ReraVerificationSection({
  rera,
  verificationStatus,
  errors,
  onChange,
}: ReraVerificationSectionProps) {
  return (
    <div id="section-rera" className="p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
        <div>
          <h2 className="text-sm font-bold text-[#071a28]">8. RERA Registration & Title Diligence</h2>
          <p className="text-xs text-[#647581] mt-0.5">
            Statutory real estate regulatory authority credentials, title verification, and internal audit notes.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* RERA Applicability Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#f7f5ef]/40 border border-[rgba(7,26,40,0.06)]">
          <div>
            <span className="text-xs font-bold text-[#071a28] block">RERA Statutory Governance</span>
            <span className="text-[11px] text-[#647581]">
              Indicate whether this plotted township or parcel falls under statutory RERA jurisdiction.
            </span>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rera.isApplicable}
              onChange={(e) => onChange({ rera: { ...rera, isApplicable: e.target.checked } })}
              className="w-4 h-4 rounded text-[#087fc3]"
            />
            <span className="text-xs font-bold text-[#071a28]">RERA Applicable</span>
          </label>
        </div>

        {rera.isApplicable && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">
                RERA Registration Number
              </label>
              <input
                type="text"
                value={rera.registrationNumber || ""}
                onChange={(e) => onChange({ rera: { ...rera, registrationNumber: e.target.value } })}
                placeholder="e.g. RAJ/P/2024/2987"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] font-mono text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">RERA Status</label>
              <select
                value={rera.reraStatus}
                onChange={(e) => onChange({ rera: { ...rera, reraStatus: e.target.value as ReraStatus } })}
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
              >
                <option value="REGISTERED">Registered & Approved</option>
                <option value="APPLIED">Application Submitted / Under Review</option>
                <option value="EXEMPTED">Formally Exempted</option>
                <option value="NOT_APPLICABLE">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#071a28] mb-1">Regulatory Authority</label>
              <input
                type="text"
                value={rera.authorityName || ""}
                onChange={(e) => onChange({ rera: { ...rera, authorityName: e.target.value } })}
                placeholder="e.g. Rajasthan RERA / MahaRERA"
                className="w-full p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs sm:text-sm text-[#071a28] focus:outline-none focus:border-[#087fc3]"
              />
            </div>
          </div>
        )}

        {/* Overall Due Diligence Status */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.06)]">
          <label className="block text-xs font-bold text-[#071a28] mb-1">
            Overall Legal Diligence Verification Status
          </label>
          <select
            value={verificationStatus}
            onChange={(e) => onChange({ verificationStatus: e.target.value as VerificationStatus })}
            className="w-full sm:w-1/2 p-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs sm:text-sm text-[#071a28] font-medium focus:border-[#087fc3] focus:outline-none"
          >
            <option value="VERIFIED">Verified (30-Year Revenue & Title Clear)</option>
            <option value="UNDER_REVIEW">Under Review (Diligence In Progress)</option>
            <option value="UNVERIFIED">Unverified (Pending Documentation)</option>
            <option value="EXPIRED">Expired (Requires Annual Review)</option>
          </select>
        </div>

        {/* Internal Notes (Never exposed to public) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#071a28]">
              Internal Diligence Notes <span className="text-[10px] text-amber-600 font-mono font-bold">(Private / Never Publicly Visible)</span>
            </label>
          </div>
          <textarea
            rows={3}
            value={rera.internalNotes || ""}
            onChange={(e) => onChange({ rera: { ...rera, internalNotes: e.target.value } })}
            placeholder="Record internal counsel review notes, revenue tehsildar patta mutation details, or seller identity validation records..."
            className="w-full p-3 rounded-xl border border-[rgba(7,26,40,0.12)] text-xs text-[#071a28] focus:outline-none focus:border-[#087fc3]"
          />
        </div>
      </div>
    </div>
  );
}
