import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { properties as fallbackProperties } from "@/data/properties";
import { locations as fallbackLocations } from "@/data/locations";
import { getAllPublishedCaseStudies } from "@/data/testimonials";
import { getAllApprovedArticles } from "@/data/insights";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { Location } from "@/models/Location";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  // 1. Static Core Public Pages
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/properties", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/locations", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/investment", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/why-choose-us", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/testimonials", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/insights", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // 2. Dynamic Published Properties
  let propertyUrls: MetadataRoute.Sitemap = [];
  try {
    await connectToDatabase();
    const liveProps = await Property.find(
      { publicationStatus: "PUBLISHED", archivedAt: null },
      { slug: 1, updatedAt: 1 }
    ).lean();

    if (liveProps && liveProps.length > 0) {
      propertyUrls = liveProps.map((p) => ({
        url: `${baseUrl}/properties/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    } else {
      propertyUrls = fallbackProperties.map((p) => ({
        url: `${baseUrl}/properties/${p.slug}`,
        lastModified: new Date(p.updatedAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    propertyUrls = fallbackProperties.map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  }

  // 3. Dynamic Published Locations
  let locationUrls: MetadataRoute.Sitemap = [];
  try {
    const liveLocs = await Location.find(
      { publicationStatus: "PUBLISHED", archivedAt: null },
      { slug: 1, updatedAt: 1 }
    ).lean();

    if (liveLocs && liveLocs.length > 0) {
      locationUrls = liveLocs.map((l) => ({
        url: `${baseUrl}/locations/${l.slug}`,
        lastModified: l.updatedAt ? new Date(l.updatedAt) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } else {
      locationUrls = fallbackLocations.map((l) => ({
        url: `${baseUrl}/locations/${l.slug}`,
        lastModified: new Date(l.lastVerifiedAt || Date.now()),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    locationUrls = fallbackLocations.map((l) => ({
      url: `${baseUrl}/locations/${l.slug}`,
      lastModified: new Date(l.lastVerifiedAt || Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  }

  // 4. Testimonials & Case Studies
  const caseStudyUrls: MetadataRoute.Sitemap = getAllPublishedCaseStudies().map((cs) => ({
    url: `${baseUrl}/testimonials/${cs.slug}`,
    lastModified: new Date(cs.lastReviewedAt || "2026-08-15"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // 5. Approved Insights & Market Guides
  const insightUrls: MetadataRoute.Sitemap = getAllApprovedArticles().map((art) => ({
    url: `${baseUrl}/insights/${art.slug}`,
    lastModified: new Date(art.updatedAt || art.publishedAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // 6. Deduplicate URLs
  const allEntries = [
    ...staticUrls,
    ...propertyUrls,
    ...locationUrls,
    ...caseStudyUrls,
    ...insightUrls,
  ];

  const seenUrls = new Set<string>();
  const deduplicated: MetadataRoute.Sitemap = [];

  for (const entry of allEntries) {
    if (!seenUrls.has(entry.url)) {
      seenUrls.add(entry.url);
      deduplicated.push(entry);
    }
  }

  return deduplicated;
}

