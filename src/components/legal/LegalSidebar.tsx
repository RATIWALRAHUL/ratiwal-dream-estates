"use client";

import React, { useEffect, useState } from "react";
import { LegalSectionItem } from "@/types/legal";
import { cn } from "@/lib/utils";
import { ArrowUp, ListFilter } from "lucide-react";

interface LegalSidebarProps {
  sections: LegalSectionItem[];
}

export function LegalSidebar({ sections }: LegalSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the topmost visible section
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Pick the entry closest to top
        const firstVisible = visibleEntries[0];
        setActiveId(firstVisible.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-120px 0px -60% 0px",
      threshold: [0, 0.1, 0.5],
    });

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setActiveId(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside
      className="hidden lg:block w-full sticky top-28 h-fit max-h-[calc(100vh-140px)] overflow-y-auto pr-4 [scrollbar-width:thin]"
      aria-label="Legal document table of contents"
    >
      <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[rgba(7,26,40,0.06)]">
          <ListFilter size={15} className="text-[var(--ratiwal-blue)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--midnight)]">
            On this page
          </span>
        </div>

        <nav className="space-y-1" aria-label="Sections">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => handleScrollTo(e, section.id)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "group flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-[var(--mist-blue)] text-[var(--ratiwal-blue-deep)] font-bold shadow-2xs translate-x-1"
                    : "text-[var(--text-secondary)] hover:text-[var(--midnight)] hover:bg-[var(--surface)]"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10.5px] px-1 py-0.2 rounded transition-colors flex-shrink-0 mt-0.5",
                    isActive
                      ? "bg-[var(--ratiwal-blue)] text-white font-bold"
                      : "bg-[var(--surface)] text-[var(--text-secondary)] group-hover:text-[var(--midnight)]"
                  )}
                >
                  {section.sectionNumber}
                </span>
                <span className="truncate leading-snug">{section.title}</span>
              </a>
            );
          })}
        </nav>

        <div className="pt-4 mt-4 border-t border-[rgba(7,26,40,0.06)]">
          <button
            type="button"
            onClick={scrollToTop}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--ratiwal-blue)] hover:bg-[var(--surface)] transition-colors"
          >
            <ArrowUp size={13} />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
