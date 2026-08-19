import { CheckCircle2, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { ArticleSection } from "@/types/insight";

interface ArticleBodyProps {
  sections: ArticleSection[];
}

export function ArticleBody({ sections }: ArticleBodyProps) {
  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-4 pb-2 border-b border-[rgba(7,26,40,0.08)]">
            {section.heading}
          </h2>

          {/* Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-[#2c3e50] leading-relaxed">
            {section.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {/* Callout */}
          {section.callout && (
            <div
              className={`my-6 p-5 rounded-2xl border ${
                section.callout.type === "warning"
                  ? "bg-[#fff8f0] border-[#fcd9b6] text-[#874100]"
                  : section.callout.type === "important"
                  ? "bg-[#edf5f9] border-[#b8def0] text-[#07537d]"
                  : "bg-[#f2faf5] border-[#c0ebd2] text-[#0f6b3e]"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm uppercase tracking-wider mb-1.5">
                {section.callout.type === "warning" && <AlertTriangle className="w-4 h-4 text-[#e67e22]" />}
                {section.callout.type === "important" && <Info className="w-4 h-4 text-[#0784C8]" />}
                {section.callout.type === "tip" && <ShieldCheck className="w-4 h-4 text-[#24D17F]" />}
                <span>{section.callout.title}</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">{section.callout.text}</p>
            </div>
          )}

          {/* Checklist */}
          {section.checklist && section.checklist.length > 0 && (
            <div className="my-6 p-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-xs">
              <span className="text-xs font-bold text-[#031C2B] uppercase tracking-wider block mb-3">
                Mandatory Verification Checklist:
              </span>
              <div className="space-y-2.5">
                {section.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2c3e50]">
                    <CheckCircle2 className="w-4 h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsive Comparison Table */}
          {section.table && (
            <div className="my-6 overflow-hidden rounded-2xl border border-[rgba(7,26,40,0.1)] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#031C2B] text-white">
                      {section.table.headers.map((header, hIdx) => (
                        <th key={hIdx} className="p-3.5 sm:p-4 font-heading font-medium tracking-wide">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(7,26,40,0.06)] bg-white">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#F5F1E9] transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3.5 sm:p-4 text-[#2c3e50] leading-relaxed">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {section.table.caption && (
                <div className="p-2.5 bg-[#F5F1E9] text-[11px] text-[#667d8f] italic border-t border-[rgba(7,26,40,0.06)]">
                  Table Note: {section.table.caption}
                </div>
              )}
            </div>
          )}

          {/* Subsections */}
          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-6 space-y-6">
              {section.subsections.map((sub, sIdx) => (
                <div key={sIdx}>
                  <h3 className="font-heading text-xl text-[#031C2B] font-bold mb-2">
                    {sub.heading}
                  </h3>
                  <div className="space-y-3 text-sm text-[#2c3e50] leading-relaxed">
                    {sub.paragraphs.map((sp, pIdx) => (
                      <p key={pIdx}>{sp}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
