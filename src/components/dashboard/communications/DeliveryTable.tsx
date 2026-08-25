"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import { NotificationDeliveryItem, DeliveryStatus } from "@/types/communication";

interface DeliveryTableProps {
  items: NotificationDeliveryItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const STATUS_BADGES: Record<DeliveryStatus, { label: string; bg: string; text: string; border: string }> = {
  QUEUED: { label: "Queued", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  SENDING: { label: "Sending", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  SENT: { label: "Sent", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  READ: { label: "Read", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  FAILED: { label: "Failed", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  BOUNCED: { label: "Bounced", bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  COMPLAINED: { label: "Complained", bg: "bg-rose-50", text: "text-rose-900", border: "border-rose-300" },
  SUPPRESSED: { label: "Suppressed", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
  CANCELLED: { label: "Cancelled", bg: "bg-zinc-100", text: "text-zinc-600", border: "border-zinc-300" },
};

export function DeliveryTable({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
}: DeliveryTableProps) {
  const [selectedItem, setSelectedItem] = useState<NotificationDeliveryItem | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Masked Recipient</th>
                <th className="py-3 px-4">Provider & ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Attempt</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#647581] italic">
                    No communication delivery records found matching criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const badge = STATUS_BADGES[item.status] || STATUS_BADGES.QUEUED;
                  return (
                    <tr key={item.id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#071a28]">
                        <span className="font-mono text-[11px] block">{item.eventType}</span>
                        <span className="text-[10px] text-[#647581] font-normal">{item.templateKey}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#071a28]">
                          {item.channel === "EMAIL" ? (
                            <Mail className="w-3 h-3 text-[#087fc3]" />
                          ) : (
                            <MessageSquare className="w-3 h-3 text-[#24D17F]" />
                          )}
                          <span>{item.channel}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#071a28]">
                        {item.maskedRecipient}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold text-[#071a28] block">{item.provider}</span>
                        <span className="text-[9px] font-mono text-[#647581] truncate max-w-[120px] block">
                          {item.providerMessageId || "Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#647581]">
                        #{item.attempt}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#647581]">
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 p-1.5 rounded-lg text-[#087fc3] hover:bg-[#087fc3]/10 font-bold transition-colors"
                          title="View Delivery Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
            <span>Page {page} of {totalPages} ({totalCount} total)</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/communications/deliveries?page=${page - 1}`}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28]"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/dashboard/communications/deliveries?page=${page + 1}`}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(7,26,40,0.08)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">
                  Delivery Details
                </span>
                <h3 className="text-base font-bold font-serif text-[#071a28] mt-0.5">
                  {selectedItem.eventType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-[#647581] hover:text-[#071a28] hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f8f7f4] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#647581]">Status:</span>
                  <span className="font-bold text-[#071a28]">{selectedItem.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647581]">Channel:</span>
                  <span className="font-bold text-[#071a28]">{selectedItem.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647581]">Provider:</span>
                  <span className="font-bold text-[#071a28]">{selectedItem.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647581]">Provider ID:</span>
                  <span className="font-bold text-[#071a28] truncate max-w-[180px]">
                    {selectedItem.providerMessageId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647581]">Recipient:</span>
                  <span className="font-bold text-[#071a28]">{selectedItem.maskedRecipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#647581]">Attempt:</span>
                  <span className="font-bold text-[#071a28]">#{selectedItem.attempt}</span>
                </div>
              </div>

              {selectedItem.failureMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <p className="text-[10px] font-mono uppercase text-rose-800 font-bold">
                    Failure Info ({selectedItem.failureCategory})
                  </p>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    {selectedItem.failureMessage}
                  </p>
                </div>
              )}

              <div className="space-y-1 text-[11px] text-[#647581] pt-2">
                <p>Created: {new Date(selectedItem.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                {selectedItem.deliveredAt && (
                  <p>Delivered: {new Date(selectedItem.deliveredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                )}
                {selectedItem.readAt && (
                  <p>Read: {new Date(selectedItem.readAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
