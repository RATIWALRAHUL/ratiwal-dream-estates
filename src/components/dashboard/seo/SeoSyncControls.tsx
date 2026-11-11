"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, PlugZap } from "lucide-react";

type Result = { tone: "ok" | "warn" | "error"; text: string } | null;

/** Super-admin-only controls. Calls the server route; no credentials ever reach the browser. */
export function SeoSyncControls({ canSync }: { canSync: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);

  if (!canSync) return null;

  async function call(label: string, body: Record<string, unknown>) {
    setBusy(label);
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/seo/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) {
        setResult({ tone: "error", text: json.error?.message ?? "Request failed." });
      } else if (body.mode === "verify") {
        setResult(json.data.ok ? { tone: "ok", text: json.data.message } : { tone: "error", text: json.data.message });
      } else {
        const d = json.data;
        setResult({
          tone: d.status === "SUCCEEDED" ? "ok" : "warn",
          text: `${d.status}: ${d.message} (${d.dailyRowsUpserted} daily rows, ${d.queryPageRowsUpserted} query rows${
            d.queryDataTruncated ? ", query data truncated at the per-day cap" : ""
          })`,
        });
      }
      router.refresh();
    } catch {
      setResult({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[rgba(7,26,40,0.12)] bg-white text-[#071a28] hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} disabled={busy !== null} onClick={() => call("verify", { mode: "verify" })}>
          <PlugZap className="w-3.5 h-3.5" aria-hidden="true" />
          {busy === "verify" ? "Testing…" : "Test connection"}
        </button>
        <button type="button" className={btn} disabled={busy !== null} onClick={() => call("sync7", { mode: "sync", days: 7 })}>
          <RefreshCw className={`w-3.5 h-3.5 ${busy === "sync7" ? "animate-spin" : ""}`} aria-hidden="true" />
          {busy === "sync7" ? "Syncing…" : "Sync last 7 days"}
        </button>
        <button type="button" className={btn} disabled={busy !== null} onClick={() => call("sync90", { mode: "sync", days: 90 })}>
          <RefreshCw className={`w-3.5 h-3.5 ${busy === "sync90" ? "animate-spin" : ""}`} aria-hidden="true" />
          {busy === "sync90" ? "Backfilling…" : "Backfill 90 days"}
        </button>
      </div>
      {result && (
        <p
          role={result.tone === "error" ? "alert" : "status"}
          className={`text-xs ${
            result.tone === "ok" ? "text-emerald-700" : result.tone === "warn" ? "text-amber-700" : "text-rose-700"
          }`}
        >
          {result.text}
        </p>
      )}
    </div>
  );
}
