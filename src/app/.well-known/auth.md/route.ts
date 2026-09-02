import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const content = `# Authentication & Access Governance Specification — ${siteConfig.name}

## 1. Public Agent & Crawler Access (Unauthenticated)
The following resources are publicly accessible to AI agents, crawlers, and LLM query clients without authentication:
- **XML Sitemap:** \`${baseUrl}/sitemap.xml\`
- **Concise Knowledge Base:** \`${baseUrl}/llms.txt\`
- **Complete Knowledge Catalog:** \`${baseUrl}/llms-full.txt\`
- **API Catalog:** \`${baseUrl}/.well-known/api-catalog\`
- **MCP Server Card:** \`${baseUrl}/.well-known/mcp.json\`
- **Agent Skills Index:** \`${baseUrl}/.well-known/agent-skills.json\`
- **Public Markdown Pages:** Request with header \`Accept: text/markdown\` on any public content route (e.g., \`${baseUrl}/properties\`, \`${baseUrl}/locations\`, \`${baseUrl}/about\`).

## 2. Public API Rate Limiting
- **Inquiry Submissions (\`POST /api/enquiries\`):** 10 requests / minute per IP address.
- **Site Visit Requests (\`POST /api/site-visits/requests\`):** 5 requests / minute per IP address.
- **Public Content Retrieval:** 120 requests / minute per IP address.

## 3. Protected Systems (Authentication Required)
The internal operational portals of ${siteConfig.name} require authenticated session credentials and are strictly barred from public crawling:
- **Executive CRM Dashboard (\`/dashboard/*\`):** Requires multi-factor authenticated administrator session cookie (\`admin_session\`).
- **Client Document Portal (\`/portal/*\`):** Requires one-time PIN verified client phone authentication.
- **Channel Partner Portal (\`/partner/*\`):** Requires verified broker partner session.

## 4. Security & Privacy Safeguards
- **Zero Exposure of Internal Data:** Customer PII, internal lead notes, unpublished property drafts, and database object identifiers are strictly excluded from all public discovery documents.
- **Bot Governance Header:** \`Content-Signal: search=yes, ai-input=yes, ai-train=no\` is enforced across all public responses.

## 5. Developer & Integration Support
For enterprise API access or data licensing inquiries, please contact:
- **Email:** ${siteConfig.contact.email}
- **Website:** ${baseUrl}
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
