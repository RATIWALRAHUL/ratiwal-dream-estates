"use client";

import { useEffect, useState } from "react";
import { List, ChevronDown } from "lucide-react";
import { ArticleSection } from "@/types/insight";

interface ArticleTableOfContentsProps {
  sections: ArticleSection[];
}

export function ArticleTableOfContents({ sections }: ArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0% -60% 0%" }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white border border-[rgba(7,26,40,0.1)] p-5 shadow-sm sticky top-28">
      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="w-full flex items-center justify-between lg:hidden text-left"
        aria-expanded={isOpenMobile}
      >
        <span className="font-heading text-sm font-bold text-[#031C2B] flex items-center gap-2">
          <List className="w-4 h-4 text-[#0784C8]" />
          <span>Table of Contents</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-[#667d8f] transition-transform ${isOpenMobile ? "rotate-180" : ""}`} />
      </button>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center gap-2 pb-3 mb-3 border-b border-[rgba(7,26,40,0.06)]">
        <List className="w-4 h-4 text-[#0784C8]" />
        <span className="font-heading text-sm font-bold text-[#031C2B]">Table of Contents</span>
      </div>

      {/* Links List */}
      <nav
        className={`mt-3 lg:mt-0 ${isOpenMobile ? "block" : "hidden lg:block"}`}
        aria-label="Article Table of Contents"
      >
        <ul className="space-y-2 text-xs">
          {sections.map((section) => {
            const isActive = activeId === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setIsOpenMobile(false)}
                  className={`block py-1 px-2.5 rounded-md transition-colors leading-relaxed ${
                    isActive
                      ? "bg-[#edf5f9] text-[#0784C8] font-bold border-l-2 border-[#0784C8]"
                      : "text-[#536574] hover:text-[#031C2B] hover:bg-[#F5F1E9]"
                  }`}
                >
                  {section.heading}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
