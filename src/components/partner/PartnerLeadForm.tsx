"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitPartnerLeadAction } from "@/lib/actions/partner.actions";

interface PropertyOption {
  id: string;
  title: string;
}

interface PartnerLeadFormProps {
  properties: PropertyOption[];
  preselectedPropertyId?: string;
}

export function PartnerLeadForm({ properties, preselectedPropertyId }: PartnerLeadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await submitPartnerLeadAction(formData);

    if (!res.success) {
      setError(res.error || "Failed to register lead.");
      setLoading(false);
    } else {
      setSuccessMsg(res.data?.message || "Lead registered successfully!");
      setLoading(false);
      setTimeout(() => {
        router.push("/partner/leads");
        router.refresh();
      }, 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#0d131f] border border-[#232f48] rounded-2xl p-6 sm:p-8 shadow-xl">
      {error && (
        <div className="p-4 bg-red-950/50 border border-red-500/40 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select Estate / Project <span className="text-amber-400">*</span>
          </label>
          <select
            name="propertyId"
            defaultValue={preselectedPropertyId || (properties[0]?.id || "")}
            required
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Client Full Name <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            name="clientName"
            required
            placeholder="e.g. Rajesh Sharma"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Client Contact Phone <span className="text-amber-400">*</span>
          </label>
          <input
            type="tel"
            name="clientPhone"
            required
            placeholder="+91 98765 43210"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Client Email (Optional)
          </label>
          <input
            type="email"
            name="clientEmail"
            placeholder="rajesh@example.com"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Approximate Budget Band
          </label>
          <select
            name="budgetBand"
            defaultValue="50L - 1Cr"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="Under 50L">Under ₹50 Lakhs</option>
            <option value="50L - 1Cr">₹50 Lakhs – ₹1 Crore</option>
            <option value="1Cr - 2.5Cr">₹1 Crore – ₹2.5 Crores</option>
            <option value="2.5Cr+">₹2.5 Crores & Above</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Investment Intent
          </label>
          <select
            name="investmentIntent"
            defaultValue="IMMEDIATE_REGISTRY"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            <option value="IMMEDIATE_REGISTRY">Immediate Registry & Possession</option>
            <option value="VILLA_CONSTRUCTION">Custom Luxury Villa Construction</option>
            <option value="LONG_TERM_APPRECIATION">High-Growth Strategic Landholding</option>
            <option value="COMMERCIAL">Commercial / Mixed Use</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1.5">
          Buyer Specific Requirements / Notes
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Client preferences regarding plot facing, Vastu orientation, site visit availability..."
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Mandatory Customer Consent Evidence Confirmation */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="consentConfirmed"
            required
            className="mt-1 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
          />
          <span className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-400">Verifiable Representation Consent:</strong> I certify that I have obtained explicit, verifiable consent from this prospective buyer authorizing Ratiwal Dream Estates and its advisory team to communicate project details, schedule site visits, and process booking documentation under the Digital Personal Data Protection (DPDP) Act.
          </span>
        </label>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-lg shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Submit & Register Attribution"}
        </button>
      </div>
    </form>
  );
}
