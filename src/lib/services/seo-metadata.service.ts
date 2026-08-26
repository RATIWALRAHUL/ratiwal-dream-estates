import { siteConfig } from "@/config/site";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ArticleJsonLdParams {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  imageUrl?: string;
}

export interface FaqJsonLdItem {
  question: string;
  answer: string;
}

export class SeoMetadataService {
  /**
   * Generates Organization & RealEstateAgent JSON-LD
   */
  public static getOrganizationJsonLd() {
    return {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: siteConfig.name,
      description: siteConfig.tagline,
      url: siteConfig.url,
      telephone: "+91 98290 12345",
      email: "info@ratiwaldreamestates.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Ratiwal Tower, Tonk Road",
        addressLocality: "Jaipur",
        addressRegion: "Rajasthan",
        postalCode: "302015",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: "26.8851",
        longitude: "75.8091",
      },
      priceRange: "₹₹₹",
      sameAs: [
        "https://www.linkedin.com/company/ratiwal-dream-estates",
        "https://twitter.com/ratiwalestates",
      ],
    };
  }

  /**
   * Generates BreadcrumbList JSON-LD
   */
  public static getBreadcrumbsJsonLd(items: BreadcrumbItem[]) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
      })),
    };
  }

  /**
   * Generates Article JSON-LD for blogs and insights
   */
  public static getArticleJsonLd(params: ArticleJsonLdParams) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: params.title,
      description: params.description,
      url: `${siteConfig.url}/insights/${params.slug}`,
      datePublished: params.publishedAt,
      dateModified: params.updatedAt || params.publishedAt,
      author: {
        "@type": "Person",
        name: params.authorName || "Ratiwal Advisory Team",
      },
      publisher: {
        "@type": "Organization",
        name: siteConfig.name,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/images/logo.png`,
        },
      },
      image: params.imageUrl || `${siteConfig.url}/images/og-image.jpg`,
    };
  }

  /**
   * Generates FAQPage JSON-LD
   */
  public static getFaqPageJsonLd(faqs: FaqJsonLdItem[]) {
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
}
