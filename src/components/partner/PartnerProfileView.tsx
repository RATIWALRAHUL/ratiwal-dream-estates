"use client";

import { useState } from "react";
import { updatePartnerPreferencesAction } from "@/lib/actions/partner.actions";

interface PartnerProfileViewProps {
  profile: any;
}

export function PartnerProfileView({ profile }: PartnerProfileViewProps) {
  const { partner, account, reraRegistration, taxProfile, payoutProfile } = profile;
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handlePrefSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await updatePartnerPreferencesAction(formData);
    setSaving(false);

    if (res.success) {
      setStatusMsg("Notification preferences updated.");
    } else {
      setStatusMsg(`Error: ${res.error}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Partner Organization Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized business credentials, verified RERA registration, and bank payout information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Business & Account Info */}
        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
            Company Credentials
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400">Partner Code</p>
              <p className="text-sm font-mono text-white font-semibold">{partner?.partnerCode}</p>
            </div>
            <div>
              <p className="text-slate-400">Business / Trade Name</p>
              <p className="text-sm text-slate-200">{partner?.displayName}</p>
            </div>
            <div>
              <p className="text-slate-400">Partner Type</p>
              <p className="text-slate-200 font-mono">{partner?.partnerType?.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-slate-400">Official Contact</p>
              <p className="text-slate-200">{partner?.email} • {partner?.phone}</p>
            </div>
            <div>
              <p className="text-slate-400">Registered Office</p>
              <p className="text-slate-200">
                {partner?.registeredAddress?.addressLine1}, {partner?.registeredAddress?.city}, {partner?.registeredAddress?.state} - {partner?.registeredAddress?.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Bank & Tax Profile */}
        <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
            Tax & Payout Profile
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400">Beneficiary Name</p>
              <p className="text-sm font-semibold text-white">{payoutProfile?.beneficiaryName || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">Bank & IFSC</p>
              <p className="text-slate-200 font-mono">
                {payoutProfile?.bankName || "—"} ({payoutProfile?.ifscCode || "—"})
              </p>
            </div>
            <div>
              <p className="text-slate-400">Bank Account</p>
              <p className="text-slate-200 font-mono">{payoutProfile?.accountNumberMasked || "—"}</p>
            </div>
            <div>
              <p className="text-slate-400">PAN & GSTIN</p>
              <p className="text-slate-200 font-mono">
                PAN: {taxProfile?.panMasked || "—"} • GST: {taxProfile?.gstinMasked || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Verification Status</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mt-1">
                {payoutProfile?.verificationStatus || "VERIFIED"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
          Notification Preferences
        </h2>

        {statusMsg && (
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handlePrefSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="emailNotif"
                value="true"
                defaultChecked={account?.notificationPreferences?.email !== false}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
              />
              <span>Email Alerts (Lead attribution, commission approval)</span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="whatsappNotif"
                value="true"
                defaultChecked={account?.notificationPreferences?.whatsapp !== false}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
              />
              <span>WhatsApp Instant Updates (Payout UTR & Site Visit alerts)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}
