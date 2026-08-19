import { notFound } from "next/navigation";
import Link from "next/link";
import { getMetadata } from "@/lib/seo";
import {
  getAllApprovedArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/data/insights";
import { downloadableResources } from "@/data/resources";
import { ArticleHero } from "@/components/insights/detail/ArticleHero";
import { ArticleTableOfContents } from "@/components/insights/detail/ArticleTableOfContents";
import { KeyTakeaways } from "@/components/insights/detail/KeyTakeaways";
import { ArticleBody } from "@/components/insights/detail/ArticleBody";
import { SourceList } from "@/components/insights/detail/SourceList";
import { DownloadCallout } from "@/components/insights/detail/DownloadCallout";
import { RelatedInsights } from "@/components/insights/detail/RelatedInsights";
import { ArticleDisclaimer } from "@/components/insights/detail/ArticleDisclaimer";
import { InsightFinalCTA } from "@/components/insights/InsightFinalCTA";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

interface InsightDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return getMetadata({
      title: "Article Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: article.title,
    description: article.excerpt,
    slug: `/insights/${article.slug}`,
    image: `${siteConfig.url}${article.heroImage}`,
  });
}

export async function generateStaticParams() {
  const articles = getAllApprovedArticles();
  return articles.map((art) => ({
    slug: art.slug,
  }));
}

export default async function InsightDetailPage({ params }: InsightDetailPageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article.slug, 3);

  // Match downloadable resources for this article
  const matchingResources = downloadableResources.filter(
    (res) =>
      res.reviewStatus === "approved" &&
      (article.downloadableResourceSlugs?.includes(res.slug) ||
        res.relatedArticleSlugs?.includes(article.slug))
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${siteConfig.url}/insights/${article.slug}#article`,
        headline: article.title,
        description: article.excerpt,
        image: `${siteConfig.url}${article.heroImage}`,
        author: {
          "@type": "Organization",
          name: article.author.name,
          url: siteConfig.url,
        },
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          logo: {
            "@type": "ImageObject",
            url: `${siteConfig.url}/images/brand/logo.jpg`,
          },
        },
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        mainEntityOfPage: `${siteConfig.url}/insights/${article.slug}`,
        articleSection: article.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Insights",
            item: `${siteConfig.url}/insights`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: `${siteConfig.url}/insights/${article.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Article Hero */}
      <ArticleHero article={article} />

      {/* 2. Reading Layout */}
      <section className="py-16 md:py-24 bg-[#FFFDF8]">
        <div className="max-w-[1180px] w-[calc(100%-48px)] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Sticky Table of Contents (4 cols on lg) */}
            <aside className="lg:col-span-4 order-2 lg:order-1">
              <ArticleTableOfContents sections={article.sections} />
            </aside>

            {/* Main Reading Column (8 cols on lg) */}
            <main className="lg:col-span-8 order-1 lg:order-2">
              {/* Key Takeaways Box */}
              <KeyTakeaways takeaways={article.keyTakeaways} />

              {/* Core Structured Article Body */}
              <ArticleBody sections={article.sections} />

              {/* Contextual Downloadable Tool Box */}
              {matchingResources.length > 0 && (
                <DownloadCallout resources={matchingResources} />
              )}

              {/* Statutory References & Citations */}
              <SourceList sources={article.sources} />

              {/* Legal & Regulatory Notice */}
              <ArticleDisclaimer category={article.category} />

              {/* Back to Insights Directory Link */}
              <div className="pt-6">
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0784C8] hover:text-[#031C2B] uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to all property insights</span>
                </Link>
              </div>
            </main>
          </div>

          {/* Related Articles Section */}
          <RelatedInsights relatedArticles={relatedArticles} />
        </div>
      </section>

      {/* 3. Final Conversion CTA */}
      <InsightFinalCTA />
    </>
  );
}
