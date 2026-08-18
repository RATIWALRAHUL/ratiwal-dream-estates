import React from "react";
import { LegalSectionItem } from "@/types/legal";
import { LegalCallout } from "./LegalCallout";
import { Check } from "lucide-react";

interface LegalSectionProps {
  section: LegalSectionItem;
}

export function LegalSection({ section }: LegalSectionProps) {
  return (
    <article
      id={section.id}
      className="scroll-mt-28 sm:scroll-mt-32 pt-8 sm:pt-10 first:pt-0 border-t first:border-t-0 border-[rgba(7,26,40,0.08)]"
      aria-labelledby={`heading-${section.id}`}
    >
      {/* Section Header */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface)] border border-[rgba(7,26,40,0.1)] text-[var(--ratwal-blue)] flex-shrink-0">
          {section.sectionNumber}
        </span>
        <h2
          id={`heading-${section.id}`}
          className="font-instrument text-2xl sm:text-3xl text-[var(--midnight)] font-normal leading-tight tracking-tight"
        >
          {section.title}
        </h2>
      </div>

      {/* Paragraphs */}
      <div className="space-y-3.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
        {section.paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>

      {/* Bullets if any */}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="my-4 space-y-2.5 pl-1" aria-label={`Details for ${section.title}`}>
          {section.bullets.map((b, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--midnight)]">
              <span className="w-4 h-4 rounded-full bg-[var(--mist-blue)] text-[var(--ratwal-blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Subsections if any */}
      {section.subSections && section.subSections.length > 0 && (
        <div className="mt-6 space-y-6 pl-2 sm:pl-4 border-l-2 border-[var(--mist-blue)]">
          {section.subSections.map((sub, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <h3 className="font-bold text-sm text-[var(--midnight)]">{sub.title}</h3>
              {sub.paragraphs.map((sp, spIdx) => (
                <p key={spIdx} className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {sp}
                </p>
              ))}
              {sub.bullets && (
                <ul className="space-y-1.5 pt-1">
                  {sub.bullets.map((sb, sbIdx) => (
                    <li key={sbIdx} className="text-xs text-[var(--midnight)] flex items-start gap-2">
                      <span className="text-[var(--ratwal-blue)]">•</span>
                      <span>{sb}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Callout if any */}
      {section.callout && <LegalCallout data={section.callout} />}
    </article>
  );
}
