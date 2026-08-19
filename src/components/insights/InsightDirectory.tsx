"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, RotateCcw } from "lucide-react";
import { InsightArticle } from "@/types/insight";
import { InsightFilters } from "./InsightFilters";
import { InsightCard } from "./InsightCard";

interface InsightDirectoryProps {
  articles: InsightArticle[];
}

export function InsightDirectory({ articles }: InsightDirectoryProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const activeSearch = searchParams.get("q") || "";

  // Derive unique categories from real data
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => set.add(a.category));
    return Array.from(set);
  }, [articles]);

  // Filter articles based on category and search query
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchCategory =
        activeCategory === "all" ||
        article.category.toLowerCase() === activeCategory.toLowerCase();

      const query = activeSearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags?.some((t) => t.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [articles, activeCategory, activeSearch]);

  return (
    <section id="insights-directory" className="py-16 md:py-24 bg-[#F5F1E9] border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="directory-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        {/* Section Header */}
        <div className="max-w-[720px] mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Explore The Journal</span>
          </div>
          <h2
            id="directory-heading"
            className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-3"
          >
            Guides for every stage of the property journey.
          </h2>
          <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed">
            Browse our research database of legal frameworks, masterplan analyses, and site inspection standards.
          </p>
        </div>

        {/* Filters and Search */}
        <InsightFilters
          activeCategory={activeCategory}
          activeSearch={activeSearch}
          categories={categories}
          totalCount={filteredArticles.length}
        />

        {/* Directory Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, idx) => (
              <InsightCard
                key={article.slug}
                article={article}
                isLead={idx === 0 && activeCategory === "all" && !activeSearch}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-6 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] max-w-[620px] mx-auto">
            <BookOpen className="w-10 h-10 text-[#0784C8] mx-auto mb-4" aria-hidden="true" />
            <h3 className="font-heading text-2xl text-[#031C2B] font-normal mb-2">
              No matching research guides found
            </h3>
            <p className="text-sm text-[#4a6171] mb-6">
              We couldn&apos;t find any approved publications matching your current search criteria. Try modifying your keywords or category.
            </p>
            <Link
              href="/insights#insights-directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#031C2B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#082B3B] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All Guides</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
