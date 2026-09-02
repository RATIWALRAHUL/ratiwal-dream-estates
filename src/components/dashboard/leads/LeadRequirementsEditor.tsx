"use client";

import { useState, useTransition } from "react";
import {
  MapPin,
  Building2,
  Coins,
  Globe,
  Calendar,
  Target,
  Edit3,
  X,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { updateLeadRequirementsAction } from "@/lib/actions/lead.actions";
import { formatPaiseToRupeeString } from "@/lib/utils/currency";
import type { LeadDetail } from "@/lib/services/lead.service";

interface LeadRequirementsEditorProps {
  lead: LeadDetail;
}

const LOCATION_SUGGESTIONS = [
  "Jaipur Greens",
  "Ajmer Road, Jaipur",
  "Jagatpura, Jaipur",
  "Sirsi Road, Jaipur",
  "Tonk Road, Jaipur",
  "Navi Mumbai / Panvel",
  "Bhiwadi Industrial Belt",
];

const PROPERTY_TYPES = [
  "Residential Plotted Development",
  "Commercial High-Street Plot",
  "Farmhouse / Agri-Estate",
  "Industrial / Warehousing Plot",
  "Luxury Villa Plot",
];

const BUDGET_OPTIONS = [
  "Under ₹25 Lakhs",
  "₹25L – ₹50L",
  "₹50L – ₹1 Crore",
  "₹1 Crore – ₹2.5 Crore",
  "Above ₹2.5 Crore",
];

const TIMELINE_OPTIONS = [
  { value: "IMMEDIATELY", label: "Immediately (Urgent)" },
  { value: "WITHIN_3_MONTHS", label: "Within 3 months" },
  { value: "WITHIN_6_MONTHS", label: "Within 6 months" },
  { value: "WITHIN_1_YEAR", label: "Within 1 year" },
  { value: "JUST_EXPLORING", label: "Just exploring / Market study" },
];

const PURPOSE_OPTIONS = [
  { value: "SELF_USE", label: "Self-Use / Residence" },
  { value: "INVESTMENT", label: "Investment / Capital Growth" },
  { value: "BOTH", label: "Both (Dual Purpose)" },
  { value: "NOT_DECIDED", label: "Advisory Consultation Required" },
];

export function LeadRequirementsEditor({ lead }: LeadRequirementsEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferredLocation, setPreferredLocation] = useState(lead.preferredLocation || lead.locationName || "");
  const [propertyTypeInterest, setPropertyTypeInterest] = useState(lead.propertyTypeInterest || lead.propertyTitle || "");
  const [budgetRange, setBudgetRange] = useState(lead.budgetRange || "");
  const [purchaseTimeline, setPurchaseTimeline] = useState(lead.purchaseTimeline || "");
  const [investmentPurpose, setInvestmentPurpose] = useState(lead.investmentPurpose || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let minPaise = lead.budgetMinimumPaise;
    let maxPaise = lead.budgetMaximumPaise;

    if (budgetRange) {
      const bStr = budgetRange.toLowerCase();
      if (bStr.includes("25") && (bStr.includes("under") || bStr.includes("<"))) {
        minPaise = 0;
        maxPaise = 25 * 100000 * 100;
      } else if (bStr.includes("25") && bStr.includes("50")) {
        minPaise = 25 * 100000 * 100;
        maxPaise = 50 * 100000 * 100;
      } else if (bStr.includes("50") && (bStr.includes("1") || bStr.includes("cr"))) {
        minPaise = 50 * 100000 * 100;
        maxPaise = 100 * 100000 * 100;
      } else if (bStr.includes("1") && bStr.includes("2.5")) {
        minPaise = 100 * 100000 * 100;
        maxPaise = 250 * 100000 * 100;
      } else if (bStr.includes("2.5") || bStr.includes("above")) {
        minPaise = 250 * 100000 * 100;
        maxPaise = 1000 * 100000 * 100;
      }
    }

    startTransition(async () => {
      const res = await updateLeadRequirementsAction(
        lead.id,
        {
          preferredLocation: preferredLocation || undefined,
          propertyTypeInterest: propertyTypeInterest || undefined,
          budgetRange: budgetRange || undefined,
          budgetMinimumPaise: minPaise,
          budgetMaximumPaise: maxPaise,
          purchaseTimeline: purchaseTimeline || undefined,
          investmentPurpose: investmentPurpose || undefined,
        },
        lead.version
      );

      if (res.success) {
        setIsOpen(false);
      } else {
        setError(res.message);
      }
    });
  };

  const displayLocation = lead.locationName || lead.preferredLocation;
  const displayCategory = lead.propertyTitle || lead.propertyTypeInterest;
  const displayBudget =
    lead.budgetMinimumPaise !== undefined
      ? `${formatPaiseToRupeeString(lead.budgetMinimumPaise)}${lead.budgetMaximumPaise ? ` – ${formatPaiseToRupeeString(lead.budgetMaximumPaise)}` : ""}`
      : lead.budgetRange;

  return (
    <>
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs p-6">
        <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(7,26,40,0.06)] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#087fc3]" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#071a28] font-bold">
              Inquiry Details &amp; Lead Source
            </h3>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f7f4] hover:bg-[#087fc3] hover:text-white text-xs font-bold text-[#071a28] border border-[rgba(7,26,40,0.08)] transition-all shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit / Add Details</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target Location / Corridor */}
          <div
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3 hover:border-[#087fc3]/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4 text-[#087fc3]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide flex items-center justify-between">
                <span>Preferred Location / Corridor</span>
                <span className="text-[9px] text-[#087fc3] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
              </p>
              <p className="text-sm font-bold text-[#071a28] mt-0.5">
                {displayLocation || (
                  <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1">
                    + Add Preferred Location
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Asset Type / Property */}
          <div
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3 hover:border-[#087fc3]/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide flex items-center justify-between">
                <span>Asset / Interest Category</span>
                <span className="text-[9px] text-[#087fc3] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
              </p>
              <p className="text-sm font-bold text-[#071a28] mt-0.5 truncate">
                {displayCategory || (
                  <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1">
                    + Set Property Category
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Investment Budget */}
          <div
            onClick={() => setIsOpen(true)}
            className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3 hover:border-[#087fc3]/40 cursor-pointer transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide flex items-center justify-between">
                <span>Investment Budget</span>
                <span className="text-[9px] text-[#087fc3] opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
              </p>
              <p className="text-sm font-bold text-[#071a28] mt-0.5">
                {displayBudget || (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1">
                    + Set Investment Budget
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Exact Form & Origin */}
          <div className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">
                Submission Source &amp; Form
              </p>
              <p className="text-sm font-bold text-[#071a28] mt-0.5">
                {lead.propertyTitle
                  ? `${lead.propertyTitle} Page Form`
                  : lead.landingPath === "/contact" || lead.source === "CONTACT_PAGE"
                  ? "Contact Us Page Form"
                  : lead.landingPath
                  ? `${lead.landingPath} Form`
                  : lead.source}
              </p>
              {lead.landingPath && (
                <span className="text-[10px] font-mono text-[#087fc3] block truncate">
                  {lead.landingPath}
                </span>
              )}
            </div>
          </div>

          {/* Purchase Timeline */}
          {lead.purchaseTimeline && (
            <div
              onClick={() => setIsOpen(true)}
              className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3 hover:border-[#087fc3]/40 cursor-pointer transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">
                  Target Timeline
                </p>
                <p className="text-sm font-bold text-[#071a28] mt-0.5">
                  {lead.purchaseTimeline.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}

          {/* Investment Purpose */}
          {lead.investmentPurpose && (
            <div
              onClick={() => setIsOpen(true)}
              className="p-4 rounded-2xl bg-[#f8f7f4]/80 border border-[rgba(7,26,40,0.06)] flex items-start gap-3 hover:border-[#087fc3]/40 cursor-pointer transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <p className="text-[10px] text-[#647581] font-mono uppercase tracking-wide">
                  Acquisition Purpose
                </p>
                <p className="text-sm font-bold text-[#071a28] mt-0.5">
                  {lead.investmentPurpose.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071a28]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.12)] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(7,26,40,0.06)] bg-[#faf9f6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#087fc3]/10 text-[#087fc3] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#071a28]">Update Lead Investment Requirements</h3>
                  <p className="text-[11px] text-[#647581]">Record client budget, preferred micro-market &amp; purchase timeline</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-[#647581] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Preferred Location */}
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Preferred Location / Micro-Market
                </label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Jaipur Greens / Ajmer Road / Panvel"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
                />
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  <span className="text-[10px] font-mono text-[#647581] mr-1 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Chips:
                  </span>
                  {LOCATION_SUGGESTIONS.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setPreferredLocation(loc)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-100 hover:bg-[#087fc3] hover:text-white text-[#071a28] transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Category */}
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Asset Category / Property Type
                </label>
                <select
                  value={propertyTypeInterest}
                  onChange={(e) => setPropertyTypeInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
                >
                  <option value="">Select or choose asset category...</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Budget */}
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Investment Budget Bracket
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                  {BUDGET_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudgetRange(b)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        budgetRange === b
                          ? "bg-[#071a28] text-white border-[#071a28] shadow-sm"
                          : "bg-[#faf9f6] text-[#071a28] border-[rgba(7,26,40,0.08)] hover:border-[#087fc3]"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  placeholder="Or enter custom budget (e.g. ₹75 Lakhs – ₹1.2 Cr)..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
                />
              </div>

              {/* Purchase Timeline */}
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Target Purchase Timeline
                </label>
                <select
                  value={purchaseTimeline}
                  onChange={(e) => setPurchaseTimeline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
                >
                  <option value="">Select client timeline...</option>
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Purpose */}
              <div>
                <label className="block text-xs font-bold text-[#071a28] mb-1">
                  Acquisition Purpose
                </label>
                <select
                  value={investmentPurpose}
                  onChange={(e) => setInvestmentPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#087fc3]/30 shadow-2xs"
                >
                  <option value="">Select purpose...</option>
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(7,26,40,0.06)]">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#647581] hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#087fc3] disabled:opacity-50 transition-all shadow-sm"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
