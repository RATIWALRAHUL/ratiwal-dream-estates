"use client";

import React, { useState } from "react";
import { LegalSectionItem } from "@/types/legal";
import { ChevronDown, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface LegalMobileNavigationProps {
  sections: LegalSectionItem[];
}

export function LegalMobileNavigation({ sections }: LegalMobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      setIsOpen(false);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const activeSection = sections.find((s) => s.id === activeId) || sections[0];

  return (
    <div className="lg:hidden mb-8 sticky top-20 z-30">
      <div className="rounded-2xl bg-white/95 backdrop-blur-xl border border-[rgba(7,26,40,0.1)] shadow-md overflow-hidden">
        {/* Toggle Button (44px min touch target) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-legal-sections"
          className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-3 text-left focus-visible:outline"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <ListFilter size={16} className="text-[var(--ratwal-blue)] flex-shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block">
                Table of Contents
              </span>
              <span className="text-xs font-bold text-[var(--midnight)] truncate block">
                {activeSection ? `${activeSection.sectionNumber}. ${activeSection.title}` : "Select a section"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] font-bold text-[var(--ratwal-blue)] hidden sm:inline">
              {isOpen ? "Close" : "Jump to"}
            </span>
            <ChevronDown
              size={18}
              className={cn(
                "text-[var(--ratwal-blue)] transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>

        {/* Collapsible Section List */}
        {isOpen && (
          <div
            id="mobile-legal-sections"
            className="p-3 border-t border-[rgba(7,26,40,0.06)] max-h-72 overflow-y-auto space-y-1 bg-[var(--surface)] [scrollbar-width:thin]"
          >
            {sections.map((section) => {
              const isActive = activeId === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => handleScrollTo(e, section.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                    isActive
                      ? "bg-[var(--mist-blue)] text-[var(--ratwal-blue-deep)] font-bold shadow-2xs"
                      : "text-[var(--midnight)] hover:bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0",
                      isActive
                        ? "bg-[var(--ratwal-blue)] text-white font-bold"
                        : "bg-white text-[var(--text-secondary)] border border-[rgba(7,26,40,0.08)]"
                    )}
                  >
                    {section.sectionNumber}
                  </span>
                  <span className="truncate">{section.title}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
