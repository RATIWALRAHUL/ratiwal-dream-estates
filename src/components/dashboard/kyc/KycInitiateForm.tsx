"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  User,
  Building2,
  Users,
  Plus,
  Trash2,
  Lock,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { initiateKycCaseAction } from "@/lib/actions/kyc.actions";
import { CustomerPartyType, ApplicantRole } from "@/types/kyc";

interface KycInitiateFormProps {
  properties: any[];
  deals: any[];
  templates: any[];
}

export function KycInitiateForm({
  properties,
  deals,
  templates,
}: KycInitiateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [partyType, setPartyType] = useState<CustomerPartyType>("INDIVIDUAL");
  const [propertyId, setPropertyId] = useState(properties[0]?._id?.toString() || "");
  const [selectedDealId, setSelectedDealId] = useState("");
  const [templateKey, setTemplateKey] = useState("INDIVIDUAL_RESIDENTIAL");
  const [purpose, setPurpose] = useState("Real Estate Conveyance Due Diligence & Identity Verification");

  // Primary Applicant State
  const [primaryName, setPrimaryName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [primaryPan, setPrimaryPan] = useState("");
  const [primaryAadhaar, setPrimaryAadhaar] = useState("");
  const [primaryCity, setPrimaryCity] = useState("Jaipur");
  const [primaryState, setPrimaryState] = useState("Rajasthan");

  // Co-Applicants State
  const [coApplicants, setCoApplicants] = useState<
    Array<{
      role: ApplicantRole;
      fullName: string;
      email: string;
      phone: string;
      pan: string;
      aadhaarNumber: string;
      city: string;
      state: string;
    }>
  >([]);

  const handleAddCoApplicant = () => {
    setCoApplicants((prev) => [
      ...prev,
      {
        role: "JOINT",
        fullName: "",
        email: "",
        phone: "",
        pan: "",
        aadhaarNumber: "",
        city: primaryCity,
        state: primaryState,
      },
    ]);
  };

  const handleRemoveCoApplicant = (index: number) => {
    setCoApplicants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCoApplicant = (index: number, field: string, value: string) => {
    setCoApplicants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName.trim()) {
      setFormError("Primary applicant name is required.");
      return;
    }
    if (!propertyId) {
      setFormError("Property selection is required.");
      return;
    }

    setFormError(null);

    startTransition(async () => {
      const res = await initiateKycCaseAction({
        partyType,
        templateKey,
        propertyId,
        dealId: selectedDealId || undefined,
        purpose,
        primaryApplicant: {
          fullName: primaryName.trim(),
          email: primaryEmail.trim() || undefined,
          phone: primaryPhone.trim() || undefined,
          pan: primaryPan.trim() || undefined,
          aadhaarNumber: primaryAadhaar.trim() || undefined,
          city: primaryCity.trim(),
          state: primaryState.trim(),
        },
        coApplicants: coApplicants.map((co) => ({
          role: co.role,
          fullName: co.fullName.trim(),
          email: co.email.trim() || undefined,
          phone: co.phone.trim() || undefined,
          pan: co.pan.trim() || undefined,
          aadhaarNumber: co.aadhaarNumber.trim() || undefined,
          city: co.city.trim(),
          state: co.state.trim(),
        })),
      });

      if (!res.success) {
        setFormError(res.message);
      } else {
        const data = res.data as { caseId: string };
        router.push(`/dashboard/kyc/cases/${data.caseId}`);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 antialiased">
      <Link
        href="/dashboard/kyc/cases"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#071a28] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to KYC Cases</span>
      </Link>

      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
            DPDPA Compliant Onboarding
          </span>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Initiate Customer KYC Case
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create a structured buyer identity file, define applicant relationships, and assign verification requirement checklists.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Section 1: Entity & Property Context */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Purchasing Party & Asset Context
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#071a28] block mb-1">Party Entity Type *</label>
                <select
                  value={partyType}
                  onChange={(e) => {
                    const val = e.target.value as CustomerPartyType;
                    setPartyType(val);
                    if (val === "JOINT_APPLICANTS") setTemplateKey("JOINT_RESIDENTIAL");
                    else if (val === "COMPANY") setTemplateKey("COMMERCIAL_ENTITY");
                    else setTemplateKey("INDIVIDUAL_RESIDENTIAL");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                >
                  <option value="INDIVIDUAL">Individual Buyer</option>
                  <option value="JOINT_APPLICANTS">Joint Applicants / Co-Buyers</option>
                  <option value="COMPANY">Company / Corporate Entity</option>
                  <option value="PARTNERSHIP">Partnership Firm</option>
                  <option value="TRUST">Trust / Society</option>
                  <option value="HUF">Hindu Undivided Family (HUF)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Target Property *</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                >
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.code || "PRP"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Link Active Deal (Optional)</label>
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
                >
                  <option value="">-- Standalone KYC --</option>
                  {deals.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.dealNumber} ({d.leadId?.fullName || "Lead"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#071a28] block mb-1">Requirement Template *</label>
              <select
                value={templateKey}
                onChange={(e) => setTemplateKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold text-[#071a28]"
              >
                {templates.map((t) => (
                  <option key={t.templateKey} value={t.templateKey}>
                    {t.name} (v{t.version})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Primary Applicant */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Primary Applicant Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-[#071a28] block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={primaryName}
                  onChange={(e) => setPrimaryName(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={primaryEmail}
                  onChange={(e) => setPrimaryEmail(e.target.value)}
                  placeholder="rahul.sharma@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">PAN Card Number</label>
                <input
                  type="text"
                  value={primaryPan}
                  onChange={(e) => setPrimaryPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">Aadhaar (Optional)</label>
                <input
                  type="text"
                  value={primaryAadhaar}
                  onChange={(e) => setPrimaryAadhaar(e.target.value)}
                  placeholder="XXXX-XXXX-1234"
                  maxLength={14}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1">City / State</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={primaryCity}
                    onChange={(e) => setPrimaryCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                  />
                  <input
                    type="text"
                    value={primaryState}
                    onChange={(e) => setPrimaryState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Co-Applicants / Joint Buyers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold font-serif text-[#071a28] uppercase tracking-wider">
                3. Co-Applicants & Joint Owners ({coApplicants.length})
              </h3>
              <button
                type="button"
                onClick={handleAddCoApplicant}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#071a28] font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Co-Applicant</span>
              </button>
            </div>

            {coApplicants.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#fbfaf8] border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                No co-applicants added. Click "Add Co-Applicant" to include joint owners or signatories.
              </div>
            ) : (
              <div className="space-y-4">
                {coApplicants.map((co, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#fbfaf8] border border-slate-200 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#071a28] uppercase tracking-wider text-[10px]">
                        Co-Applicant #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoApplicant(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Role</label>
                        <select
                          value={co.role}
                          onChange={(e) => updateCoApplicant(idx, "role", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        >
                          <option value="JOINT">Joint Owner</option>
                          <option value="AUTHORIZED_SIGNATORY">Authorized Signatory</option>
                          <option value="BENEFICIAL_OWNER">Beneficial Owner</option>
                          <option value="GUARDIAN">Legal Guardian</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={co.fullName}
                          onChange={(e) => updateCoApplicant(idx, "fullName", e.target.value)}
                          required
                          placeholder="Full Name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">PAN</label>
                        <input
                          type="text"
                          value={co.pan}
                          onChange={(e) => updateCoApplicant(idx, "pan", e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Phone</label>
                        <input
                          type="tel"
                          value={co.phone}
                          onChange={(e) => updateCoApplicant(idx, "phone", e.target.value)}
                          placeholder="+91..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/kyc/cases"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#42b7e8]" />
              <span>{isPending ? "Creating Case..." : "Initiate KYC Case"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
