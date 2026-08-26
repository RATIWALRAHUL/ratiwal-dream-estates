"use client";

import { useState } from "react";
import Link from "next/link";
import { MoneyUtils } from "@/lib/utils/money";
import {
  approveCommissionPayoutAction,
  processCommissionPayoutAction,
} from "@/lib/actions/partner-management.actions";

interface StaffPayoutsViewProps {
  payouts: any[];
}

export function StaffPayoutsView({ payouts }: StaffPayoutsViewProps) {
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (payoutId: string) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("payoutId", payoutId);

    const res = await approveCommissionPayoutAction(formData);
    setLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || "Approval failed.");
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("payoutId", selectedPayout._id);
    formData.append("bankReferenceNumber", utr);

    const res = await processCommissionPayoutAction(formData);
    setLoading(false);

    if (res.success) {
      setSelectedPayout(null);
      window.location.reload();
    } else {
      setError(res.error || "Failed to process payout.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/commissions" className="text-xs text-amber-400 hover:underline flex items-center space-x-1 mb-2">
            <span>← Back to Commissions Ledger</span>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
            Commission Payout Batches
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maker-checker disbursements, TDS settlement, and bank transfer UTR reconciliations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="bg-[#0d131f] border border-[#232f48] rounded-xl overflow-hidden shadow-xl">
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <p>No payout batches found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#080d17] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Payout #</th>
                  <th className="px-5 py-3.5">Partner Agency</th>
                  <th className="px-5 py-3.5">Gross (₹)</th>
                  <th className="px-5 py-3.5">TDS (₹)</th>
                  <th className="px-5 py-3.5">Net Payout (₹)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Bank UTR</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-amber-400 font-medium">
                      {p.payoutNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{p.partnerId?.displayName || "Partner"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.partnerId?.partnerCode}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {MoneyUtils.formatINR(p.grossAmountPaise)}
                    </td>
                    <td className="px-5 py-4 text-red-400">
                      - {MoneyUtils.formatINR(p.tdsWithheldPaise)}
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">
                      {MoneyUtils.formatINR(p.netPayoutPaise)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === "PROCESSED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : p.status === "APPROVED"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-300">
                      {p.bankReferenceNumber || "Pending Transfer"}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {p.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => handleApprove(p._id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition-colors"
                        >
                          Approve (Checker)
                        </button>
                      )}
                      {p.status === "APPROVED" && (
                        <button
                          onClick={() => setSelectedPayout(p)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-xs transition-colors"
                        >
                          Record UTR
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record UTR Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d131f] border border-[#232f48] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-serif font-bold text-white">Record Bank Transfer UTR</h2>
              <button onClick={() => setSelectedPayout(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProcess} className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Payout Batch</p>
                <p className="text-sm font-mono text-amber-400 font-semibold">{selectedPayout.payoutNumber}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Net Disbursed Amount</p>
                <p className="text-lg font-bold text-emerald-400">{MoneyUtils.formatINR(selectedPayout.netPayoutPaise)}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bank UTR / Transaction Reference <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC202604291823"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md disabled:opacity-50"
                >
                  {loading ? "Recording..." : "Confirm Disbursement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
