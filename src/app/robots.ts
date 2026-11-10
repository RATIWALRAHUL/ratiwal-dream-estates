import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * ==============================================================================
 * Ratiwal Dream Estates — Production Robots & Bot Governance Configuration
 * ==============================================================================
 * AI Policy:
 * - Search indexing: ALLOWED (search=yes)
 * - AI search / direct user queries: ALLOWED (ai-input=yes)
 * - AI model training / bulk scraping: DISALLOWED (ai-train=no)
 * 
 * To update AI bot permissions:
 * - Modify the rules for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended below.
 * ==============================================================================
 */

// Matching is prefix-based (RFC 9309). "/dashboard" blocks "/dashboard" and "/dashboard/*".
// "/partner/" + "/partner$" is used instead of a bare "/partner" so a future public
// "/partners" page is not blocked. "/_next/" is intentionally NOT listed: crawlers
// need /_next/static and /_next/image to render pages.
const PRIVATE_DISALLOWED_PATHS = [
  "/admin",
  "/dashboard",
  "/portal",
  "/partner/",
  "/partner$",
  "/kyc",
  "/payments",
  "/preview",
  "/api",
  "/internal",
];

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = `${siteConfig.url}/sitemap.xml`;

  return {
    rules: [
      // Standard search engine crawlers (Google, Bing, DuckDuckGo, etc.)
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      // OpenAI / ChatGPT Search & Retrieval Agent
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      // Anthropic / Claude Search & Retrieval Agent
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      // Perplexity Search & Answer Engine
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
      // Google AI Training & Extended Crawler
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: PRIVATE_DISALLOWED_PATHS,
      },
    ],
    sitemap: sitemapUrl,
    host: siteConfig.url,
  };
}

