"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { RotateCw, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { retryDeadLetterAction } from "@/lib/actions/communication.actions";

interface DeadLetterItem {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  recipientType: string;
  recipientEmail?: string;
  recipientPhone?: string;
  channels: string[];
  attemptCount: number;
  maxAttempts: number;
  lastErrorCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeadLetterTableProps {
  items: DeadLetterItem[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
  userRole: string;
}

export function DeadLetterTable({
  items,
  totalCount,
  page,
  perPage,
  totalPages,
  userRole,
}: DeadLetterTableProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const handleRetry = (outboxId: string) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await retryDeadLetterAction(outboxId);
      if (result.success) {
        setSuccessMessage("Outbox item moved back to pending queue for immediate delivery.");
      } else {
        setErrorMessage(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[rgba(7,26,40,0.06)] text-[10px] font-mono uppercase tracking-wider text-[#647581]">
                <th className="py-3 px-4">Event & Entity</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Last Error</th>
                <th className="py-3 px-4">Failed At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(7,26,40,0.04)]">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#647581] italic">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    No dead-letter items. All notification queues are healthy!
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f7f4]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#071a28]">
                      <span className="font-mono text-[11px] block">{item.eventType}</span>
                      <span className="text-[10px] text-[#647581] font-normal">
                        {item.aggregateType} #{item.aggregateId.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#071a28]">
                      {item.recipientEmail || item.recipientPhone || "N/A"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-[#647581]">
                      {item.channels.join(", ")}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-purple-700 font-bold">
                      {item.attemptCount} / {item.maxAttempts}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-rose-700 max-w-[180px] truncate">
                      {item.lastErrorCode || "MAX_RETRIES_EXCEEDED"}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#647581]">
                      {new Date(item.updatedAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleRetry(item.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-[10px] font-bold transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCw className="w-3 h-3" />}
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Super Admin only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between text-xs text-[#647581]">
            <span>Page {page} of {totalPages} ({totalCount} items)</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/communications/dead-letter?page=${page - 1}`}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28]"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/dashboard/communications/dead-letter?page=${page + 1}`}
                  className="px-3 py-1.5 rounded-xl border border-[rgba(7,26,40,0.1)] hover:bg-[#f8f7f4] font-bold text-[#071a28]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
