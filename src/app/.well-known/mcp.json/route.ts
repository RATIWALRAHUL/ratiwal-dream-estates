import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const mcpCard = {
    $schema: "https://modelcontextprotocol.io/schema/server.json",
    name: "ratiwal-dream-estates-mcp",
    title: `${siteConfig.name} Knowledge Server`,
    description: "Official Model Context Protocol (MCP) server card for Ratiwal Dream Estates property search and micro-market intelligence.",
    version: "1.0.0",
    status: "available",
    provider: {
      name: siteConfig.name,
      url: baseUrl,
      contact: siteConfig.contact.email,
    },
    protocols: {
      mcp: "2024-11-05",
    },
    transports: [
      {
        type: "http-sse",
        status: "read-only-content-negotiation",
        endpoint: `${baseUrl}/llms-full.txt`,
      },
    ],
    resources: [
      {
        uri: "properties://catalog",
        name: "Verified Plotted Land Catalog",
        description: "List of all active, published clear-title residential and commercial plotted developments.",
        mimeType: "text/markdown",
        url: `${baseUrl}/properties`,
      },
      {
        uri: "locations://guides",
        name: "Micro-Market Corridor Reports",
        description: "High-growth corridors and investment reports across Jaipur.",
        mimeType: "text/markdown",
        url: `${baseUrl}/locations`,
      },
      {
        uri: "llms://knowledge-base",
        name: "Machine-Readable Knowledge Base",
        description: "Curated LLM summary and full knowledge catalog.",
        mimeType: "text/markdown",
        url: `${baseUrl}/llms.txt`,
      },
    ],
    tools: [
      {
        name: "search_properties",
        description: "Discover verified plots based on location, budget, and area specifications.",
        inputSchema: {
          type: "object",
          properties: {
            location: { type: "string", description: "Target corridor (e.g., Ajmer Road, Jagatpura, Sirsi Road)" },
            budgetMaxPaise: { type: "number", description: "Maximum budget in Indian Paise (e.g. 500000000 for 50 Lakhs)" },
          },
        },
      },
    ],
    termsOfService: `${baseUrl}/terms-of-service`,
    privacyPolicy: `${baseUrl}/privacy-policy`,
  };

  return NextResponse.json(mcpCard, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
