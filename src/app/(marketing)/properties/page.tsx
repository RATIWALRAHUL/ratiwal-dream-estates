import { getMetadata } from "@/lib/seo";
import { 
  PropertiesHero, 
  PropertiesFilterSection, 
  PropertiesDiligenceStrip, 
  PropertiesCustomMandateCTA 
} from "@/components/sections/properties";
import { properties } from "@/data/properties";
import { buildBreadcrumbSchema, buildWebPageSchema, sanitizeJsonLd } from "@/lib/schema";
import { siteConfig } from "@/config/site";

export const metadata = getMetadata({
  title: "Verified Residential & Commercial Plots Portfolio",
  description:
    "Explore our vetted collection of premium residential and commercial plots in Jaipur, Ajmer, Navi Mumbai, Panvel, and Bhiwadi. 100% verified titles with full legal dossiers.",
  slug: "/properties",
});

export default function PropertiesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageSchema({
        title: "Verified Residential & Commercial Plots Portfolio | Ratwal Dream Estates",
        description:
          "Explore our vetted collection of premium residential and commercial plots in Jaipur, Ajmer, Navi Mumbai, Panvel, and Bhiwadi.",
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
