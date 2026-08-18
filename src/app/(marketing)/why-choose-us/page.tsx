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

export const metadata = getMetadata({
  title: "Why Choose Ratwal Dream Estates | Verified Property Advisory",
  description:
    "Discover Ratwal Dream Estates’ verification-first approach to property discovery, documentation support, pricing transparency, and local real-estate guidance.",
  slug: "/why-choose-us",
});

export default function WhyChooseUsPage() {
  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
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
        name: "Why Choose Us",
        item: `${siteConfig.url}/why-choose-us`,
      },
    ],
  };

  // FAQPage JSON-LD Schema strictly for visibly rendered FAQs
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: whyChooseUsData.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Structured Data Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
