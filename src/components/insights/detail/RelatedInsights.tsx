import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { InsightArticle } from "@/types/insight";

interface RelatedInsightsProps {
  relatedArticles: InsightArticle[];
}

export function RelatedInsights({ relatedArticles }: RelatedInsightsProps) {
  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-[rgba(7,26,40,0.1)]" aria-labelledby="related-insights-heading">
      <div className="max-w-[720px] mb-8">
        <span className="text-xs font-bold text-[#0784C8] uppercase tracking-wider block mb-2">
          Recommended Reading
        </span>
        <h2 id="related-insights-heading" className="font-heading text-2xl text-[#031C2B] font-normal">
          Related Property Research Guides
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <article
            key={article.slug}
            className="group bg-white rounded-2xl border border-[rgba(7,26,40,0.1)] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] w-full bg-[#072435] overflow-hidden">
              <Image
                src={article.heroImage}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />
              <span className="absolute bottom-2.5 left-3 text-white text-[11px] font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#52BDE9]" />
                {article.readingTimeMinutes} min
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#0784C8] uppercase tracking-wider block mb-1.5">
                  {article.category}
                </span>
                <h3 className="font-heading text-base font-bold text-[#031C2B] leading-snug group-hover:text-[#0784C8] transition-colors mb-3 line-clamp-2">
                  {article.title}
                </h3>
              </div>

              <Link
                href={`/insights/${article.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0784C8] hover:underline mt-2"
                aria-label={`Read guide: ${article.title}`}
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
