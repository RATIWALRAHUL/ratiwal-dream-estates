import { Download, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { BrochureInfo } from "@/types/property";

interface PropertyBrochureDownloadsProps {
  brochure?: BrochureInfo;
  propertyName: string;
}

export function PropertyBrochureDownloads({
  brochure,
  propertyName,
}: PropertyBrochureDownloadsProps) {
  if (!brochure) {
    return null;
  }

  const downloads = [
    {
      title: brochure.title,
      fileUrl: brochure.fileUrl,
      fileSize: brochure.fileSize,
      fileType: brochure.fileType,
      updatedAt: brochure.lastUpdated,
      description: "Official project specifications, sector road layouts, and plot dimension inventory.",
    },
    {
      title: "Land & Plot Due Diligence Framework",
      fileUrl: "/documents/plot-buying-due-diligence-checklist.pdf",
      fileSize: "340 KB",
      fileType: "PDF",
      updatedAt: "August 2026",
      description: "Standardized 30-year revenue search checklist & Section 90A verification guide.",
    },
  ];

  return (
    <section aria-labelledby="downloads-heading" className="mb-12">
      <div className="p-7 sm:p-8 rounded-3xl bg-white border border-[rgba(7,26,40,0.08)] shadow-[0_4px_24px_rgba(7,26,40,0.04)]">
        <div className="max-w-[720px] mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-2">
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Verified Documentation</span>
          </div>
          <h2
            id="downloads-heading"
            className="font-heading text-2xl sm:text-3xl text-[#031C2B] font-normal leading-tight tracking-tight mb-2"
          >
            Brochure &amp; project information pack.
          </h2>
          <p className="text-xs sm:text-sm text-[#4a6171]">
            Download verified project materials and due-diligence audit kits for {propertyName}.
          </p>
        </div>

        {/* Downloads Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {downloads.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white text-[#0784C8] flex items-center justify-center shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white text-[#0784C8] font-bold border border-[rgba(7,26,40,0.06)]">
                    {item.fileType} • {item.fileSize}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-[#031C2B] leading-snug mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-[#536574] leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[rgba(7,26,40,0.06)] flex items-center justify-between mt-auto">
                <span className="text-[11px] text-[#7a93a5] font-mono">Updated: {item.updatedAt}</span>
                <a
                  href={item.fileUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-xs font-bold transition-colors focus-visible:outline"
                  aria-label={`Download ${item.title}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
