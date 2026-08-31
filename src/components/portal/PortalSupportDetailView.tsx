"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send, User, ShieldCheck } from "lucide-react";
import { addSupportMessageAction } from "@/lib/actions/portal.actions";

interface PortalSupportDetailViewProps {
  ticket: any;
}

export function PortalSupportDetailView({ ticket }: PortalSupportDetailViewProps) {
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    startTransition(async () => {
      await addSupportMessageAction({
        requestId: ticket._id.toString(),
        message: replyText.trim(),
      });
      setReplyText("");
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        href="/portal/support"
        className="inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Tickets</span>
      </Link>

      {/* Ticket Header */}
      <div className="bg-[#071a28]/90 border border-white/10 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-semibold text-[#087fc3]">
                {ticket.requestNumber}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                  ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {ticket.status}
              </span>
            </div>
            <h1 className="text-xl font-serif font-bold text-white">{ticket.subject}</h1>
          </div>

          <div className="text-right text-xs text-slate-400">
            Category: {ticket.category}
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-4 py-2">
          {ticket.messages &&
            ticket.messages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  msg.senderType === "CUSTOMER"
                    ? "bg-white/5 border-white/10 text-slate-200 ml-4 sm:ml-12"
                    : "bg-[#087fc3]/10 border-[#087fc3]/30 text-white mr-4 sm:mr-12"
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[11px]">
                  <span className="flex items-center space-x-1.5">
                    {msg.senderType === "STAFF" ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#087fc3]" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{msg.senderName}</span>
                  </span>
                  <span className="text-slate-400 font-normal text-[10px]">
                    {new Date(msg.sentAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>
              </div>
            ))}
        </div>

        {/* Reply Box */}
        {ticket.status !== "CLOSED" && (
          <form onSubmit={handleSendReply} className="pt-4 border-t border-white/10 space-y-3">
            <textarea
              rows={3}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response to customer care..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#087fc3]"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-xl bg-[#087fc3] hover:bg-[#066ca8] text-xs font-semibold text-white shadow-md flex items-center space-x-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPending ? "Sending..." : "Send Reply"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
