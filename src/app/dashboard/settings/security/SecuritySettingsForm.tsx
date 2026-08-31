"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle } from "lucide-react";
import { updateSecuritySettingsAction } from "@/lib/actions/settings.actions";

interface SecuritySettingsFormProps {
  initialSettings: any;
}

export function SecuritySettingsForm({ initialSettings }: SecuritySettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings.security || {});
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

    const res = await updateSecuritySettingsAction({
      currentVersion: version,
      data: formData,
      reason,
    });

    setIsLoading(false);

    if (res.success) {
      setSuccess(true);
      if (res.version) setVersion(res.version);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } else {
      setError(res.message || "Failed to update security settings.");
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
          <span>Security & invitation parameters updated successfully! (Version {version})</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Team Invitations & Authentication Security
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Invitation Link TTL (Hours)</label>
            <input
              type="number"
              min={1}
              max={168}
              value={formData.invitationTtlHours || 72}
              onChange={(e) => setFormData({ ...formData, invitationTtlHours: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Invitation Resend Cooldown (Seconds)</label>
            <input
              type="number"
              min={10}
              max={300}
              value={formData.invitationResendCooldownSeconds || 60}
              onChange={(e) => setFormData({ ...formData, invitationResendCooldownSeconds: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Max Failed Login Attempts</label>
            <input
              type="number"
              min={3}
              max={10}
              value={formData.maxLoginAttempts || 5}
              onChange={(e) => setFormData({ ...formData, maxLoginAttempts: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Session Persistence Duration (Days)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={formData.sessionDurationDays || 7}
              onChange={(e) => setFormData({ ...formData, sessionDurationDays: Number(e.target.value) })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="requireReauth"
            checked={formData.requireReauthForSensitiveActions || false}
            onChange={(e) => setFormData({ ...formData, requireReauthForSensitiveActions: e.target.checked })}
            className="rounded text-[#087fc3] focus:ring-[#087fc3]"
          />
          <label htmlFor="requireReauth" className="text-xs text-[#071a28] font-semibold cursor-pointer">
            Require explicit password re-authentication for critical destructive mutations
          </label>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Saving Settings..." : "Save Security Policies"}</span>
        </button>
      </div>
    </form>
  );
}
