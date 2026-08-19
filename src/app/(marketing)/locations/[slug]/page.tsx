import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import { locations, getLocationBySlug, getPropertiesForLocation } from "@/data/locations";
import { LocationDetailHero } from "@/components/locations/detail/LocationDetailHero";
import { LocationOverview } from "@/components/locations/detail/LocationOverview";
import { MicroMarketSection } from "@/components/locations/detail/MicroMarketSection";
import { InfrastructureTimeline } from "@/components/locations/detail/InfrastructureTimeline";
import { ConnectivityGrid } from "@/components/locations/detail/ConnectivityGrid";
import { MarketSnapshot } from "@/components/locations/detail/MarketSnapshot";
import { LocationPropertyGrid } from "@/components/locations/detail/LocationPropertyGrid";
import { BuyerConsiderations } from "@/components/locations/detail/BuyerConsiderations";
import { LocationFAQ } from "@/components/locations/detail/LocationFAQ";
import { LocationFinalCTA } from "@/components/locations/detail/LocationFinalCTA";
import { siteConfig } from "@/config/site";

interface LocationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    return getMetadata({
      title: "Location Not Found",
      noIndex: true,
    });
  }

  return getMetadata({
    title: `Property in ${location.name} | Market Guide`,
    description: `Explore properties, micro-markets, infrastructure context, and buyer guidance for ${location.name} with ${siteConfig.name}.`,
    slug: `/locations/${location.slug}`,
    image: `${siteConfig.url}${location.heroImage}`,
  });
}

// Generate static routes at build time for all known locations
export async function generateStaticParams() {
  return locations.map((loc) => ({
    slug: loc.slug,
  }));
}

export default async function LocationDetailPage({ params }: LocationPageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  // Filter properties for this specific location
  const regionalProperties = getPropertiesForLocation(location.name);

  // Structured Data (JSON-LD) for Place & ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${siteConfig.url}/locations/${location.slug}#place`,
        name: `${location.name}, ${location.state}`,
        description: location.shortDescription,
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: location.name,
          addressRegion: location.state,
          addressCountry: "IN",
        },
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
            name: "Locations",
            item: `${siteConfig.url}/locations`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: location.name,
            item: `${siteConfig.url}/locations/${location.slug}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${siteConfig.url}/locations/${location.slug}#properties`,
        name: `Properties in ${location.name}`,
        itemListElement: regionalProperties.map((prop, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: prop.name,
          url: `${siteConfig.url}/properties/${prop.slug}`,
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

      {/* 1. Location Detail Hero */}
      <LocationDetailHero location={location} />

      {/* 2. Market Overview & Buyer Profiles */}
      <LocationOverview location={location} />

      {/* 3. Micro-Markets Section */}
      <MicroMarketSection location={location} />

      {/* 4. Infrastructure Milestones Timeline */}
      <InfrastructureTimeline infrastructure={location.infrastructure} locationName={location.name} />

      {/* 5. Arterial Connectivity & Distance Index */}
      <ConnectivityGrid connectivity={location.connectivity} locationName={location.name} />

      {/* 6. Verified Market Benchmark Snapshot */}
      <MarketSnapshot marketData={location.marketData} locationName={location.name} />

      {/* 7. Available Verified Properties */}
      <LocationPropertyGrid properties={regionalProperties} locationName={location.name} />

      {/* 8. Buyer Due Diligence Considerations & Disclosures */}
      <BuyerConsiderations considerations={location.buyerConsiderations} locationName={location.name} />

      {/* 9. Location-Specific FAQs */}
      <LocationFAQ faq={location.faq} locationName={location.name} />

      {/* 10. Location Final Advisory CTA */}
      <LocationFinalCTA locationName={location.name} />
    </>
  );
}
