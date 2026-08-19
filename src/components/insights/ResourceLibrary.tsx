import { FileCheck2, Scale } from "lucide-react";
import { DownloadableResource } from "@/types/insight";
import { ResourceCard } from "./ResourceCard";

interface ResourceLibraryProps {
  resources: DownloadableResource[];
}

export function ResourceLibrary({ resources }: ResourceLibraryProps) {
  if (!resources || resources.length === 0) {
    return null;
  }

  return (
    <section id="resource-library" className="py-16 md:py-24 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="resources-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Header */}
        <div className="max-w-[720px] mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Practical Resources</span>
          </div>
          <h2
            id="resources-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Tools to help you ask better questions.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Download our standardized due diligence checklists, on-site inspection protocols, and document requisition templates to audit any land opportunity with clarity.
          </p>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {resources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>

        {/* Safety & Educational Disclaimer */}
        <div className="mt-10 p-4 rounded-xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.08)] flex items-start gap-3">
          <Scale className="w-4 h-4 text-[#0784C8] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#667d8f] leading-relaxed">
            <strong>Educational Disclaimer:</strong> These downloadable resources are provided for general educational guidance and due diligence preparation. They do not replace independent legal title examination by a qualified advocate, structural engineer survey, or official municipal NOC certification.
          </p>
        </div>
      </div>
    </section>
  );
}
