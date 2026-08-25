import Link from "next/link";
import Image from "next/image";
import { Clock, User, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { InsightArticle } from "@/types/insight";

interface ArticleHeroProps {
  article: InsightArticle;
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <section className="bg-gradient-to-b from-[#031C2B] via-[#072435] to-[#082B3B] text-white pt-28 pb-12 md:pt-36 md:pb-16 border-b border-[rgba(255,255,255,0.08)]">
      <div className="max-w-[1100px] w-[calc(100%-48px)] mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#a0b6c6] mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/insights" className="hover:text-white transition-colors">Insights</Link>
          <span>/</span>
          <span className="text-[#52BDE9] truncate max-w-[220px] sm:max-w-none">{article.title}</span>
        </nav>

        {/* Category & Status */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-[rgba(82,189,233,0.14)] border border-[rgba(82,189,233,0.3)] text-[#52BDE9] text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-[rgba(36,209,127,0.14)] border border-[rgba(36,209,127,0.3)] text-[#24D17F] text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutorily Reviewed
          </span>
        </div>

        {/* H1 Title */}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.85rem] text-white font-normal leading-[1.12] tracking-tight mb-4">
          {article.title}
        </h1>

        {/* Excerpt */}
        <p className="text-base sm:text-lg text-[#d2ecf8] leading-relaxed max-w-[820px] mb-8 font-light">
          {article.excerpt}
        </p>

        {/* Author & Reviewer Meta Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-xs">
          {/* Author */}
          <div>
            <span className="text-[#7a93a5] block mb-1">Author</span>
            <strong className="text-white block font-medium">{article.author.name}</strong>
            <span className="text-[11px] text-[#a0b6c6]">{article.author.role}</span>
          </div>

          {/* Reviewer */}
          {article.reviewer ? (
            <div>
              <span className="text-[#7a93a5] block mb-1">Reviewed By</span>
              <strong className="text-white block font-medium">{article.reviewer.name}</strong>
              <span className="text-[11px] text-[#24D17F] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {article.reviewer.role}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[#7a93a5] block mb-1">Editorial Desk</span>
              <strong className="text-white block font-medium">Ratiwal Research</strong>
              <span className="text-[11px] text-[#a0b6c6]">Compliance Verified</span>
            </div>
          )}

          {/* Reading Time */}
          <div>
            <span className="text-[#7a93a5] block mb-1">Reading Time</span>
            <strong className="text-white block font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#52BDE9]" /> {article.readingTimeMinutes} Minutes
            </strong>
          </div>

          {/* Last Updated */}
          <div>
            <span className="text-[#7a93a5] block mb-1">Last Reviewed</span>
            <strong className="text-white block font-medium font-mono">
              {article.updatedAt || article.publishedAt}
            </strong>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mt-8 border border-[rgba(255,255,255,0.12)] shadow-xl">
          <Image
            src={article.heroImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1100px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031C2B] via-transparent to-transparent opacity-60" />
        </div>
      </div>
    </section>
  );
}
