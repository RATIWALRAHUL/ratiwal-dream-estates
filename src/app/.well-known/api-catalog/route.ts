import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const catalog = {
    $schema: "https://spec.openapis.org/oas/3.1.0",
    catalogVersion: "1.0.0",
    service: {
      name: siteConfig.name,
      description: siteConfig.tagline,
      websiteUrl: baseUrl,
      termsOfServiceUrl: `${baseUrl}/terms-of-service`,
      privacyPolicyUrl: `${baseUrl}/privacy-policy`,
      contact: {
        email: siteConfig.contact.email,
        phone: siteConfig.contact.phone,
        url: `${baseUrl}/contact`,
      },
    },
    discoverability: {
      sitemap: `${baseUrl}/sitemap.xml`,
      llms: `${baseUrl}/llms.txt`,
      llmsFull: `${baseUrl}/llms-full.txt`,
      mcpServer: `${baseUrl}/.well-known/mcp.json`,
      agentSkills: `${baseUrl}/.well-known/agent-skills.json`,
      authentication: `${baseUrl}/.well-known/auth.md`,
    },
    capabilities: [
      {
        id: "public-property-search",
        name: "Public Property Search & Catalog",
        type: "web-resource",
        url: `${baseUrl}/properties`,
        description: "Browse and filter clear-title plotted development projects across Jaipur corridors.",
        formats: ["text/html", "text/markdown"],
        authentication: "none",
      },
      {
        id: "public-location-guides",
        name: "Micro-Market Location Guides",
        type: "web-resource",
        url: `${baseUrl}/locations`,
        description: "Analyze corridor growth drivers, highway connectivity, and master plans.",
        formats: ["text/html", "text/markdown"],
        authentication: "none",
      },
      {
        id: "public-enquiry-submission",
        name: "Advisory & Site Tour Inquiries",
        type: "api-endpoint",
        method: "POST",
        url: `${baseUrl}/api/enquiries`,
        description: "Submit a buyer inquiry or request a guided site tour.",
        authentication: "none",
        rateLimit: "10 requests per minute per IP",
      },
    ],
    aiGovernance: {
      policy: "Search indexing and LLM input permitted with attribution. Unauthorized model pre-training disallowed.",
      contentSignals: "search=yes, ai-input=yes, ai-train=no",
    },
  };

  return NextResponse.json(catalog, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
