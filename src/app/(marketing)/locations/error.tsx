"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function PublicLocationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Public Locations Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-100 shadow-sm max-w-lg w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-serif text-[#071a28]">
            Unable to Load Market Corridors
          </h2>
          <p className="text-xs text-[#647581] max-w-sm mx-auto">
            {error.message || "We encountered an issue loading location intelligence and regional maps."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
