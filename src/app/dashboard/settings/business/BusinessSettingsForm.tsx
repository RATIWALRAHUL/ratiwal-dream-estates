"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle, Calendar, Shield, Users } from "lucide-react";
import { updateBusinessSettingsAction } from "@/lib/actions/settings.actions";

interface BusinessSettingsFormProps {
  initialSettings: any;
}

export function BusinessSettingsForm({ initialSettings }: BusinessSettingsFormProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialSettings.leads || {});
  const [siteVisits, setSiteVisits] = useState(initialSettings.siteVisits || {});
  const [legalVault, setLegalVault] = useState(initialSettings.legalVault || {});
  const [version, setVersion] = useState(initialSettings.settingsVersion);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const res = await updateBusinessSettingsAction({
      currentVersion: version,
      leads,
      siteVisits,
      legalVault,
      reason,
    });

    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      if (res.version) setVersion(res.version);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      setError(res.message || "Failed to update business settings.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Business policies and SLAs updated successfully! (Version {version})</span>
        </div>
      )}

      {/* CRM & Leads Policy */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(7,26,40,0.06)]">
          <Users className="w-4 h-4 text-[#087fc3]" />
          <h3 className="font-bold text-sm text-[#071a28]">CRM & Lead Distribution SLAs</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Assignment Strategy</label>
            <select
              value={leads.defaultAssignmentStrategy || "ROUND_ROBIN"}
              onChange={(e) => setLeads({ ...leads, defaultAssignmentStrategy: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="ROUND_ROBIN">Round Robin Distribution</option>
              <option value="LEAST_ACTIVE">Least Active Advisor First</option>
              <option value="MANUAL">Manual Manager Assignment Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">First Response SLA (Hours)</label>
            <input
              type="number"
              min={1}
              max={48}
              value={leads.firstResponseSlaHours || 2}
              onChange={(e) => setLeads({ ...leads, firstResponseSlaHours: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Inactivity Threshold (Days)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={leads.inactivityThresholdDays || 7}
              onChange={(e) => setLeads({ ...leads, inactivityThresholdDays: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Duplicate Window (Days)</label>
            <input
              type="number"
              min={1}
              max={90}
              value={leads.duplicateDetectionWindowDays || 30}
              onChange={(e) => setLeads({ ...leads, duplicateDetectionWindowDays: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>
      </div>

      {/* Site Visits Policy */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(7,26,40,0.06)]">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-[#071a28]">Site Visit Scheduling Policies</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Default Visit Duration (Minutes)</label>
            <input
              type="number"
              min={30}
              max={240}
              value={siteVisits.defaultDurationMinutes || 60}
              onChange={(e) => setSiteVisits({ ...siteVisits, defaultDurationMinutes: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Min Advance Notice (Hours)</label>
            <input
              type="number"
              min={1}
              max={48}
              value={siteVisits.minSchedulingNoticeHours || 4}
              onChange={(e) => setSiteVisits({ ...siteVisits, minSchedulingNoticeHours: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Max Advance Booking (Days)</label>
            <input
              type="number"
              min={7}
              max={90}
              value={siteVisits.maxAdvanceBookingDays || 30}
              onChange={(e) => setSiteVisits({ ...siteVisits, maxAdvanceBookingDays: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Reschedule Limit Per Visit</label>
            <input
              type="number"
              min={1}
              max={10}
              value={siteVisits.rescheduleLimitPerVisit || 3}
              onChange={(e) => setSiteVisits({ ...siteVisits, rescheduleLimitPerVisit: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>
      </div>

      {/* Legal Vault Policies */}
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(7,26,40,0.06)]">
          <Shield className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-[#071a28]">Legal Vault & Sharing Rules</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Default Classification</label>
            <select
              value={legalVault.defaultClassification || "CONFIDENTIAL"}
              onChange={(e) => setLegalVault({ ...legalVault, defaultClassification: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="INTERNAL">Internal Use</option>
              <option value="CONFIDENTIAL">Confidential Title Record</option>
              <option value="RESTRICTED">Restricted Executive Access</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Review Due Window (Days)</label>
            <input
              type="number"
              min={3}
              max={60}
              value={legalVault.reviewDueWindowDays || 14}
              onChange={(e) => setLegalVault({ ...legalVault, reviewDueWindowDays: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Max External Share Duration (Hours)</label>
            <input
              type="number"
              min={1}
              max={720}
              value={legalVault.maxShareDurationHours || 168}
              onChange={(e) => setLegalVault({ ...legalVault, maxShareDurationHours: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Max Downloads Per Share Link</label>
            <input
              type="number"
              min={1}
              max={100}
              value={legalVault.maxShareDownloads || 10}
              onChange={(e) => setLegalVault({ ...legalVault, maxShareDownloads: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Saving Settings..." : "Save Business Policies"}</span>
        </button>
      </div>
    </form>
  );
}
