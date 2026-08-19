import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User, CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import { InsightArticle } from "@/types/insight";

interface FeaturedInsightProps {
  article: InsightArticle;
}

export function FeaturedInsight({ article }: FeaturedInsightProps) {
  return (
    <section className="py-16 md:py-20 bg-white border-b border-[rgba(7,26,40,0.08)]" aria-labelledby="featured-insight-heading">
      <div className="max-w-[1320px] w-[calc(100%-48px)] mx-auto">
        <div className="rounded-3xl bg-[#F5F1E9] border border-[rgba(7,26,40,0.1)] p-7 sm:p-10 lg:p-12 overflow-hidden shadow-sm">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(7,132,200,0.08)] border border-[rgba(7,132,200,0.2)] text-[#0784C8] text-xs font-bold uppercase tracking-wider mb-6">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Featured Guide</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Summary & Takeaways */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-xs text-[#0784C8] font-semibold mb-2">
                <span>{article.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#667d8f]">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readingTimeMinutes} min read
                </span>
              </div>

              <h2
                id="featured-insight-heading"
                className="font-heading text-2xl sm:text-3xl lg:text-[2.4rem] text-[#031C2B] font-normal leading-tight tracking-tight mb-4"
              >
                {article.title}
              </h2>

              <p className="text-sm sm:text-base text-[#4a6171] leading-relaxed mb-6">
                {article.excerpt}
              </p>

              {/* Key Takeaways Preview */}
              {article.keyTakeaways && article.keyTakeaways.length > 0 && (
                <div className="p-5 rounded-2xl bg-white border border-[rgba(7,26,40,0.08)] mb-8 space-y-2.5">
                  <span className="text-xs font-bold text-[#031C2B] uppercase tracking-wider block mb-1">
                    Key Investigation Points:
                  </span>
                  {article.keyTakeaways.slice(0, 2).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#2c3e50] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#24D17F] flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action and Author */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <Link
                  href={`/insights/${article.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#031C2B] hover:bg-[#082B3B] text-white text-xs font-semibold tracking-wide uppercase transition-all shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#031C2B]"
                >
                  <span>Read Complete Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#667d8f]">
                  <User className="w-3.5 h-3.5 text-[#0784C8]" />
                  <span>By {article.author.name}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[rgba(7,26,40,0.12)] shadow-md">
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-75" />

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[rgba(3,28,43,0.9)] backdrop-blur-md border border-[rgba(255,255,255,0.14)] flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1.5 text-[#52BDE9]">
                    <ShieldCheck className="w-4 h-4 text-[#24D17F]" />
                    <span>Statutorily Reviewed</span>
                  </span>
                  <span className="text-[#a0b6c6] text-[11px]">
                    Updated: {article.updatedAt || article.publishedAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
