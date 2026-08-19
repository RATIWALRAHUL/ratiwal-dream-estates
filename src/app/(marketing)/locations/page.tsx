import { getMetadata } from "@/lib/seo";
import { locations } from "@/data/locations";
import { LocationsHero } from "@/components/locations/LocationsHero";
import { MarketMap } from "@/components/locations/MarketMap";
import { LocationDirectory } from "@/components/locations/LocationDirectory";
import { MicroMarketPreview } from "@/components/locations/MicroMarketPreview";
import { LocationComparison } from "@/components/locations/LocationComparison";
import { LocationAdvisoryCTA } from "@/components/locations/LocationAdvisoryCTA";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Property Locations & Market Guides",
  description:
    "Explore Ratwal Dream Estates property locations, micro-markets, infrastructure context, and available real-estate opportunities across Rajasthan and Maharashtra.",
  slug: "/locations",
  image: `${siteConfig.url}/images/locations/jaipur.jpg`,
});

export default function LocationsPage() {
  // Structured Data (JSON-LD) for CollectionPage and ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteConfig.url}/locations#webpage`,
        url: `${siteConfig.url}/locations`,
        name: "Property Locations & Market Guides | Ratwal Dream Estates",
        description:
          "Explore Ratwal Dream Estates operating locations, verified micro-markets, infrastructure timelines, and available plotted land opportunities.",
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
              name: "Locations",
              item: `${siteConfig.url}/locations`,
            },
          ],
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteConfig.url}/locations#itemlist`,
        name: "Operating Real Estate Markets",
        itemListElement: locations.map((loc, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: loc.name,
          url: `${siteConfig.url}/locations/${loc.slug}`,
          description: loc.shortDescription,
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

      {/* 1. Editorial Location Hero */}
      <LocationsHero locations={locations} />

      {/* 2. Interactive Market Navigator Map */}
      <MarketMap locations={locations} />

      {/* 3. Location Directory with Verified Filter State */}
      <LocationDirectory locations={locations} />

      {/* 4. Strategic Micro-Market Context Preview */}
      <MicroMarketPreview locations={locations} />

      {/* 5. Side-by-Side Market Comparison Tool */}
      <LocationComparison locations={locations} />

      {/* 6. Location Advisory Consultation CTA */}
      <LocationAdvisoryCTA />
    </>
  );
}
