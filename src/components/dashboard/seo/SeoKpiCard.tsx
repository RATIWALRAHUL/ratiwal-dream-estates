import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { DeltaView } from "./seo-ui";

const TONE: Record<DeltaView["tone"], string> = {
  good: "bg-emerald-50 text-emerald-700",
  bad: "bg-rose-50 text-rose-700",
  flat: "bg-stone-100 text-[#647581]",
  none: "bg-stone-100 text-[#647581]",
};

/** KPI tile. Every tile states its source and period so no number is context-free. */
export function SeoKpiCard({
  title,
  value,
  delta,
  caption,
  hint,
}: {
  title: string;
  value: string;
  delta: DeltaView;
  caption: string;
  hint?: string;
}) {
  const Icon = delta.tone === "good" || delta.tone === "bad" ? (delta.text.startsWith("+") ? ArrowUpRight : ArrowDownRight) : Minus;
  return (
    <div className="bg-white rounded-2xl border border-[rgba(7,26,40,0.08)] shadow-xs p-5 flex flex-col justify-between">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#647581] font-bold">{title}</span>
      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-bold font-serif text-[#071a28] tabular-nums">{value}</p>
        <span
          className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${TONE[delta.tone]}`}
        >
          <Icon className="w-3 h-3" aria-hidden="true" />
          {delta.text}
        </span>
        {/* Direction is also conveyed in words for non-visual readers */}
        <span className="sr-only">
          {delta.tone === "good" ? " (improvement)" : delta.tone === "bad" ? " (worse)" : ""}
        </span>
      </div>
      <p className="mt-3 text-[10px] text-[#647581] leading-snug">{caption}</p>
      {hint && <p className="mt-1 text-[10px] text-[#647581]/80 leading-snug">{hint}</p>}
    </div>
  );
}
