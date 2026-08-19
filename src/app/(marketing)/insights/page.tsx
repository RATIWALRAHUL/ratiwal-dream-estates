import { Suspense } from "react";
import { getMetadata } from "@/lib/seo";
import { getAllApprovedArticles, getFeaturedArticle } from "@/data/insights";
import { getAllApprovedResources } from "@/data/resources";
import { InsightsHero } from "@/components/insights/InsightsHero";
import { FeaturedInsight } from "@/components/insights/FeaturedInsight";
import { InsightDirectory } from "@/components/insights/InsightDirectory";
import { GuidedContentPaths } from "@/components/insights/GuidedContentPaths";
import { MarketGuideSpotlight } from "@/components/insights/MarketGuideSpotlight";
import { ResourceLibrary } from "@/components/insights/ResourceLibrary";
import { EditorialStandards } from "@/components/insights/EditorialStandards";
import { InsightFinalCTA } from "@/components/insights/InsightFinalCTA";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Property Insights, Buying Guides & Market Research",
  description:
    "Explore property-buying guides, documentation checklists, RERA education, location insights, and market resources from Ratwal Dream Estates.",
  slug: "/insights",
  image: `${siteConfig.url}/images/locations/jaipur.jpg`,
});

export default function InsightsPage() {
  const approvedArticles = getAllApprovedArticles();
  const featuredArticle = getFeaturedArticle();
  const approvedResources = getAllApprovedResources();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/insights#webpage`,
        url: `${siteConfig.url}/insights`,
        name: "Property Insights, Buying Guides & Market Research | Ratwal Dream Estates",
        description:
          "Explore property-buying guides, documentation checklists, RERA education, location insights, and market resources from Ratwal Dream Estates.",
        breadcrumb: {
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
          ],
        },
      },
      {
        "@type": "Blog",
        "@id": `${siteConfig.url}/insights#blog`,
        name: "Ratwal Property Intelligence Journal",
        description: "Authoritative research on plotted land, statutory revenue documentation, and masterplans in Rajasthan and Maharashtra.",
        blogPost: approvedArticles.map((art) => ({
          "@type": "BlogPosting",
          headline: art.title,
          description: art.excerpt,
          url: `${siteConfig.url}/insights/${art.slug}`,
          datePublished: art.publishedAt,
          dateModified: art.updatedAt || art.publishedAt,
          author: {
            "@type": "Organization",
            name: art.author.name,
          },
        })),
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

      {/* 1. Editorial Hero */}
      <InsightsHero featuredArticle={featuredArticle} />

      {/* 2. Featured Lead Publication */}
      <FeaturedInsight article={featuredArticle} />

      {/* 3. Article Directory & Filters (Wrapped in Suspense for useSearchParams) */}
      <Suspense fallback={<div className="py-24 text-center">Loading property research journal...</div>}>
        <InsightDirectory articles={approvedArticles} />
      </Suspense>

      {/* 4. Guided Content Paths */}
      <GuidedContentPaths />

      {/* 5. Regional Market Spotlight */}
      <MarketGuideSpotlight />

      {/* 6. Downloadable Practical Tools & Resource Library */}
      <ResourceLibrary resources={approvedResources} />

      {/* 7. Editorial Transparency Standards */}
      <EditorialStandards />

      {/* 8. Advisory Conversion CTA */}
      <InsightFinalCTA />
    </>
  );
}
