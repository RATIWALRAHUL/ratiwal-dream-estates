import { CheckCircle2, Bookmark } from "lucide-react";

interface KeyTakeawaysProps {
  takeaways: string[];
}

export function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) {
    return null;
  }

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.1)] mb-10 shadow-2xs" aria-label="Key Takeaways">
      <div className="flex items-center gap-2 text-xs font-bold text-[#0784C8] uppercase tracking-wider mb-3">
        <Bookmark className="w-4 h-4" aria-hidden="true" />
        <span>Executive Summary &amp; Key Points</span>
      </div>

      <div className="space-y-3">
        {takeaways.map((point, index) => (
          <div key={index} className="flex items-start gap-3 text-xs sm:text-sm text-[#031C2B] leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
