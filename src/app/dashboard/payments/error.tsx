"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function PaymentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Payments Error]", error);
  }, [error]);

  return (
    <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-xs max-w-xl mx-auto my-12 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-lg font-bold font-serif text-[#071a28]">
          Failed to load payments ledger
        </h2>
        <p className="text-xs text-[#647581] mt-1">
          {error.message || "An unexpected error occurred while loading payment plans and transaction records."}
        </p>
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
