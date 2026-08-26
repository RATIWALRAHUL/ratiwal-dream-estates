import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard/",
        "/portal/",
        "/partner/",
        "/preview/",
        "/kyc/submit/",
        "/payments/pay/",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
