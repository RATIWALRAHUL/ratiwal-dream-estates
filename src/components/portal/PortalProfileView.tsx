"use client";

import React, { useState, useTransition } from "react";
import { User, Shield, CheckCircle2, AlertCircle, Save, Edit3 } from "lucide-react";
import { updateCustomerPreferencesAction, submitProfileCorrectionAction } from "@/lib/actions/portal-auth.actions";
import { CustomerProfileDTO } from "@/types/portal";

interface PortalProfileViewProps {
  profile: CustomerProfileDTO;
}

export function PortalProfileView({ profile }: PortalProfileViewProps) {
  const [prefs, setPrefs] = useState(profile.communicationPreferences);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Correction Modal
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [fieldToCorrect, setFieldToCorrect] = useState("Name");
  const [currentValue, setCurrentValue] = useState(profile.name);
  const [requestedValue, setRequestedValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateCustomerPreferencesAction(prefs);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to update preferences.");
      } else {
        setSuccessMsg("Communication preferences updated successfully.");
      }
    });
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitProfileCorrectionAction({
        fieldToCorrect,
        currentValue,
        requestedValue,
        reason: correctionReason,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to submit correction request.");
      } else {
        setSuccessMsg(`Correction request ${res.requestNumber} submitted for compliance review.`);
        setIsCorrectionOpen(false);
        setRequestedValue("");
        setCorrectionReason("");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Account Profile & Preferences
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Manage your verified customer profile, communication channels, and security settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Profile Card */}
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-[#087fc3]" />
              <span>Identity Profile</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsCorrectionOpen(true)}
              className="text-xs text-[#087fc3] hover:underline flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Request Correction</span>
            </button>
          </div>

          <div className="space-y-3 text-xs divide-y divide-white/5">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Legal Name:</span>
              <span className="font-semibold text-white">{profile.name}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Masked Email:</span>
              <span className="font-mono text-slate-200">{profile.emailMasked}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Masked Phone:</span>
              <span className="font-mono text-slate-200">{profile.phoneMasked}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Linked Bookings:</span>
              <span className="font-semibold text-[#087fc3]">{profile.linkedBookingsCount} Active</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-400">Last Sign In:</span>
              <span className="text-slate-300">
                {profile.security?.lastLoginAt
                  ? new Date(profile.security.lastLoginAt).toLocaleString("en-IN")
                  : "Active Session"}
              </span>
            </div>
          </div>
        </div>

        {/* Communication Preferences */}
        <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
          <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Communication Preferences</span>
          </h2>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.transactionalEmail}
                onChange={(e) => setPrefs({ ...prefs, transactionalEmail: e.target.checked })}
                className="w-4 h-4 rounded-sm bg-white/5 border border-white/10 text-[#087fc3] focus:ring-0"
              />
              <div>
                <div className="font-semibold text-white">Transactional Email Alerts</div>
                <div className="text-[11px] text-slate-400">Booking receipts, milestones, and KYC notifications</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.transactionalWhatsapp}
                onChange={(e) => setPrefs({ ...prefs, transactionalWhatsapp: e.target.checked })}
                className="w-4 h-4 rounded-sm bg-white/5 border border-white/10 text-[#087fc3] focus:ring-0"
              />
              <div>
                <div className="font-semibold text-white">WhatsApp Updates</div>
                <div className="text-[11px] text-slate-400">Urgent milestone notices and site visit updates</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.marketingConsent}
                onChange={(e) => setPrefs({ ...prefs, marketingConsent: e.target.checked })}
                className="w-4 h-4 rounded-sm bg-white/5 border border-white/10 text-[#087fc3] focus:ring-0"
              />
              <div>
                <div className="font-semibold text-white">Exclusive Township Pre-Launches</div>
                <div className="text-[11px] text-slate-400">Optional notifications for future land offerings</div>
              </div>
            </label>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center justify-center space-x-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isPending ? "Saving..." : "Save Preferences"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Profile Correction Request Modal */}
      {isCorrectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#071a28] border border-white/10 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-bold">Request Profile Data Correction</h3>
            <p className="text-xs text-slate-400">
              Identity modifications are verified against statutory government documents to maintain legal integrity.
            </p>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Field to Correct</label>
                <select
                  value={fieldToCorrect}
                  onChange={(e) => {
                    setFieldToCorrect(e.target.value);
                    if (e.target.value === "Name") setCurrentValue(profile.name);
                    else if (e.target.value === "Phone") setCurrentValue(profile.phoneMasked);
                    else setCurrentValue(profile.emailMasked);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                >
                  <option value="Name" className="bg-[#071a28]">Full Legal Name</option>
                  <option value="Phone" className="bg-[#071a28]">Contact Phone</option>
                  <option value="Email" className="bg-[#071a28]">Email Address</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Current Stored Value</label>
                <input
                  type="text"
                  disabled
                  value={currentValue}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Requested Corrected Value</label>
                <input
                  type="text"
                  required
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  placeholder="Enter corrected value..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Reason / Supporting Context</label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Explain why this correction is required..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white"
                >
                  {isPending ? "Submitting..." : "Submit Correction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
