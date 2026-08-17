import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/api/enquiries/", "/api/site-visits/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
