import { Suspense } from "react";
import { getMetadata } from "@/lib/seo";
import {
  getAllPublishedTestimonials,
  getAllPublishedCaseStudies,
} from "@/data/testimonials";
import { TestimonialsHero } from "@/components/testimonials/TestimonialsHero";
import { TrustSummary } from "@/components/testimonials/TrustSummary";
import { FeaturedClientStory } from "@/components/testimonials/FeaturedClientStory";
import { TestimonialDirectory } from "@/components/testimonials/TestimonialDirectory";
import { CaseStudyGrid } from "@/components/testimonials/CaseStudyGrid";
import { ClientJourney } from "@/components/testimonials/ClientJourney";
import { VerificationMethod } from "@/components/testimonials/VerificationMethod";
import { TestimonialsFAQ } from "@/components/testimonials/TestimonialsFAQ";
import { TestimonialsFinalCTA } from "@/components/testimonials/TestimonialsFinalCTA";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Client Stories & Property Experiences",
  description:
    "Read verified client experiences and property advisory case studies from Ratiwal Dream Estates.",
  slug: "/testimonials",
  image: `${siteConfig.url}/images/about/office-consultation.jpg`,
});

export default function TestimonialsPage() {
  const publishedTestimonials = getAllPublishedTestimonials();
  const publishedCaseStudies = getAllPublishedCaseStudies();
  const featuredCaseStudy = publishedCaseStudies[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/testimonials#webpage`,
        url: `${siteConfig.url}/testimonials`,
        name: "Client Stories & Property Experiences | Ratiwal Dream Estates",
        description:
          "Read verified client experiences and property advisory case studies from Ratiwal Dream Estates.",
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
              name: "Client Stories",
              item: `${siteConfig.url}/testimonials`,
            },
          ],
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteConfig.url}/testimonials#casestudies`,
        name: "Published Land Advisory Case Studies",
        itemListElement: publishedCaseStudies.map((cs, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: cs.title,
          url: `${siteConfig.url}/testimonials/${cs.slug}`,
          description: cs.summary,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Premium Editorial Hero */}
      <TestimonialsHero />

      {/* 2. Trust Summary Strip */}
      <TrustSummary />

      {/* 3. Featured Client Story Preview */}
      {featuredCaseStudy && (
        <FeaturedClientStory caseStudy={featuredCaseStudy} />
      )}

      {/* 4. Testimonial Directory with Filters (Wrapped in Suspense for useSearchParams) */}
      <Suspense fallback={<div className="py-24 text-center">Loading client stories...</div>}>
        <TestimonialDirectory testimonials={publishedTestimonials} />
      </Suspense>

      {/* 5. Detailed Case-Study Library */}
      <CaseStudyGrid caseStudies={publishedCaseStudies} />

      {/* 6. Client Advisory Journey Timeline */}
      <ClientJourney />

      {/* 7. How Stories Are Verified & Privacy Standards */}
      <VerificationMethod />

      {/* 8. Frequently Asked Questions */}
      <TestimonialsFAQ />

      {/* 9. Final Advisory Conversion CTA */}
      <TestimonialsFinalCTA />
    </>
  );
}
