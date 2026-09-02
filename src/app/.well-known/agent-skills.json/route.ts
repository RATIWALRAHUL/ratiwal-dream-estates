import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const skillsIndex = {
    $schema: "https://agent-skills.org/schema/v1/skills.json",
    version: "1.0.0",
    serviceName: siteConfig.name,
    serviceUrl: baseUrl,
    skills: [
      {
        id: "fetch-property-catalog",
        name: "Fetch Public Properties Catalog",
        description: "Retrieve active, published clear-title plotted land listings with pricing and dimensions.",
        endpoint: `${baseUrl}/properties`,
        supportedFormats: ["text/markdown", "text/html"],
        authentication: "none",
        rateLimited: false,
        requiresHumanConfirmation: false,
        status: "active",
      },
      {
        id: "fetch-property-detail",
        name: "Read Single Property Details",
        description: "Retrieve comprehensive specifications, amenities, and JDA/RERA approvals for a specific property slug.",
        endpointPattern: `${baseUrl}/properties/{slug}`,
        supportedFormats: ["text/markdown", "text/html"],
        authentication: "none",
        rateLimited: false,
        requiresHumanConfirmation: false,
        status: "active",
      },
      {
        id: "fetch-location-intelligence",
        name: "Read Micro-Market Corridor Guide",
        description: "Access connectivity analysis, infrastructure growth drivers, and appreciation patterns for a given corridor.",
        endpointPattern: `${baseUrl}/locations/{slug}`,
        supportedFormats: ["text/markdown", "text/html"],
        authentication: "none",
        rateLimited: false,
        requiresHumanConfirmation: false,
        status: "active",
      },
      {
        id: "read-knowledge-catalog",
        name: "Read Complete LLMs Knowledge Base",
        description: "Fetch full structured Markdown catalog containing all properties, locations, and buyer protection guidelines.",
        endpoint: `${baseUrl}/llms-full.txt`,
        supportedFormats: ["text/markdown"],
        authentication: "none",
        rateLimited: false,
        requiresHumanConfirmation: false,
        status: "active",
      },
      {
        id: "submit-buyer-inquiry",
        name: "Submit Buyer Inquiry / Site Visit Request",
        description: "Submits client contact details and property interest to the senior advisory team.",
        endpoint: `${baseUrl}/api/enquiries`,
        method: "POST",
        authentication: "none",
        rateLimited: true,
        requiresHumanConfirmation: true,
        status: "active",
      },
    ],
  };

  return NextResponse.json(skillsIndex, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
