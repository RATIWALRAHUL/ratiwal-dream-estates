/**
 * @file test-cms-seo.ts
 * @description Automated test suite for PRD 20: CMS, Technical SEO, Content Publishing & Website Conversion.
 */

import { CmsSanitizerService } from "../src/lib/services/cms-sanitizer.service";
import { CmsSlugService } from "../src/lib/services/cms-slug.service";
import { CmsPreviewService } from "../src/lib/services/cms-preview.service";
import { SeoMetadataService } from "../src/lib/services/seo-metadata.service";
import {
  isValidCmsStatusTransition,
  CMS_CONTENT_TYPES,
  CMS_BLOCK_TYPES,
  CMS_PUBLISHING_STATUSES,
} from "../src/types/cms";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

async function runCmsSeoTests() {
  console.log("\n=======================================================");
  console.log("   PRD 20: CMS & TECHNICAL SEO AUTOMATED TEST SUITE    ");
  console.log("=======================================================\n");

  // ─── 1. Publishing State Transitions ───────────────────────────────────────
  console.log("1. Publishing Lifecycle & State Machine Validations:");
  assert(
    isValidCmsStatusTransition("DRAFT", "UNDER_REVIEW"),
    "DRAFT can transition to UNDER_REVIEW"
  );
  assert(
    isValidCmsStatusTransition("UNDER_REVIEW", "APPROVED"),
    "UNDER_REVIEW can transition to APPROVED"
  );
  assert(
    isValidCmsStatusTransition("APPROVED", "PUBLISHED"),
    "APPROVED can transition to PUBLISHED"
  );
  assert(
    isValidCmsStatusTransition("APPROVED", "SCHEDULED"),
    "APPROVED can transition to SCHEDULED"
  );
  assert(
    isValidCmsStatusTransition("PUBLISHED", "UNPUBLISHED"),
    "PUBLISHED can transition to UNPUBLISHED"
  );
  assert(
    !isValidCmsStatusTransition("DRAFT", "PUBLISHED"),
    "DRAFT cannot jump directly to PUBLISHED without review/approval"
  );
  assert(
    !isValidCmsStatusTransition("ARCHIVED", "PUBLISHED"),
    "ARCHIVED entries cannot transition to PUBLISHED"
  );

  // ─── 2. XSS & HTML Sanitization ──────────────────────────────────────────
  console.log("\n2. Server-side XSS & HTML Sanitization Tests:");
  const dirtyHtml1 = '<p>Welcome</p><script>alert("XSS")</script>';
  const cleanHtml1 = CmsSanitizerService.sanitizeHtml(dirtyHtml1);
  assert(
    !cleanHtml1.includes("<script>") && cleanHtml1.includes("<p>Welcome</p>"),
    "Stripped raw <script> tag from rich text"
  );

  const dirtyHtml2 = '<img src="https://example.com/pic.jpg" onerror="alert(1)" />';
  const cleanHtml2 = CmsSanitizerService.sanitizeHtml(dirtyHtml2);
  assert(
    !cleanHtml2.includes("onerror"),
    "Stripped event handlers (onerror) from image elements"
  );

  const dirtyUrl = "javascript:alert(document.cookie)";
  const cleanUrl = CmsSanitizerService.sanitizeUrl(dirtyUrl);
  assert(cleanUrl === "#", "Blocked dangerous javascript: URL scheme");

  const dirtyIframe = '<iframe src="https://evil-hacker.com/malware"></iframe>';
  const cleanIframe = CmsSanitizerService.sanitizeHtml(dirtyIframe);
  assert(
    cleanIframe.includes("Blocked unauthorized iframe source"),
    "Blocked unauthorized external iframe domain"
  );

  const safeIframe = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>';
  const cleanSafeIframe = CmsSanitizerService.sanitizeHtml(safeIframe);
  assert(
    cleanSafeIframe.includes("youtube.com/embed"),
    "Permitted allowlisted YouTube embed"
  );

  // ─── 3. Slug Management & Reserved Prefixes ──────────────────────────────
  console.log("\n3. Slug Management & Collision Prevention:");
  const normalized = CmsSlugService.normalizeSlug("  2026 Jaipur Land Blueprint!!  ");
  assert(
    normalized === "2026-jaipur-land-blueprint",
    "Normalized complex title into clean URL slug"
  );

  // ─── 4. Cryptographic Draft Preview Tokens ────────────────────────────────
  console.log("\n4. Draft Preview Token Security:");
  const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const hashed = CmsPreviewService.hashToken(rawToken);
  assert(
    hashed.length === 64 && hashed !== rawToken,
    "Generated 64-char SHA-256 hash of raw draft preview token"
  );

  // ─── 5. Schema.org JSON-LD Structured Data ────────────────────────────────
  console.log("\n5. Structured Data (Schema.org JSON-LD) Builders:");
  const orgJson = SeoMetadataService.getOrganizationJsonLd();
  assert(
    orgJson["@context"] === "https://schema.org" &&
      orgJson["@type"] === "RealEstateAgent" &&
      orgJson.name.includes("Ratiwal"),
    "Built compliant RealEstateAgent JSON-LD"
  );

  const breadcrumbs = SeoMetadataService.getBreadcrumbsJsonLd([
    { name: "Home", url: "/" },
    { name: "Properties", url: "/properties" },
    { name: "Royal Palms", url: "/properties/royal-palms" },
  ]);
  assert(
    breadcrumbs["@type"] === "BreadcrumbList" &&
      breadcrumbs.itemListElement.length === 3 &&
      breadcrumbs.itemListElement[2].position === 3,
    "Built valid BreadcrumbList JSON-LD with positional hierarchy"
  );

  const articleJson = SeoMetadataService.getArticleJsonLd({
    title: "Guide to Registry in Rajasthan",
    description: "Legal steps for DLC valuation and registry",
    slug: "guide-to-registry-rajasthan",
    publishedAt: "2026-08-20T00:00:00Z",
    authorName: "Rahul Ratiwal",
  });
  assert(
    articleJson["@type"] === "Article" &&
      articleJson.headline === "Guide to Registry in Rajasthan" &&
      articleJson.url.includes("/insights/guide-to-registry-rajasthan"),
    "Built compliant Article JSON-LD for insight publications"
  );

  const faqJson = SeoMetadataService.getFaqPageJsonLd([
    {
      question: "Are plots RERA approved?",
      answer: "Yes, all Ratiwal properties have clear RERA registration numbers.",
    },
  ]);
  assert(
    faqJson["@type"] === "FAQPage" &&
      faqJson.mainEntity.length === 1 &&
      faqJson.mainEntity[0].name === "Are plots RERA approved?",
    "Built valid FAQPage JSON-LD"
  );

  console.log("\n-------------------------------------------------------");
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log("-------------------------------------------------------\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runCmsSeoTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
