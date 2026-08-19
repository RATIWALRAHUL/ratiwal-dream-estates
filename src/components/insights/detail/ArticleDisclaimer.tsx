import { Scale } from "lucide-react";
import { InsightCategory } from "@/types/insight";

interface ArticleDisclaimerProps {
  category: InsightCategory;
}

export function ArticleDisclaimer({ category }: ArticleDisclaimerProps) {
  const isLegalOrRera =
    category === "Legal & Documentation" || category === "RERA Education";

  const disclaimerText = isLegalOrRera
    ? "This guide provides general information and statutory reference frameworks. It does not constitute formal legal or conveyancing advice. Buyers must consult a qualified property advocate and the competent municipal/revenue development authority before executing agreements or releasing funds."
    : "Market and infrastructure information is provided for general educational purposes. Property values, zoning classifications, statutory development timelines, and investment outcomes are subject to regulatory changes. Independent on-ground verification and professional advice are recommended.";

  return (
    <div className="my-10 p-5 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.1)] flex items-start gap-3.5">
      <Scale className="w-5 h-5 text-[#0784C8] flex-shrink-0 mt-0.5" />
      <div className="text-xs text-[#536574] leading-relaxed">
        <strong className="text-[#031C2B] block mb-1">
          {isLegalOrRera ? "Statutory Legal Notice:" : "Market Advisory Notice:"}
        </strong>
        <p>{disclaimerText}</p>
      </div>
    </div>
  );
}
