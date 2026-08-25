import React from "react";
import { getMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { whyChooseUsData } from "@/data/whyChooseUsData";
import {
  WhyChooseHero,
  TrustPrinciples,
  VerificationTimeline,
  DirectCommunicationModel,
  RiskReviewMatrix,
  AdvisoryComparison,
  BuyerDeliverables,
  LocalExpertisePreview,
  AdvisorPreview,
  WhyChooseFAQ,
  FinalConsultationCTA,
} from "@/components/sections/why-choose-us";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildWebPageSchema,
  sanitizeJsonLd,
} from "@/lib/schema";

export const metadata = getMetadata({
  title: "Why Choose Ratiwal Dream Estates | Verified Property Advisory",
  description:
    "Discover Ratiwal Dream Estates’ verification-first approach to property discovery, documentation support, pricing transparency, and local real-estate guidance.",
  slug: "/why-choose-us",
});

export default function WhyChooseUsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: "Why Choose Ratiwal Dream Estates | Verified Property Advisory",
        description:
          "Discover Ratiwal Dream Estates’ verification-first approach to property discovery, documentation support, pricing transparency, and local real-estate guidance.",
        url: `${siteConfig.url}/why-choose-us`,
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Why Choose Us", url: `${siteConfig.url}/why-choose-us` },
      ]),
      buildFAQSchema(whyChooseUsData.faqs),
    ].filter(Boolean),
  };

  return (
    <>
      {/* Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />

      <main id="main-content" className="w-full">
        {/* Section 1: Premium Editorial Hero */}
        <WhyChooseHero />

        {/* Section 2: Three Core Trust Principles */}
        <TrustPrinciples />

        {/* Section 3: 6-Step Verification Protocol Timeline */}
        <VerificationTimeline />

        {/* Section 4: Direct Property Communication Model */}
        <DirectCommunicationModel />

        {/* Section 5: 10-Domain Risk-Reduction Framework */}
        <RiskReviewMatrix />

        {/* Section 6: Methodology Comparison */}
        <AdvisoryComparison />

        {/* Section 7: What the Buyer Receives & Deliverables */}
        <BuyerDeliverables />

        {/* Section 8: Local Market Intelligence & Verified Corridors */}
        <LocalExpertisePreview />

        {/* Section 9: Advisory Council & Personal Guidance */}
        <AdvisorPreview />

        {/* Section 10: Frequently Asked Questions */}
        <WhyChooseFAQ />

        {/* Section 11: Premium Conversion CTA */}
        <FinalConsultationCTA />
      </main>
    </>
  );
}
