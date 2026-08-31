"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, AlertCircle } from "lucide-react";
import { updateRegionalSettingsAction } from "@/lib/actions/settings.actions";

interface RegionalSettingsFormProps {
  initialSettings: any;
}

const ALL_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function RegionalSettingsForm({ initialSettings }: RegionalSettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings.regional || {});
  const [version, setVersion] = useState(initialSettings.settingsVersion);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleDay = (day: string) => {
    const currentDays: string[] = formData.businessWorkingDays || [];
    if (currentDays.includes(day)) {
      setFormData({ ...formData, businessWorkingDays: currentDays.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, businessWorkingDays: [...currentDays, day] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const res = await updateRegionalSettingsAction({
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
      setError(res.message || "Failed to update regional settings.");
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
          <span>Regional & operational hours updated successfully! (Version {version})</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Localization, Currency & Plot Units
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Business Timezone *</label>
            <input
              type="text"
              required
              value={formData.businessTimezone || "Asia/Kolkata"}
              onChange={(e) => setFormData({ ...formData, businessTimezone: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Default Locale *</label>
            <input
              type="text"
              required
              value={formData.locale || "en-IN"}
              onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Default Currency</label>
            <select
              value={formData.defaultCurrency || "INR"}
              onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="INR">INR (₹ Indian Rupee)</option>
              <option value="USD">USD ($ US Dollar)</option>
              <option value="AED">AED (د.إ UAE Dirham)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Primary Area Measurement Unit</label>
            <select
              value={formData.areaMeasurementUnit || "SQ_YD"}
              onChange={(e) => setFormData({ ...formData, areaMeasurementUnit: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            >
              <option value="SQ_YD">Square Yards (sq.yd / gaj)</option>
              <option value="SQ_FT">Square Feet (sq.ft)</option>
              <option value="SQ_M">Square Meters (sq.m)</option>
              <option value="BIGHA">Bigha (Local land measure)</option>
              <option value="ACRES">Acres</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#071a28] pb-2 border-b border-[rgba(7,26,40,0.06)]">
          Operational Working Days & Schedule
        </h3>

        <div>
          <label className="block text-xs font-bold text-[#071a28] mb-2">Active Working Days</label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => {
              const isSelected = (formData.businessWorkingDays || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors ${
                    isSelected
                      ? "bg-[#071a28] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Business Hours Start</label>
            <input
              type="time"
              value={formData.businessWorkingHoursStart || "09:00"}
              onChange={(e) => setFormData({ ...formData, businessWorkingHoursStart: e.target.value })}
              className="w-full text-xs bg-white border border-[rgba(7,26,40,0.12)] rounded-xl px-3.5 py-2.5 text-[#071a28] focus:outline-hidden focus:border-[#087fc3]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#071a28] mb-1.5">Business Hours End</label>
            <input
              type="time"
              value={formData.businessWorkingHoursEnd || "19:00"}
              onChange={(e) => setFormData({ ...formData, businessWorkingHoursEnd: e.target.value })}
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
          <span>{isLoading ? "Saving Settings..." : "Save Regional Settings"}</span>
        </button>
      </div>
    </form>
  );
}
