import type { IntegrationStatusView } from "@/types/seo-analytics";
import { SeoSyncControls } from "./SeoSyncControls";
import { SeoCard } from "./SeoChrome";

const STATUS_STYLE: Record<IntegrationStatusView["status"], { label: string; dot: string; text: string }> = {
  CONNECTED: { label: "Connected", dot: "bg-emerald-500", text: "text-emerald-700" },
  ERROR: { label: "Connection error", dot: "bg-rose-500", text: "text-rose-700" },
  NOT_CONFIGURED: { label: "Not connected", dot: "bg-stone-400", text: "text-[#647581]" },
};

function fmtTime(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }) + " IST";
}

export function SeoConnectionPanel({
  status,
  canSync,
}: {
  status: IntegrationStatusView;
  canSync: boolean;
}) {
  const s = STATUS_STYLE[status.status];
  const lastRun = status.recentRuns[0];
  return (
    <SeoCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
            <h2 className="text-sm font-bold text-[#071a28]">Google Search Console</h2>
            <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-[11px] text-[#647581]">
            <dt>Property</dt>
            <dd className="text-[#071a28] break-all">{status.propertyId ?? "Not set (GSC_PROPERTY)"}</dd>
            <dt>Last verified</dt>
            <dd className="text-[#071a28]">{fmtTime(status.lastVerifiedAt)}</dd>
            <dt>Last full sync</dt>
            <dd className="text-[#071a28]">{fmtTime(status.lastSuccessfulSyncAt)}</dd>
            <dt>Data through</dt>
            <dd className="text-[#071a28]">
              {status.dataThroughDate ?? "—"}
              <span className="text-[#647581]"> · {status.storedDays} day{status.storedDays === 1 ? "" : "s"} stored</span>
            </dd>
            {lastRun && (
              <>
                <dt>Last run</dt>
                <dd className="text-[#071a28]">
                  {lastRun.status} · {lastRun.rangeStart} → {lastRun.rangeEnd}
                  {lastRun.queryDataTruncated ? " · query rows truncated" : ""}
                </dd>
              </>
            )}
            {status.lastErrorMessage && (
              <>
                <dt>Last error</dt>
                <dd className="text-rose-700">
                  {status.lastErrorMessage} <span className="font-mono text-[10px]">({status.lastErrorCode})</span>
                </dd>
              </>
            )}
          </dl>
        </div>
        <SeoSyncControls canSync={canSync && status.envConfigured} />
      </div>
      {canSync && !status.envConfigured && (
        <p className="mt-3 text-[11px] text-[#647581]">
          Sync controls appear once the server has Search Console credentials (see setup below).
        </p>
      )}
      {!canSync && (
        <p className="mt-3 text-[11px] text-[#647581]">Only a Super Admin can run or verify syncs.</p>
      )}
    </SeoCard>
  );
}
