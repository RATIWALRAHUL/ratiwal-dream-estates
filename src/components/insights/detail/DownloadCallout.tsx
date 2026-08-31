import { Download } from "lucide-react";
import { DownloadableResource } from "@/types/insight";

interface DownloadCalloutProps {
  resources: DownloadableResource[];
}

export function DownloadCallout({ resources }: DownloadCalloutProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  const primary = resources[0];

  return (
    <div className="my-10 p-6 rounded-2xl bg-gradient-to-br from-[#031C2B] to-[#072435] text-white shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-[#52BDE9] uppercase tracking-wider block mb-1">
            Complimentary Due Diligence Tool
          </span>
          <h3 className="font-heading text-lg font-bold text-white mb-2">
            {primary.title}
          </h3>
          <p className="text-xs text-[#c5d8e4] leading-relaxed max-w-xl">
            {primary.description}
          </p>
        </div>

        <a
          href={primary.fileUrl}
          download
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0784C8] hover:bg-[#129be0] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label={`Download ${primary.title} (${primary.fileType}, ${primary.fileSize})`}
        >
          <Download className="w-4 h-4" />
          <span>Download PDF ({primary.fileSize})</span>
        </a>
      </div>
    </div>
  );
}
