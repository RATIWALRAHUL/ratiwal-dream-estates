"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDealAction } from "@/lib/actions/deal.actions";
import { DealPriority, DealSource } from "@/types/deal";

interface CreateDealFormProps {
  leads: {
    _id: string;
    fullName: string;
    email?: string;
    displayPhone?: string;
    assignedAdvisorId?: string;
    assignedAdvisorName?: string;
  }[];
  properties: {
    _id: string;
    title: string;
    slug: string;
  }[];
  units: {
    _id: string;
    unitNumber: string;
    referenceCode: string;
    propertyId: string;
    basePriceRupees: number;
  }[];
}

export function CreateDealForm({ leads, properties, units }: CreateDealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [leadId, setLeadId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [priority, setPriority] = useState<DealPriority>("NORMAL");
  const [source, setSource] = useState<DealSource>("DIRECT_INQUIRY");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [notes, setNotes] = useState("");

  const filteredUnits = units.filter((u) => u.propertyId === propertyId);
  const selectedUnit = units.find((u) => u._id === unitId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!leadId || !propertyId) {
      setError("Please select both a lead prospect and a property project.");
      return;
    }

    startTransition(async () => {
      const res = await createDealAction({
        leadId,
        propertyId,
        unitId: unitId || undefined,
        priority,
        source,
        expectedCloseDate: expectedCloseDate || undefined,
        offeredAmountPaise: selectedUnit ? selectedUnit.basePriceRupees * 100 : undefined,
        internalNotes: notes.trim() || undefined,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        router.push(`/dashboard/deals/${res.dealId}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Select Lead */}
      <div>
        <label className="font-semibold text-[#071a28] block mb-1">Select Buyer / Lead *</label>
        <select
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          required
          disabled={isPending}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
        >
          <option value="">-- Choose lead --</option>
          {leads.map((l) => (
            <option key={l._id} value={l._id}>
              {l.fullName} {l.displayPhone ? `(${l.displayPhone})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Select Property */}
      <div>
        <label className="font-semibold text-[#071a28] block mb-1">Select Property *</label>
        <select
          value={propertyId}
          onChange={(e) => {
            setPropertyId(e.target.value);
            setUnitId("");
          }}
          required
          disabled={isPending}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
        >
          <option value="">-- Choose property --</option>
          {properties.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Optional Select Unit */}
      <div>
        <label className="font-semibold text-[#071a28] block mb-1">
          Select Sellable Unit <span className="text-[#647581] font-normal">(Optional)</span>
        </label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          disabled={isPending || !propertyId}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
        >
          <option value="">-- Assign specific unit later or general property deal --</option>
          {filteredUnits.map((u) => (
            <option key={u._id} value={u._id}>
              Unit {u.unitNumber} ({u.referenceCode}) • ₹{u.basePriceRupees.toLocaleString("en-IN")}
            </option>
          ))}
        </select>
      </div>

      {/* Priority & Source */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-semibold text-[#071a28] block mb-1">Deal Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as DealPriority)}
            disabled={isPending}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent (Hot Lead)</option>
          </select>
        </div>

        <div>
          <label className="font-semibold text-[#071a28] block mb-1">Deal Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as DealSource)}
            disabled={isPending}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
          >
            <option value="DIRECT_INQUIRY">Direct Website Inquiry</option>
            <option value="SITE_VISIT_CONVERSION">Site Visit Conversion</option>
            <option value="CHANNEL_PARTNER">Channel Partner / Broker</option>
            <option value="REFERRAL">Client Referral</option>
            <option value="REPEAT_BUYER">Repeat Investor</option>
          </select>
        </div>
      </div>

      {/* Expected Close Date */}
      <div>
        <label className="font-semibold text-[#071a28] block mb-1">Expected Target Close Date</label>
        <input
          type="date"
          value={expectedCloseDate}
          onChange={(e) => setExpectedCloseDate(e.target.value)}
          disabled={isPending}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs font-semibold text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
        />
      </div>

      {/* Internal Notes */}
      <div>
        <label className="font-semibold text-[#071a28] block mb-1">Initial Strategy & Internal Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={isPending}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-xs text-[#071a28] focus:border-[#0088cc] focus:outline-hidden"
          placeholder="Client preferences, payment terms discussed, timeline..."
        />
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-[rgba(7,26,40,0.06)]">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="px-4 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#647581] font-semibold hover:bg-stone-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {isPending ? "Creating Deal..." : "Create Deal Workspace"}
        </button>
      </div>
    </form>
  );
}
