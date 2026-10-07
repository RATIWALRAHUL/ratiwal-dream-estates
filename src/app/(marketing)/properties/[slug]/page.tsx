import { notFound } from "next/navigation";
import { getMetadata } from "@/lib/seo";
import {
  getAllProperties,
  getPropertyBySlug,
  getRelatedProperties,
} from "@/lib/data/properties";
import { PropertyDetailPageClient } from "@/components/property/detail/PropertyDetailPageClient";
import { siteConfig } from "@/config/site";

export const revalidate = 120;

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return getMetadata({
      title: "Property Not Found",
      noIndex: true,
    });
  }

  const primaryImage =
    property.images && property.images.length > 0
      ? `${siteConfig.url}${property.images[0]}`
      : `${siteConfig.url}/images/about/township-development.jpg`;

  return getMetadata({
    title: `${property.name} in ${property.city}`,
    description: `Explore verified property information, plot sizes (${property.plotSizes.join(
      ", "
    )}), pricing status (${property.priceLabel}), connectivity, documents, and site-visit options for ${
      property.name
    } in ${property.city}, ${property.state}.`,
    slug: `/properties/${property.slug}`,
    image: primaryImage,
  });
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
