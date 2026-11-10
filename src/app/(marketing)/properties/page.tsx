import { getMetadata } from "@/lib/seo";
import { 
  PropertiesHero, 
  PropertiesFilterSection, 
  PropertiesDiligenceStrip, 
  PropertiesCustomMandateCTA 
} from "@/components/sections/properties";
import { getAllProperties } from "@/lib/data/properties";
import { getAllLocations } from "@/lib/data/locations";
import { summarizeLocations } from "@/lib/utils/listing-summary";
import { catalogCopy } from "@/lib/seo-copy";
import { buildBreadcrumbSchema, buildWebPageSchema, sanitizeJsonLd } from "@/lib/schema";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

// Title/description are built from the saved Location records (MongoDB), main market
// first, so every location saved in the dashboard is reflected automatically.
export async function generateMetadata() {
  const [locations, properties] = await Promise.all([getAllLocations(), getAllProperties()]);
  return getMetadata({ ...catalogCopy(summarizeLocations(locations, properties)), slug: "/properties" });
}

export default async function PropertiesPage() {
  const [properties, locations] = await Promise.all([getAllProperties(), getAllLocations()]);
  const copy = catalogCopy(summarizeLocations(locations, properties));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: `${copy.title} | Ratiwal Dream Estates`,
        description: copy.description,
        url: `${siteConfig.url}/properties`,
        type: "CollectionPage",
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: siteConfig.url },
        { name: "Properties", url: `${siteConfig.url}/properties` },
      ]),
      {
        "@type": "ItemList",
        name: "Verified Properties Portfolio",
        numberOfItems: properties.length,
        itemListElement: properties.map((prop, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: prop.name,
          url: `${siteConfig.url}/properties/${prop.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col w-full">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(jsonLd) }}
      />
      <PropertiesHero />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <PropertiesFilterSection properties={properties} />
      </div>
      <PropertiesDiligenceStrip />
      <PropertiesCustomMandateCTA />
    </div>
  );
}
