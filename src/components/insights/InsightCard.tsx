import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User, Calendar } from "lucide-react";
import { InsightArticle } from "@/types/insight";

interface InsightCardProps {
  article: InsightArticle;
  isLead?: boolean;
}

export function InsightCard({ article, isLead = false }: InsightCardProps) {
  return (
    <article
      className={`group bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-[0_4px_20px_rgba(7,26,40,0.04)] hover:shadow-[0_16px_36px_rgba(7,26,40,0.1)] hover:border-[rgba(7,132,200,0.35)] transition-all duration-300 flex flex-col justify-between ${
        isLead ? "md:col-span-2 lg:col-span-2 md:grid md:grid-cols-12 md:gap-6" : ""
      }`}
      aria-labelledby={`article-card-${article.slug}`}
    >
      {/* Thumbnail */}
      <div
        className={`relative w-full bg-[#072435] overflow-hidden ${
          isLead ? "md:col-span-6 aspect-[16/10] md:aspect-auto md:h-full min-h-[260px]" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={article.heroImage}
          alt={article.title}
          fill
          sizes={isLead ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

        {/* Category Pill on Image */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="px-3 py-1 rounded-full bg-[rgba(3,28,43,0.85)] backdrop-blur-md border border-[rgba(255,255,255,0.2)] text-white text-[11px] font-bold uppercase tracking-wider">
            {article.category}
          </span>
        </div>

        {/* Read Time on Image */}
        <div className="absolute bottom-3 left-3.5 text-white z-10 text-[11px] flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 text-[#52BDE9]" />
          <span>{article.readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Body */}
      <div className={`p-6 flex-1 flex flex-col justify-between ${isLead ? "md:col-span-6 md:p-8" : ""}`}>
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#667d8f] mb-2 font-mono">
            <Calendar className="w-3 h-3 text-[#0784C8]" />
            <span>Updated: {article.updatedAt || article.publishedAt}</span>
          </div>

          <h3
            id={`article-card-${article.slug}`}
            className={`font-heading text-[#031C2B] font-normal leading-snug mb-2.5 group-hover:text-[#0784C8] transition-colors ${
              isLead ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
            }`}
          >
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#4a6171] leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[rgba(7,26,40,0.08)] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-[#667d8f]">
            <User className="w-3 h-3 text-[#0784C8]" />
            <span className="truncate max-w-[130px]">{article.author.name}</span>
          </div>

          <Link
            href={`/insights/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0784C8] group-hover:text-[#031C2B] transition-colors focus-visible:outline"
            aria-label={`Read guide: ${article.title}`}
          >
            <span>Read Guide</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
