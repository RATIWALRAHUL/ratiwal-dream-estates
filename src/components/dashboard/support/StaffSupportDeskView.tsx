"use client";

import React, { useState, useTransition } from "react";
import { LifeBuoy, Send, Clock, User, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { staffReplySupportAction } from "@/lib/actions/portal-management.actions";

interface StaffSupportDeskViewProps {
  tickets: any[];
}

export function StaffSupportDeskView({ tickets }: StaffSupportDeskViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?._id?.toString() || "");
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState<any>("AWAITING_CUSTOMER");
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedTicket = tickets.find((t) => t._id.toString() === selectedTicketId) || tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    startTransition(async () => {
      await staffReplySupportAction({
        requestId: selectedTicket._id.toString(),
        message: replyMessage.trim(),
        status: newStatus,
        resolutionSummary: newStatus === "RESOLVED" ? resolutionSummary : undefined,
      });
      setReplyMessage("");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#071a28]">
          Customer Support & Care Desk
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review, assign, and respond to incoming customer portal inquiries and tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ticket List */}
        <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] p-4 shadow-sm space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            Active Tickets ({tickets.length})
          </div>

          {tickets.length > 0 ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => {
                const isSelected = t._id.toString() === selectedTicketId;
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setSelectedTicketId(t._id.toString())}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#087fc3]/10 border-[#087fc3] text-[#071a28]"
                        : "bg-white border-slate-100 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-semibold text-[#087fc3]">
                        {t.requestNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[#071a28] truncate">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{t.category}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No open customer tickets.
            </div>
          )}
        </div>

        {/* Right: Active Ticket Thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] p-6 shadow-sm flex flex-col justify-between space-y-6">
          {selectedTicket ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#087fc3]">
                        {selectedTicket.requestNumber}
                      </span>
                      <span className="text-xs text-slate-500">• Category: {selectedTicket.category}</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#071a28] mt-1">{selectedTicket.subject}</h2>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Priority: <span className="font-semibold">{selectedTicket.priority}</span>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                  {selectedTicket.messages?.map((msg: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        msg.senderType === "STAFF"
                          ? "bg-[#087fc3]/5 border-[#087fc3]/20 ml-6"
                          : "bg-slate-50 border-slate-100 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-[11px]">
                        <span className="text-[#071a28]">{msg.senderName} ({msg.senderType})</span>
                        <span className="text-slate-400 font-normal text-[10px]">
                          {new Date(msg.sentAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Response Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Set Ticket Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                    >
                      <option value="AWAITING_CUSTOMER">Awaiting Customer Reply</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Mark Resolved</option>
                      <option value="CLOSED">Close Ticket</option>
                    </select>
                  </div>

                  {newStatus === "RESOLVED" && (
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Resolution Summary</label>
                      <input
                        type="text"
                        value={resolutionSummary}
                        onChange={(e) => setResolutionSummary(e.target.value)}
                        placeholder="Brief summary of resolution..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                      />
                    </div>
                  )}
                </div>

                <textarea
                  rows={3}
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Draft official customer reply..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#087fc3]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-sm flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPending ? "Sending Reply..." : "Send Staff Reply"}</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Select a support ticket to inspect conversation thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
