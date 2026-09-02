/**
 * @file test-agent-readiness.ts
 * @description Automated verification test suite for AI agent readiness, SEO discoverability,
 * bot governance, Markdown negotiation, JSON-LD schemas, and .well-known endpoints.
 */

import robotsHandler from "../src/app/robots";
import sitemapHandler from "../src/app/sitemap";
import { GET as llmsHandler } from "../src/app/llms.txt/route";
import { GET as llmsFullHandler } from "../src/app/llms-full.txt/route";
import { GET as apiCatalogHandler } from "../src/app/.well-known/api-catalog/route";
import { GET as mcpJsonHandler } from "../src/app/.well-known/mcp.json/route";
import { GET as agentSkillsHandler } from "../src/app/.well-known/agent-skills.json/route";
import { GET as authMdHandler } from "../src/app/.well-known/auth.md/route";
import { MarkdownGenerator } from "../src/lib/markdown/markdown-generator";
import {
  getRealEstateAgentSchema,
  getWebSiteSchema,
  getPropertyDetailSchema,
  getArticleSchema,
  getFaqPageSchema,
} from "../src/components/seo/JsonLd";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  RATIWAL DREAM ESTATES — AGENT READINESS TEST SUITE  ");
  console.log("=======================================================\n");

  // 1. Robots.txt Bot Governance
  console.log("▶ Testing robots.txt configuration & bot governance...");
  const robotsConfig = robotsHandler();
  assert(Boolean(robotsConfig.sitemap), "Sitemap directive is present in robots.txt");
  assert(
    typeof robotsConfig.sitemap === "string" && robotsConfig.sitemap.startsWith("https://"),
    "Sitemap uses absolute canonical HTTPS URL"
  );
  assert(Array.isArray(robotsConfig.rules), "Robots rules is a valid multi-agent array");

  const userAgents = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules.map((r: any) => r.userAgent)
    : [];
  assert(userAgents.includes("GPTBot"), "Explicit rule group for GPTBot");
  assert(userAgents.includes("ClaudeBot"), "Explicit rule group for ClaudeBot");
  assert(userAgents.includes("PerplexityBot"), "Explicit rule group for PerplexityBot");
  assert(userAgents.includes("Google-Extended"), "Explicit rule group for Google-Extended");

  // 2. XML Sitemap
  console.log("\n▶ Testing XML Sitemap generator...");
  const sitemapEntries = await sitemapHandler();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 0, "Sitemap returns non-empty entries list");
  const hasLocalhost = sitemapEntries.some((e) => e.url.includes("localhost"));
  assert(!hasLocalhost, "Sitemap contains NO localhost URLs in canonical entries");
  const hasPrivatePath = sitemapEntries.some(
    (e) =>
      e.url.includes("/dashboard") ||
      e.url.includes("/portal") ||
      e.url.includes("/partner") ||
      e.url.includes("/api")
  );
  assert(!hasPrivatePath, "Sitemap excludes all dashboard, portal, partner, and API routes");
  const urls = sitemapEntries.map((e) => e.url);
  const uniqueUrls = new Set(urls);
  assert(urls.length === uniqueUrls.size, "Sitemap contains ZERO duplicate URLs");

  // 3. llms.txt & llms-full.txt
  console.log("\n▶ Testing llms.txt and llms-full.txt endpoints...");
  const llmsResponse = await llmsHandler();
  assert(llmsResponse.status === 200, "llms.txt returns HTTP 200");
  assert(
    llmsResponse.headers.get("Content-Type")?.includes("text/markdown") ?? false,
    "llms.txt returns Content-Type: text/markdown"
  );
  const llmsText = await llmsResponse.text();
  assert(llmsText.includes("# Ratiwal Dream Estates"), "llms.txt contains business title");
  assert(llmsText.includes("ai-train=no"), "llms.txt declares AI training policy");

  const llmsFullResponse = await llmsFullHandler();
  assert(llmsFullResponse.status === 200, "llms-full.txt returns HTTP 200");
  const llmsFullText = await llmsFullResponse.text();
  assert(llmsFullText.includes("Verified Properties"), "llms-full.txt contains properties section");

  // 4. Content Negotiation & MarkdownGenerator
  console.log("\n▶ Testing MarkdownGenerator for Content Negotiation...");
  const homeMd = await MarkdownGenerator.getHomepageMarkdown();
  assert(homeMd.includes("Executive Summary"), "Homepage Markdown generates structured executive summary");
  const propsMd = await MarkdownGenerator.getPropertiesCatalogMarkdown();
  assert(propsMd.includes("Active Plotted Developments"), "Properties Catalog Markdown includes listings");
  const propDetailMd = await MarkdownGenerator.getPropertyDetailMarkdown("royal-palms-township-ajmer-road-jaipur");
  assert(propDetailMd !== null && propDetailMd.includes("Property Specifications"), "Single property detail Markdown resolves specifications");
  const missingPropMd = await MarkdownGenerator.getPropertyDetailMarkdown("non-existent-plot-xyz");
  assert(missingPropMd === null, "Missing / unpublished property returns null (404)");

  // 5. JSON-LD Structured Data
  console.log("\n▶ Testing JSON-LD structured data generators...");
  const orgSchema = getRealEstateAgentSchema();
  assert(orgSchema["@type"].includes("RealEstateAgent"), "RealEstateAgent schema has correct @type");
  assert(Boolean(orgSchema.telephone) && Boolean(orgSchema.email), "RealEstateAgent contains valid public contact details");

  const websiteSchema = getWebSiteSchema();
  assert(websiteSchema["@type"] === "WebSite", "WebSite schema has correct @type");

  const propSchema = getPropertyDetailSchema({
    title: "Jaipur Greens Prime Villa Plots",
    slug: "jaipur-greens",
    priceStartingPaise: 350000000,
    areaMinSqYd: 150,
  });
  assert(propSchema["@type"] === "RealEstateListing", "Property schema produces RealEstateListing entity");
  assert(propSchema.offers.price === 3500000, "Property schema correctly converts paise to rupee numerical offer");

  const faqSchema = getFaqPageSchema([
    { question: "Is JDA approval mandatory?", answer: "Yes, JDA approval guarantees clear layout approval." },
  ]);
  assert(faqSchema["@type"] === "FAQPage" && faqSchema.mainEntity.length === 1, "FAQPage schema matches questions");

  // 6. .well-known Endpoints
  console.log("\n▶ Testing .well-known Agent Discovery Suite...");
  const apiCatalogRes = await apiCatalogHandler();
  assert(apiCatalogRes.status === 200, "/.well-known/api-catalog returns HTTP 200");
  const apiCatalogJson = await apiCatalogRes.json();
  assert(apiCatalogJson.catalogVersion === "1.0.0", "api-catalog has valid catalogVersion");
  assert(Array.isArray(apiCatalogJson.capabilities), "api-catalog exposes capabilities");

  const mcpRes = await mcpJsonHandler();
  assert(mcpRes.status === 200, "/.well-known/mcp.json returns HTTP 200");
  const mcpJson = await mcpRes.json();
  assert(mcpJson.name === "ratiwal-dream-estates-mcp", "mcp.json declares correct server name");

  const skillsRes = await agentSkillsHandler();
  assert(skillsRes.status === 200, "/.well-known/agent-skills.json returns HTTP 200");
  const skillsJson = await skillsRes.json();
  assert(Array.isArray(skillsJson.skills) && skillsJson.skills.length > 0, "agent-skills.json exposes active skills");

  const authMdRes = await authMdHandler();
  assert(authMdRes.status === 200, "/.well-known/auth.md returns HTTP 200");
  const authMdText = await authMdRes.text();
  assert(authMdText.includes("Public Agent & Crawler Access"), "auth.md outlines public vs authenticated tiers");

  // Summary
  console.log("\n=======================================================");
  console.log(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
