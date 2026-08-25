"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log technical error safely (never log sensitive info in browser)
    console.error("[Dashboard Error Boundary Caught]:", error.message);
  }, [error]);

  return (
    <div className="min-h-[450px] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-100 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-bold block mb-1">
            System Notice
          </span>
          <h2 className="text-xl font-bold font-serif text-[#071a28]">
            Unable to Load Dashboard Data
          </h2>
          <p className="text-xs text-[#647581] mt-2 leading-relaxed">
            An unexpected error occurred while communicating with the database or aggregating catalog metrics. Please try refreshing.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[rgba(7,26,40,0.12)] text-[#071a28] text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#087fc3]" />
            <span>Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
