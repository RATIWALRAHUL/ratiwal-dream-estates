import { siteConfig } from "@/config/site";
import { Property } from "@/types/property";
import { Location } from "@/types/location";
import { InsightArticle } from "@/types/insight";

/**
 * Escapes unsafe JSON-LD characters for safe injection into script tags.
 */
export function sanitizeJsonLd(schema: Record<string, unknown> | Array<unknown>): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Builds canonical RealEstateAgent / Organization schema for the business.
 */
export function buildRealEstateAgentSchema() {
  return {
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.url}/#organization`,
    name: "Ratiwal Dream Estates",
    alternateName: "Ratiwal Dream Estates",
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/images/brand/logo.jpg`,
      width: 512,
      height: 512,
    },
    image: `${siteConfig.url}/images/about/office-consultation.jpg`,
    description:
      "Verified real-estate consultancy specializing in freehold residential and commercial plotted developments across Jaipur, Navi Mumbai, Ajmer, Panvel, and Bhiwadi.",
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Jaipur, Rajasthan",
      },
      {
        "@type": "AdministrativeArea",
        name: "Navi Mumbai, Maharashtra",
      },
      {
        "@type": "AdministrativeArea",
        name: "Ajmer, Rajasthan",
      },
      {
        "@type": "AdministrativeArea",
        name: "Panvel, Maharashtra",
      },
      {
        "@type": "AdministrativeArea",
        name: "Bhiwadi, Rajasthan",
      },
    ],
    knowsAbout: [
      "Land Revenue Records",
      "Section 90A Land Conversion",
      "RERA Regulatory Compliance",
      "Master-Planned Plotted Townships",
      "Commercial & Logistics Land Banking",
    ],
  };
}

/**
 * Builds WebSite schema for the homepage.
 */
export function buildWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: "Ratiwal Dream Estates",
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

/**
 * Builds BreadcrumbList schema.
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds WebPage / CollectionPage / AboutPage / ContactPage schema.
 */
export function buildWebPageSchema({
  title,
  description,
  url,
  type = "WebPage",
}: {
  title: string;
  description: string;
  url: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
}) {
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

/**
 * Builds RealEstateListing schema for property detail routes.
 */
export function buildRealEstateListingSchema(property: Property) {
  const coords = property.coordinates || { latitude: 26.8428, longitude: 75.6415 };

  const listing: Record<string, unknown> = {
    "@type": "RealEstateListing",
    "@id": `${siteConfig.url}/properties/${property.slug}#listing`,
    name: property.name,
    url: `${siteConfig.url}/properties/${property.slug}`,
    description: property.shortDescription,
    datePosted: property.createdAt,
    dateModified: property.updatedAt,
    category: property.propertyType,
    image: property.images && property.images.length > 0
      ? property.images.map((img) => `${siteConfig.url}${img}`)
      : [`${siteConfig.url}/images/about/township-development.jpg`],
    place: {
      "@type": "Place",
      name: property.name,
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
  };

  return listing;
}

/**
 * Builds BlogPosting schema for Insight articles.
 */
export function buildArticleSchema(article: InsightArticle) {
  return {
    "@type": "BlogPosting",
    "@id": `${siteConfig.url}/insights/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt,
    image: `${siteConfig.url}${article.heroImage}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: `${siteConfig.url}/insights/${article.slug}`,
    articleSection: article.category,
    author: {
      "@type": "Organization",
      name: article.author.name,
      url: siteConfig.url,
    },
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

/**
 * Builds Place schema for Location detail pages.
 */
export function buildLocationSchema(location: Location) {
  return {
    "@type": "Place",
    "@id": `${siteConfig.url}/locations/${location.slug}#place`,
    name: `${location.name}, ${location.state}`,
    description: location.shortDescription,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.name,
      addressRegion: location.state,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    },
  };
}

/**
 * Builds FAQPage schema for pages with visibly rendered FAQs.
 */
export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
