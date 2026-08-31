"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle } from "lucide-react";
import { updateGeneralSettingsAction } from "@/lib/actions/settings.actions";

interface GeneralSettingsFormProps {
  initialSettings: any;
}

export function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings.general || {});
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

    const res = await updateGeneralSettingsAction({
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
      setError(res.message || "Failed to update general settings.");
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
          <span>Organization profile updated successfully! (Version {version})</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Company Identity & Legal Registration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Organization Display Name *</label>
            <input
              type="text"
              required
              value={formData.orgDisplayName || ""}
              onChange={(e) => setFormData({ ...formData, orgDisplayName: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Legal Business Name *</label>
            <input
              type="text"
              required
              value={formData.legalBusinessName || ""}
              onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Company CIN / Registration</label>
            <input
              type="text"
              value={formData.companyRegistrationNumber || ""}
              onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">GSTIN Identification</label>
            <input
              type="text"
              value={formData.gstNumber || ""}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#071a28] mb-1.5">Registered Office Address *</label>
          <textarea
            required
            rows={2}
            value={formData.registeredOfficeAddress || ""}
            onChange={(e) => setFormData({ ...formData, registeredOfficeAddress: e.target.value })}
            className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Public Contact & Customer Support
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Support Email *</label>
            <input
              type="email"
              required
              value={formData.supportEmail || ""}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Support Phone *</label>
            <input
              type="text"
              required
              value={formData.supportPhone || ""}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Official Website URL *</label>
            <input
              type="url"
              required
              value={formData.websiteUrl || ""}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Audit Reason (Optional)
        </h3>

        <div>
          <input
            type="text"
            placeholder="e.g. Updated support phone line and registered address"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#087fc3] text-white text-xs font-bold hover:bg-[#076fa8] shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Saving Settings..." : "Save General Settings"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
