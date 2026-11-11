"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanSearch } from "lucide-react";

/** Super-admin-only. Posts with no parameters; the server decides the (fixed) scan target. */
export function SeoScanControls({ canScan }: { canScan: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "warn" | "error"; text: string } | null>(null);

  if (!canScan) return <p className="text-[11px] text-[#647581]">Only a Super Admin can run scans.</p>;

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/dashboard/seo/technical/scan", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setMsg({ tone: "error", text: json.error?.message ?? "Scan request failed." });
      } else {
        const d = json.data;
        setMsg({
          tone: d.completed ? "ok" : "warn",
          text: `${d.message} ${d.newCount} new, ${d.ongoingCount} ongoing, ${d.resolvedCount} resolved.`,
        });
      }
      router.refresh();
    } catch {
      setMsg({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ScanSearch className={`w-4 h-4 text-[#0088cc] ${busy ? "animate-pulse" : ""}`} aria-hidden="true" />
        {busy ? "Scanning… (up to a minute)" : "Run technical scan"}
      </button>
      {msg && (
        <p
          role={msg.tone === "error" ? "alert" : "status"}
          className={`text-xs ${msg.tone === "ok" ? "text-emerald-700" : msg.tone === "warn" ? "text-amber-700" : "text-rose-700"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
