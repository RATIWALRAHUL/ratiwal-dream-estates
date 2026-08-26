"use client";

import Link from "next/link";
import { useState } from "react";
import {
  sendPartnerInvitationAction,
  reviewPartnerComplianceAction,
  grantPartnerPropertyAccessAction,
} from "@/lib/actions/partner-management.actions";

interface StaffPartnerDetailViewProps {
  partner: any;
  rera: any;
  tax: any;
  payoutProfile: any;
  allProperties: any[];
  grantedProperties: any[];
  submissions: any[];
  accruals: any[];
}

export function StaffPartnerDetailView({
  partner,
  rera,
  tax,
  payoutProfile,
  allProperties,
  grantedProperties,
  submissions,
  accruals,
}: StaffPartnerDetailViewProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const handleSendInvite = async () => {
    setLoading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("partnerId", partner._id);
    formData.append("invitedEmail", partner.email);
    formData.append("invitedName", partner.displayName);
    formData.append("invitedPhone", partner.phone);

    const res = await sendPartnerInvitationAction(formData);
    setLoading(false);

    if (res.success) {
      setMsg("Invitation sent successfully!");
      if (res.data?.inviteUrl) setInviteUrl(res.data.inviteUrl);
    } else {
      setMsg(`Error: ${res.error}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("partnerId", partner._id);
    formData.append("reviewType", "STATUS");
    formData.append("status", newStatus);

    const res = await reviewPartnerComplianceAction(formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      setMsg(`Error: ${res.error}`);
    }
  };

  const handleReraReview = async (status: string, method: string) => {
    setLoading(true);
    setMsg(null);
    const formData = new FormData();
    formData.append("partnerId", partner._id);
    formData.append("reviewType", "RERA");
    formData.append("status", status);
    formData.append("verificationMethod", method);

    const res = await reviewPartnerComplianceAction(formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      setMsg(`Error: ${res.error}`);
    }
  };

  const handleGrantProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("partnerId", partner._id);

    const res = await grantPartnerPropertyAccessAction(formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      setMsg(`Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link href="/dashboard/partners" className="text-xs text-amber-400 hover:underline flex items-center space-x-1 mb-2">
            <span>← Back to Partners</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-serif font-bold text-white">{partner.displayName}</h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-amber-300">
              {partner.partnerCode}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase font-semibold">
              {partner.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Type: {partner.partnerType.replace(/_/g, " ")} • Email: {partner.email} • Phone: {partner.phone}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendInvite}
            disabled={loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow transition-all disabled:opacity-50"
          >
            {partner.status === "INVITED" ? "Re-send Invite" : "Send Onboarding Invite"}
          </button>

          {partner.status !== "ACTIVE" && (
            <button
              onClick={() => handleStatusChange("ACTIVE")}
              disabled={loading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg shadow transition-all disabled:opacity-50"
            >
              Activate Partner
            </button>
          )}

          {partner.status === "ACTIVE" && (
            <button
              onClick={() => handleStatusChange("SUSPENDED")}
              disabled={loading}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-xs rounded-lg shadow transition-all disabled:opacity-50"
            >
              Suspend Partner
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300">
          {msg}
        </div>
      )}

      {inviteUrl && (
        <div className="p-3 bg-slate-900 border border-indigo-500/40 rounded-lg text-xs space-y-1">
          <p className="text-slate-300 font-semibold">One-Time Claim Link:</p>
          <p className="font-mono text-indigo-300 select-all break-all">{inviteUrl}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Compliance Reviews & Grants */}
        <div className="lg:col-span-2 space-y-6">
          {/* RERA & Compliance Review */}
          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                RERA Compliance Review
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {rera?.status || "NOT_PROVIDED"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Authority</p>
                <p className="font-semibold text-white">{rera?.stateAuthority || "Rajasthan RERA"}</p>
              </div>
              <div>
                <p className="text-slate-400">Masked License</p>
                <p className="font-mono text-slate-200">{rera?.registrationNumberMasked || "Not Provided"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => handleReraReview("INTERNALLY_REVIEWED", "INTERNAL_DOCUMENT_CHECK")}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700"
              >
                Mark Internally Reviewed
              </button>
              <button
                onClick={() => handleReraReview("OFFICIAL_SOURCE_VERIFIED", "OFFICIAL_GOVERNMENT_PORTAL")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded"
              >
                Mark Official Portal Verified
              </button>
            </div>
          </div>

          {/* Property Grants */}
          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-3">
              Authorized Estates & Property Grants
            </h2>

            <form onSubmit={handleGrantProperty} className="flex items-center space-x-3">
              <select
                name="propertyId"
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white flex-1"
              >
                {allProperties.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <select
                name="accessLevel"
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              >
                <option value="FULL_MARKETING">Full Marketing</option>
                <option value="BASIC_INVENTORY">Basic Inventory</option>
                <option value="RESTRICTED">Restricted</option>
              </select>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded"
              >
                Grant Access
              </button>
            </form>

            <div className="divide-y divide-slate-800">
              {grantedProperties.map((g: any) => (
                <div key={g._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{g.propertyId?.title || "Property"}</p>
                    <p className="text-[10px] text-slate-400">Level: {g.accessLevel}</p>
                  </div>
                  <span className="text-emerald-400 text-[11px]">Active Grant</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Tax & Bank details */}
        <div className="space-y-6">
          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg space-y-3 text-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              Bank Payout Account
            </h2>
            <div>
              <p className="text-slate-400">Beneficiary</p>
              <p className="font-semibold text-white">{payoutProfile?.beneficiaryName || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Bank / IFSC</p>
              <p className="font-mono text-slate-200">
                {payoutProfile?.bankName || "—"} ({payoutProfile?.ifscCode || "—"})
              </p>
            </div>
            <div>
              <p className="text-slate-400">Status</p>
              <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono mt-1">
                {payoutProfile?.verificationStatus || "NOT_CONFIGURED"}
              </span>
            </div>
          </div>

          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 shadow-lg space-y-3 text-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              Performance Snapshot
            </h2>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Leads Registered:</span>
              <span className="font-bold text-white">{submissions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Accruals:</span>
              <span className="font-bold text-white">{accruals.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
