/**
 * @file JsonLd.tsx
 * @description Safe, type-safe JSON-LD structured data generators and component.
 * Prevents XSS via safe JSON stringification and escaping.
 */

import React from "react";
import { siteConfig } from "@/config/site";

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Renders an inline script element containing validated JSON-LD schema
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

const baseUrl = siteConfig.url.replace(/\/$/, "");

/**
 * 1. Sitewide RealEstateAgent / Organization Schema
 */
export function getRealEstateAgentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "Organization"],
    "@id": `${baseUrl}/#organization`,
    name: siteConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/images/brand/logo.png`,
    image: `${baseUrl}/images/brand/og-image.jpg`,
    description: siteConfig.tagline,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ajmer Road Corridor & Tonk Road Junction",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      postalCode: "302001",
      addressCountry: "IN",
    },
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Jaipur, Rajasthan",
      },
      {
        "@type": "AdministrativeArea",
        name: "Rajasthan",
      },
      {
        "@type": "AdministrativeArea",
        name: "Navi Mumbai / Panvel, Maharashtra",
      },
    ],
    priceRange: "₹₹₹",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
    sameAs: [
      siteConfig.social.facebook !== "#" ? siteConfig.social.facebook : undefined,
      siteConfig.social.instagram !== "#" ? siteConfig.social.instagram : undefined,
      siteConfig.social.linkedin !== "#" ? siteConfig.social.linkedin : undefined,
    ].filter(Boolean),
  };
}

/**
 * 2. Sitewide WebSite Schema
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: siteConfig.name,
    description: siteConfig.tagline,
    inLanguage: "en-IN",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
  };
}

/**
 * 3. Property Detail (RealEstateListing & Place) Schema
 */
export function getPropertyDetailSchema(property: {
  title: string;
  slug: string;
  description?: string;
  locationName?: string;
  priceStartingPaise?: number;
  areaMinSqYd?: number;
  areaMaxSqYd?: number;
  jdaApproved?: boolean;
  reraNumber?: string;
  images?: string[];
  updatedAt?: string | Date;
}) {
  const price = property.priceStartingPaise
    ? property.priceStartingPaise / 100
    : 2500000;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${baseUrl}/properties/${property.slug}#listing`,
    name: property.title,
    description: property.description || `${property.title} by ${siteConfig.name}`,
    url: `${baseUrl}/properties/${property.slug}`,
    datePosted: property.updatedAt ? new Date(property.updatedAt).toISOString() : new Date().toISOString(),
    image: property.images && property.images.length > 0 ? property.images : [`${baseUrl}/images/brand/og-image.jpg`],
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: "2026-01-01",
      offeredBy: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    itemOffered: {
      "@type": "Place",
      name: property.title,
      description: property.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.locationName || "Jaipur",
        addressRegion: "Rajasthan",
        addressCountry: "IN",
      },
    },
  };
}

/**
 * 4. Article / Insight Schema
 */
export function getArticleSchema(article: {
  title: string;
  slug: string;
  description?: string;
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  authorName?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/insights/${article.slug}`,
    },
    datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName || "Ratiwal Dream Estates Editorial Desk",
    },
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    image: article.imageUrl ? [article.imageUrl] : [`${baseUrl}/images/brand/og-image.jpg`],
  };
}

/**
 * 5. BreadcrumbList Schema
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * 6. FAQPage Schema
 */
export function getFaqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
