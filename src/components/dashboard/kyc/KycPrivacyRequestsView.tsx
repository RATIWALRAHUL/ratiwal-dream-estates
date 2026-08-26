"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { UserCheck, ShieldAlert, CheckCircle2, Clock, ArrowLeft, Send } from "lucide-react";
import { updatePrivacyRequestAction } from "@/lib/actions/kyc.actions";
import { PrivacyRequestStatus } from "@/types/kyc";

interface KycPrivacyRequestsViewProps {
  requests: any[];
}

export function KycPrivacyRequestsView({ requests }: KycPrivacyRequestsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<PrivacyRequestStatus>("COMPLETED");
  const [legalReason, setLegalReason] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await updatePrivacyRequestAction({
        requestId: selectedReq._id.toString(),
        newStatus,
        legalExceptionReason: legalReason.trim() || undefined,
        dispositionNotes: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSelectedReq(null);
        setLegalReason("");
        setNotes("");
      }
    });
  };

  return (
    <div className="space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#087fc3] font-bold">
              DPDPA 2023 • Data Principal Rights
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#071a28] tracking-tight mt-1">
            Privacy Requests & Consent Governance ({requests.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Statutory Data Principal Access, Correction, Erasure, and Grievance management.
          </p>
        </div>

        <Link
          href="/dashboard/kyc"
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-[#071a28] font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-[#071a28]">No active privacy requests!</p>
              <p>All data principal inquiries have been assessed and completed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#071a28]">
                        {req.requestNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                        {req.requestType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {req.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-slate-600 font-semibold">
                      Requester: {req.requesterEmailMasked} • Party: {req.partyId?.displayName || "—"}
                    </div>
                    <div className="text-slate-500 text-[11px] line-clamp-1">
                      Details: {req.requestDetails}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReq(req)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#071a28] font-bold text-xs shadow-2xs transition-colors self-start sm:self-center whitespace-nowrap"
                  >
                    Assess / Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assessment Panel (1 Col) */}
        <div className="space-y-6">
          {selectedReq ? (
            <div className="bg-white rounded-3xl border-2 border-[#087fc3] p-6 shadow-md space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold font-serif text-[#071a28] uppercase text-xs">
                  Assess: {selectedReq.requestNumber}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 bg-[#fbfaf8] p-3 rounded-2xl border border-slate-100 text-[11px]">
                <div className="font-bold text-[#071a28]">Request Details:</div>
                <p className="text-slate-600 leading-relaxed">{selectedReq.requestDetails}</p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Decision / Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PrivacyRequestStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs font-semibold"
                  >
                    <option value="APPROVED_IN_PROGRESS">Approved - Processing</option>
                    <option value="COMPLETED">Completed / Fulfilled</option>
                    <option value="REJECTED_LEGAL_EXCEPTION">Rejected - Statutory Legal Exception</option>
                  </select>
                </div>

                {newStatus === "REJECTED_LEGAL_EXCEPTION" && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Statutory Exception Rationale *</label>
                    <textarea
                      value={legalReason}
                      onChange={(e) => setLegalReason(e.target.value)}
                      required
                      placeholder="e.g. Mandatory 8-year record retention under Section 12 PMLA 2002 prevents premature deletion of transacting buyer files."
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Disposition Remarks</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal resolution notes..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#fbfaf8] text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl bg-[#071a28] hover:bg-[#0d2c42] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-[#42b7e8]" />
                  <span>{isPending ? "Saving..." : "Save Assessment"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-xs space-y-3 text-xs">
              <h3 className="font-bold font-serif text-[#071a28] uppercase text-xs">
                DPDPA Statutory Turnaround
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Data Principal Requests must be assessed and responded to within statutory target timelines. If an erasure request cannot be granted due to statutory conveyance or tax retention obligations, the lawful exception rationale must be documented.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
