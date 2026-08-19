import { ExternalLink, BookCheck } from "lucide-react";
import { SourceReference } from "@/types/insight";

interface SourceListProps {
  sources?: SourceReference[];
}

export function SourceList({ sources }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 border-t border-[rgba(7,26,40,0.1)] mt-12" aria-labelledby="sources-heading">
      <div className="flex items-center gap-2 text-xs font-bold text-[#0784C8] uppercase tracking-wider mb-4">
        <BookCheck className="w-4 h-4" aria-hidden="true" />
        <h3 id="sources-heading">Statutory References &amp; Authoritative Sources</h3>
      </div>

      <ul className="space-y-3 text-xs text-[#536574]">
        {sources.map((src, idx) => (
          <li key={idx} className="p-3.5 rounded-xl bg-white border border-[rgba(7,26,40,0.08)] flex items-start justify-between gap-4">
            <div>
              <strong className="text-[#031C2B] block mb-0.5">{src.title}</strong>
              <span className="text-[#667d8f]">
                Published by: {src.publisher} • Accessed: {src.accessedAt}
              </span>
            </div>

            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#0784C8] hover:underline font-medium flex-shrink-0"
              aria-label={`Open statutory source: ${src.title} (opens in a new tab)`}
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
