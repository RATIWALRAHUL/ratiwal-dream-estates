import { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface MetadataInput {
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  noIndex?: boolean;
}

export function getMetadata({
  title,
  description,
  slug = "",
  image,
  noIndex = false,
}: MetadataInput = {}): Metadata {
  const pageTitle = title 
    ? `${title} | ${siteConfig.name}` 
    : `${siteConfig.name} | ${siteConfig.tagline}`;
    
  const pageDescription = description || siteConfig.tagline;
  const canonicalUrl = `${siteConfig.url}${slug ? `/${slug.replace(/^\//, "")}` : ""}`;
  const ogImageUrl = image || `${siteConfig.url}/images/brand/og-image.jpg`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
