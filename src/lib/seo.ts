import { Metadata } from "next";
import { siteConfig } from "@/config/site";

/** Official brand social preview image (1200×630). */
export const DEFAULT_OG_IMAGE_PATH = "/images/brand/og-image.jpg";
const DEFAULT_OG_IMAGE_SIZE = { width: 1200, height: 630 };

interface MetadataInput {
  title?: string;
  description?: string;
  slug?: string;
  image?: string;
  /** Accurate alt text for the social image (defaults to the page title). */
  imageAlt?: string;
  noIndex?: boolean;
  /**
   * Omit alternates.canonical and openGraph.url. Used by the root layout so
   * routes that define no canonical of their own (private pages, 404s) do not
   * inherit the homepage canonical.
   */
  omitCanonical?: boolean;
  /**
   * Omit the robots meta. Used by the root layout: every real page sets its own
   * robots, and Next already adds `noindex` to 404 responses, so a root
   * "index, follow" would contradict it.
   */
  omitRobots?: boolean;
  /** Open Graph type. Defaults to "website". */
  ogType?: "website" | "article";
  /** ISO dates, only used when ogType is "article". */
  publishedTime?: string;
  modifiedTime?: string;
}

/** Trim to a word boundary at or below `max` characters, adding an ellipsis when cut. */
export function fitMetaText(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** First candidate that fits in `max` characters; otherwise the last one, trimmed. */
export function pickFittingText(candidates: string[], max = 160): string {
  const clean = candidates.map((c) => c.replace(/\s+/g, " ").trim());
  return clean.find((c) => c.length <= max) ?? fitMetaText(clean[clean.length - 1], max);
}

export function getMetadata({
  title,
  description,
  slug,
  image,
  imageAlt,
  noIndex = false,
  omitCanonical = false,
  omitRobots = false,
  ogType = "website",
  publishedTime,
  modifiedTime,
}: MetadataInput = {}): Metadata {
  const pageTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | ${siteConfig.tagline}`;

  const pageDescription = description || siteConfig.tagline;

  // `slug` is deliberately NOT defaulted: "" means the homepage, undefined means
  // "no page URL supplied". A noindex page with no slug gets no canonical rather
  // than pointing at the homepage.
  const skipCanonical = omitCanonical || (noIndex && slug === undefined);
  const canonicalUrl = `${siteConfig.url}${slug ? `/${slug.replace(/^\//, "")}` : ""}`;

  const usingDefaultImage = !image;
  const ogImageUrl = image || `${siteConfig.url}${DEFAULT_OG_IMAGE_PATH}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: pageTitle,
    description: pageDescription,
    applicationName: siteConfig.name,
    authors: [{ name: "Ratiwal Dream Estates Editorial Desk", url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    formatDetection: {
      telephone: true,
      date: true,
      address: true,
      email: true,
    },
    icons: {
      icon: [
        { url: "/images/brand/logo.png", type: "image/png" },
        { url: "/favicon.png", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [
        { url: "/images/brand/logo.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/images/brand/logo.png",
    },
    ...(skipCanonical ? {} : { alternates: { canonical: canonicalUrl } }),
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      ...(skipCanonical ? {} : { url: canonicalUrl }),
      siteName: siteConfig.name,
      locale: "en_IN",
      ...(ogType === "article"
        ? {
            type: "article" as const,
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
          }
        : { type: "website" as const }),
      images: [
        {
          url: ogImageUrl,
          // Only declare dimensions we actually know (the bundled default image).
          ...(usingDefaultImage ? DEFAULT_OG_IMAGE_SIZE : {}),
          alt: imageAlt || title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImageUrl],
    },
    ...((process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION)
      ? {
          verification: {
            google:
              process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
              process.env.GOOGLE_SITE_VERIFICATION,
          },
        }
      : {}),
    ...(omitRobots
      ? {}
      : {
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
        }),
  };
}
