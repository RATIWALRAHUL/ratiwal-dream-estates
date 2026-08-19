import { Download, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { DownloadableResource } from "@/types/insight";

interface ResourceCardProps {
  resource: DownloadableResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div
      className="p-6 sm:p-7 rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_12px_32px_rgba(7,26,40,0.08)] hover:border-[rgba(7,132,200,0.3)] transition-all duration-300 flex flex-col justify-between"
      aria-labelledby={`res-title-${resource.slug}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#edf5f9] text-[#0784C8] flex items-center justify-center flex-shrink-0 shadow-2xs">
            <FileText className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#F5F1E9] text-[#667d8f] border border-[rgba(7,26,40,0.06)]">
              {resource.version}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#edf5f9] text-[#0784C8] font-bold">
              {resource.fileType}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          id={`res-title-${resource.slug}`}
          className="font-heading text-lg text-[#031C2B] font-bold leading-snug mb-2.5"
        >
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-6">
          {resource.description}
        </p>
      </div>

      {/* Footer & Download Button */}
      <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between gap-3 mt-auto">
        <div className="text-[11px] text-[#7a93a5] font-mono">
          <span>{resource.fileSize}</span> • <span>{resource.updatedAt}</span>
        </div>

        <a
          href={resource.fileUrl}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#031C2B] hover:bg-[#0784C8] text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#031C2B]"
          aria-label={`Download ${resource.title} (${resource.fileType}, ${resource.fileSize})`}
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Download Tool</span>
        </a>
      </div>
    </div>
  );
}
