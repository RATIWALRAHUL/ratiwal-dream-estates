"use client";

import { useState } from "react";
import { uploadPartnerInvoiceAction } from "@/lib/actions/partner.actions";

interface PartnerDocumentsViewProps {
  profile: any;
}

export function PartnerDocumentsView({ profile }: PartnerDocumentsViewProps) {
  const [invoiceNum, setInvoiceNum] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [taxableAmount, setTaxableAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [docKey, setDocKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append("invoiceNumber", invoiceNum);
    formData.append("invoiceDate", invoiceDate);
    formData.append("taxableAmountPaise", String(Math.round(parseFloat(taxableAmount || "0") * 100)));
    formData.append("totalInvoiceAmountPaise", String(Math.round(parseFloat(totalAmount || "0") * 100)));
    formData.append("documentKey", docKey || `invoices/partner_${Date.now()}.pdf`);

    const res = await uploadPartnerInvoiceAction(formData);
    setUploading(false);

    if (res.success) {
      setStatusMsg("GST Invoice submitted successfully for finance review.");
      setInvoiceNum("");
      setTaxableAmount("");
      setTotalAmount("");
    } else {
      setStatusMsg(`Error: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Compliance Documents & Invoices
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your verified partner agreements, uploaded RERA certificates, and submit GST invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Artifacts */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Active Agreements & Certificates
          </h2>

          <div className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">Channel Partner Agreement</p>
                <p className="text-xs text-slate-400 font-mono">
                  {profile.agreement?.agreementNumber || "RDE-PAGR-STANDARD"} ({profile.agreement?.templateVersion || "v2026.1"})
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {profile.agreement?.status || "ACTIVE"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-sm font-semibold text-white">State RERA License</p>
                <p className="text-xs text-slate-400 font-mono">
                  {profile.reraRegistration?.stateAuthority || "Rajasthan RERA"} • {profile.reraRegistration?.registrationNumberMasked || "Masked"}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                profile.reraRegistration?.status === "OFFICIAL_SOURCE_VERIFIED" || profile.reraRegistration?.status === "INTERNALLY_REVIEWED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
              }`}>
                {profile.reraRegistration?.status || "PENDING"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">PAN & GST Verification</p>
                <p className="text-xs text-slate-400 font-mono">
                  PAN: {profile.taxProfile?.panMasked || "ABCDE****F"} • GSTIN: {profile.taxProfile?.gstinMasked || "Not Registered"}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {profile.taxProfile?.reviewStatus || "VERIFIED"}
              </span>
            </div>
          </div>
        </div>

        {/* Submit GST Invoice Form */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Submit Partner Commission Invoice
          </h2>

          <form onSubmit={handleInvoiceSubmit} className="bg-[#0d131f] border border-[#232f48] rounded-xl p-5 space-y-4 shadow-lg">
            {statusMsg && (
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300">
                {statusMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Number</label>
              <input
                type="text"
                required
                placeholder="e.g. INV/2026/042"
                value={invoiceNum}
                onChange={(e) => setInvoiceNum(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Date</label>
                <input
                  type="date"
                  required
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Taxable Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={taxableAmount}
                  onChange={(e) => setTaxableAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Invoice Value (₹ Incl. GST)</label>
              <input
                type="number"
                required
                placeholder="59000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Document Key / Storage URL</label>
              <input
                type="text"
                placeholder="invoices/my_signed_invoice.pdf"
                value={docKey}
                onChange={(e) => setDocKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-lg shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {uploading ? "Submitting Invoice..." : "Submit Invoice for Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
