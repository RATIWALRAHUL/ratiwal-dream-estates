import { getMetadata } from "@/lib/seo";
import { 
  AboutHero, 
  AboutStory, 
  AboutVerificationProtocol, 
  AboutLeadership, 
  AboutMilestones, 
  AboutCoreValues, 
  AboutCorridors, 
  AboutCTA 
} from "@/components/sections/about";
import { buildBreadcrumbSchema, buildWebPageSchema, sanitizeJsonLd } from "@/lib/schema";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "About Us — Lifelong Property Consultancy Built on Trust",
  description:
    "Learn about Ratiwal Dream Estates, our founding principles, our 6-stage land verification protocol, and our fiduciary commitment to transparent property advisory in Rajasthan and Maharashtra.",
  slug: "/about",
});

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: "About Us — Lifelong Property Consultancy Built on Trust | Ratiwal Dream Estates",
        description:
          "Learn about Ratiwal Dream Estates, our founding principles, our 6-stage land verification protocol, and our fiduciary commitment to transparent property advisory.",
        url: `${siteConfig.url}/about`,
        type: "AboutPage",
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "About Us", url: `${siteConfig.url}/about` },
      ]),
    ],
  };

  return (
    <div className="flex flex-col w-full">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />
      <AboutHero />
      <AboutStory />
      <AboutVerificationProtocol />
      <AboutLeadership />
      <AboutMilestones />
      <AboutCoreValues />
      <AboutCorridors />
      <AboutCTA />
    </div>
  );
}
