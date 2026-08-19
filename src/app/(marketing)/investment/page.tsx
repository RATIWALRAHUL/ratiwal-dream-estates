import { getMetadata } from "@/lib/seo";
import { 
  InvestmentHero, 
  InvestmentThesis, 
  InvestmentCalculator, 
  InvestmentCorridors, 
  InvestmentRiskMitigation, 
  InvestmentProfiles, 
  InvestmentLifecycle, 
  InvestmentCTA 
} from "@/components/sections/investment";
import { buildBreadcrumbSchema, buildWebPageSchema, sanitizeJsonLd } from "@/lib/schema";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Investment Strategy — Capital Allocation & Growth Corridors",
  description:
    "Discover Ratwal Dream Estates' institutional land investment thesis. Model land ROI, explore high-velocity growth corridors in Jaipur & Navi Mumbai, and access 100% verified titles.",
  slug: "/investment",
});

export default function InvestmentPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: "Investment Strategy — Capital Allocation & Growth Corridors | Ratwal Dream Estates",
        description:
          "Discover Ratwal Dream Estates' institutional land investment thesis. Model land ROI, explore high-velocity growth corridors in Jaipur & Navi Mumbai, and access 100% verified titles.",
        url: `${siteConfig.url}/investment`,
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Investment Strategy", url: `${siteConfig.url}/investment` },
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
      <InvestmentHero />
      <InvestmentThesis />
      <InvestmentCalculator />
      <InvestmentCorridors />
      <InvestmentRiskMitigation />
      <InvestmentProfiles />
      <InvestmentLifecycle />
      <InvestmentCTA />
    </div>
  );
}
