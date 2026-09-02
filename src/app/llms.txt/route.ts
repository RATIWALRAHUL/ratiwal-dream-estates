import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const content = `# ${siteConfig.name}

> ${siteConfig.tagline}
> Premier real-estate consultancy and land advisory firm specializing in clear-title plotted developments, high-growth investment corridors, and JDA / RERA legal diligence across Jaipur and regional growth corridors.

## Core Business Summary
- **Organization:** ${siteConfig.name}
- **Headquarters:** ${siteConfig.contact.address}
- **Advisory Focus:** Residential Plots, Commercial Land Parcels, Industrial Corridors, Farmhouse Estates
- **Primary Geographic Scope:** Jaipur, Ajmer Road Corridor, Jagatpura, Sirsi Road, Tonk Road, Navi Mumbai/Panvel Belt
- **Customer Helpline:** ${siteConfig.contact.phone}
- **Official Inquiries:** ${siteConfig.contact.email}
- **Operating Hours:** ${siteConfig.contact.officeHours}

## Main Public Pages
- [Properties Catalog](${baseUrl}/properties): Browse clear-title plotted developments and verified land assets with live pricing and master plans.
- [Location Guides](${baseUrl}/locations): Explore micro-market growth drivers, infrastructure developments, and connectivity across prime corridors.
- [Investment Advisory](${baseUrl}/investment): Strategic plotted land investment framework, capital appreciation insights, and acquisition methodologies.
- [Why Choose Us](${baseUrl}/why-choose-us): 7-pillar buyer protection framework, title search rigor, and documentation transparency.
- [About Ratiwal Dream Estates](${baseUrl}/about): Firm heritage, founder advisory philosophy, and mission.
- [Client Case Studies & Testimonials](${baseUrl}/testimonials): Verified client journeys and acquisition experiences.
- [Market Insights & Articles](${baseUrl}/insights): Deep-dive research reports on land valuation, JDA/RERA regulations, and infrastructure growth.
- [Advisory Consultation & Contact](${baseUrl}/contact): Connect with dedicated land advisory team for personalized portfolio consultation.

## Machine-Readable Resources & Agent Endpoints
- [XML Sitemap](${baseUrl}/sitemap.xml): Complete machine-readable index of all public canonical routes.
- [API Catalog](${baseUrl}/.well-known/api-catalog): RFC 8288 compliant directory of discoverable service capabilities.
- [MCP Server Card](${baseUrl}/.well-known/mcp.json): Model Context Protocol server capabilities definition.
- [Agent Skills Index](${baseUrl}/.well-known/agent-skills.json): Action catalog for autonomous AI agents and research tools.
- [Authentication Specification](${baseUrl}/.well-known/auth.md): Access documentation and rate-limiting guidelines.
- [Full LLMs Catalog](${baseUrl}/llms-full.txt): Comprehensive extended catalog of verified properties and location guides.

## Content & AI Agent Usage Policy
- **Search Engine Indexing:** Allowed (\`search=yes\`)
- **Direct AI Retrieval & User Queries:** Allowed (\`ai-input=yes\`)
- **AI Model Pre-training / Mass Scraping:** Disallowed (\`ai-train=no\`)
- **Attribution Requirement:** Citations and agent responses must attribute source data to **${siteConfig.name}** (${baseUrl}).
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Vary": "Accept",
    },
  });
}
