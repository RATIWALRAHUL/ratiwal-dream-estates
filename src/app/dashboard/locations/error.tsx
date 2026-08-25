"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function LocationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Locations Error Caught]:", error.message);
  }, [error]);

  return (
    <div className="min-h-[350px] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-rose-100 shadow-lg text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-serif text-[#071a28]">
          Failed to Load Locations
        </h2>
        <p className="text-xs text-[#647581]">
          An unexpected error occurred while querying the regional corridor directory.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071a28] text-white text-xs font-bold hover:bg-[#0a6ba3] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
