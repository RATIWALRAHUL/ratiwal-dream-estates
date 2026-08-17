import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { properties } from "@/data/properties";
import { locations } from "@/data/locations";

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
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...propertyUrls, ...locationUrls];
}
