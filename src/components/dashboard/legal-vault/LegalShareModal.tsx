"use client";

import { useState, useTransition } from "react";
import { createLegalDocumentShareAction } from "@/lib/actions/legal-vault.actions";
import { X, Loader2, Share2, Copy, Check, Lock, AlertCircle } from "lucide-react";

interface LegalShareModalProps {
  documentId: string;
  documentReference: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LegalShareModal({
  documentId,
  documentReference,
  isOpen,
  onClose,
}: LegalShareModalProps) {
  const [intendedPurpose, setIntendedPurpose] = useState<string>("Bank Loan & Legal Due Diligence");
  const [intendedRecipientEmail, setIntendedRecipientEmail] = useState<string>("");
  const [maxDownloads, setMaxDownloads] = useState<number>(5);
  const [durationHours, setDurationHours] = useState<number>(48);
  const [passcode, setPasscode] = useState<string>("");

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const res = await createLegalDocumentShareAction({
        legalDocumentId: documentId,
        intendedPurpose,
        intendedRecipientEmail: intendedRecipientEmail || undefined,
        maxDownloads,
        durationHours,
        passcode: passcode || undefined,
      });

      if (!res.success) {
        setError(res.message);
      } else {
        const origin = window.location.origin;
        setShareUrl(`${origin}/api/legal-vault/share/${res.shareToken}`);
      }
    });
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[rgba(7,26,40,0.1)] shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(7,26,40,0.06)]">
          <div>
            <h3 className="text-base font-bold font-serif text-[#071a28]">
              Generate Expiring Share Link
            </h3>
            <p className="text-xs text-[#647581] mt-0.5">{documentReference}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-[#071a28]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!shareUrl ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Intended Purpose *</label>
              <input
                type="text"
                value={intendedPurpose}
                onChange={(e) => setIntendedPurpose(e.target.value)}
                placeholder="e.g. Bank Loan & Legal Due Diligence"
                required
                disabled={isPending}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Link Validity (Hours)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
                  disabled={isPending}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
                >
                  <option value={24}>24 Hours (1 Day)</option>
                  <option value={48}>48 Hours (2 Days)</option>
                  <option value={72}>72 Hours (3 Days)</option>
                  <option value={168}>7 Days (Max)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#071a28] block mb-1.5">Max Downloads</label>
                <select
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(parseInt(e.target.value, 10))}
                  disabled={isPending}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-semibold"
                >
                  <option value={1}>1 Download only</option>
                  <option value={3}>3 Downloads</option>
                  <option value={5}>5 Downloads</option>
                  <option value={10}>10 Downloads</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#071a28] block mb-1.5">Optional Security Passcode</label>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Leave blank for no passcode requirement"
                disabled={isPending}
                className="w-full px-3.5 py-2 rounded-xl border border-[rgba(7,26,40,0.12)] bg-[#f8f7f4] text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#647581] hover:text-[#071a28] text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!intendedPurpose.trim() || isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Secure Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 block">
                Secure Expiring Link Generated
              </span>
              <p className="text-xs text-emerald-900 font-mono break-all select-all">
                {shareUrl}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] hover:bg-[#087fc3] text-white text-xs font-bold transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Share Link"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[rgba(7,26,40,0.1)] text-[#071a28] text-xs font-bold hover:bg-[#f8f7f4]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
