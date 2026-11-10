import { notFound } from "next/navigation";
import { getMetadata, pickFittingText } from "@/lib/seo";
import {
  getAllProperties,
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/data/properties";
import { PropertyDetailPageClient } from "@/components/property/detail/PropertyDetailPageClient";
import { siteConfig } from "@/config/site";

export const revalidate = 120;
export const dynamicParams = false;

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Primary image (isPrimary media sorts first). No image -> getMetadata's default.
  const rawImage = property.images && property.images.length > 0 ? property.images[0] : "";
  const primaryImage = rawImage.startsWith("http")
    ? rawImage
    : rawImage
    ? `${siteConfig.url}${rawImage}`
    : undefined;

  // Avoid "One Kishangarh in Kishangarh": only add the city when the name lacks it.
  const nameHasCity = property.city
    ? property.name.toLowerCase().includes(property.city.toLowerCase())
    : true;
  const title = nameHasCity
    ? `${property.name} — ${property.propertyType}`
    : `${property.name} in ${property.city}`;

  const place = [property.location, property.city]
    .filter((part, i, all) => part && all.findIndex((x) => x?.toLowerCase() === part.toLowerCase()) === i)
    .join(", ");
  const sizes = describePlotSizeRange(property.plotSizes);
  const kind = pluralizePropertyType(property.propertyType);

  return getMetadata({
    title,
    description: pickFittingText(
      [
        "View documents, connectivity and book a site visit.",
        "View documents and book a site visit.",
        "Book a site visit.",
      ].map(
        (tail) =>
          `${property.name} in ${place}: ${kind}${sizes ? ` from ${sizes}` : ""}. ${property.priceLabel}. ${tail}`
      )
    ),
    slug: `/properties/${property.slug}`,
    image: primaryImage,
    imageAlt: primaryImage ? `${property.name}, ${property.city}` : undefined,
  });
}

/** "88 to 200 Sq. Yds" from strings like ["100 Sq. Yds", "88 Sq. Yds"]. Same unit only. */
function describePlotSizeRange(sizes: string[]): string {
  const parsed = sizes
    .map((s) => {
      const m = s.match(/^\s*([\d.,]+)\s*(Sq\.?\s*(?:Yds?|Ft))/i);
      return m ? { value: parseFloat(m[1].replace(/,/g, "")), unit: m[2].replace(/\s+/g, " ") } : null;
    })
    .filter((x): x is { value: number; unit: string } => !!x && Number.isFinite(x.value));
  if (parsed.length === 0) return "";
  const unit = parsed[0].unit;
  const values = parsed.filter((p) => p.unit.toLowerCase() === unit.toLowerCase()).map((p) => p.value);
  const fmt = (n: number) => String(Math.round(n * 100) / 100);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `${fmt(min)} ${unit}` : `${fmt(min)} to ${fmt(max)} ${unit}`;
}

function pluralizePropertyType(type: string): string {
  const lower = type.toLowerCase();
  return lower === "farm land" || lower === "other" ? lower : `${lower}s`;
}

export async function generateStaticParams() {
  try {
    const properties = await getAllProperties();
    return properties.map((property) => ({
      slug: property.slug,
    }));
  } catch {
    return [];
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const [property, relatedProperties] = await Promise.all([
    getPropertyBySlug(slug),
    getRelatedProperties(slug, 3),
  ]);

  if (!property) {
    notFound();
  }
  const coords = property.coordinates || { latitude: 26.8428, longitude: 75.6415 };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `${siteConfig.url}/properties/${property.slug}#place`,
        name: property.name,
        description: property.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: property.location,
          addressLocality: property.city,
          addressRegion: property.state,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      },
      {
        "@type": "RealEstateListing",
        "@id": `${siteConfig.url}/properties/${property.slug}#listing`,
        name: property.name,
        url: `${siteConfig.url}/properties/${property.slug}`,
        description: property.shortDescription,
        datePosted: property.createdAt,
        dateModified: property.updatedAt,
        category: property.propertyType,
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
            name: "Properties",
            item: `${siteConfig.url}/properties`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: property.name,
            item: `${siteConfig.url}/properties/${property.slug}`,
          },
        ],
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

      {/* Main Luxury Property Detail Client Experience */}
      <PropertyDetailPageClient
        property={property}
        relatedProperties={relatedProperties}
      />
    </>
  );
}
