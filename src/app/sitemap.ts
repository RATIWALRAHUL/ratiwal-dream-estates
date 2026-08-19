import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { properties } from "@/data/properties";
import { locations } from "@/data/locations";
import { getAllPublishedCaseStudies } from "@/data/testimonials";
import { getAllApprovedArticles } from "@/data/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/properties",
    "/locations",
    "/investment",
    "/about",
    "/why-choose-us",
    "/testimonials",
    "/insights",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/disclaimer",
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const propertyUrls = properties.map((prop) => ({
    url: `${siteConfig.url}/properties/${prop.slug}`,
    lastModified: new Date(prop.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const locationUrls = locations.map((loc) => ({
    url: `${siteConfig.url}/locations/${loc.slug}`,
    lastModified: new Date(loc.lastVerifiedAt || "2026-08-15"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const caseStudyUrls = getAllPublishedCaseStudies().map((cs) => ({
    url: `${siteConfig.url}/testimonials/${cs.slug}`,
    lastModified: new Date(cs.lastReviewedAt || "2026-08-15"),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const insightUrls = getAllApprovedArticles().map((art) => ({
    url: `${siteConfig.url}/insights/${art.slug}`,
    lastModified: new Date(art.updatedAt || art.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticUrls, ...propertyUrls, ...locationUrls, ...caseStudyUrls, ...insightUrls];
}
