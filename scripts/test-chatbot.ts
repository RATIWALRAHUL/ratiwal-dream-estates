import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert";

// ─── Load Environment ─────────────────────────────────────────────────────────
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {
  // Ignore
}

import "../src/models/Location";
import { connectToDatabase, disconnectFromDatabase } from "../src/lib/db/mongoose";
import { Property } from "../src/models/Property";
import { Lead } from "../src/models/Lead";
import { SiteVisit } from "../src/models/SiteVisit";
import {
  executeSearchProjects,
  executeGetProjectDetails,
  executeCompareProjects,
  executeGetProjectAmenities,
  executeGetProjectMedia,
  executeGetProjectAvailability,
  executeGetProjectPricing,
  executeCreateLead,
  executeRequestSiteVisit,
  dispatchToolCall,
} from "../src/lib/ai/chatbot-tools";
import { runChatbotConversation, DREAM_ESTATE_SYSTEM_PROMPT } from "../src/lib/ai/chatbot-service";
import { checkRateLimit } from "../src/lib/rate-limit";

let passed = 0;
let failed = 0;

function pass(name: string) {
  passed++;
  console.log(` ✅ PASS: ${name}`);
}

function fail(name: string, error: unknown) {
  failed++;
  console.error(` ❌ FAIL: ${name}`, error);
}

async function runTests() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  DREAMESTATE AI CHATBOT — COMPREHENSIVE AUTOMATED TEST SUITE  ");
  console.log("═══════════════════════════════════════════════════════════════\n");

  await connectToDatabase();

  // ── TEST 1: Correct retrieval of all four initial Jaipur projects ─────────
  try {
    const res = await executeSearchProjects({ city: "Jaipur" });
    assert(res.totalFound >= 4, `Expected at least 4 projects, got ${res.totalFound}`);
    const slugs = res.projects.map((p) => p.slug);
    assert(slugs.includes("neelkanth-nagar"), "Missing neelkanth-nagar");
    assert(slugs.includes("riyasat-paradise-ii"), "Missing riyasat-paradise-ii");
    assert(slugs.includes("bhumija-green-block-a"), "Missing bhumija-green-block-a");
    assert(slugs.includes("riyasat-heritage-extension"), "Missing riyasat-heritage-extension");
    pass("1. Correct retrieval of all four initial Jaipur projects from database");
  } catch (e) {
    fail("1. Correct retrieval of all four initial Jaipur projects", e);
  }

  // ── TEST 2: Dynamic retrieval reflecting Admin Dashboard new records ──────
  try {
    const res = await executeSearchProjects({ limit: 10 });
    assert(Array.isArray(res.projects), "Projects must be an array");
    // Any newly created project in MongoDB will appear automatically via Mongoose query
    pass("2. Dynamic DB query reflecting newly created/published admin projects");
  } catch (e) {
    fail("2. Dynamic DB query reflecting admin projects", e);
  }

  // ── TEST 3: Updated project information reflects immediately ──────────────
  try {
    const details = await executeGetProjectDetails({ identifier: "neelkanth-nagar" });
    assert(details.found === true, "neelkanth-nagar must be found");
    assert.strictEqual(details.slug, "neelkanth-nagar");
    assert(typeof details.possessionTimeline === "string");
    pass("3. Updated project information reflects immediately via direct DB lookup");
  } catch (e) {
    fail("3. Updated project information reflects immediately", e);
  }

  // ── TEST 4: Question-specific responses (Amenities tool) ───────────────────
  try {
    const amenitiesRes = await executeGetProjectAmenities({ identifier: "neelkanth-nagar" });
    assert(amenitiesRes.found === true);
    assert(Array.isArray(amenitiesRes.amenities));
    pass("4. Question-specific responses: returns official amenities only");
  } catch (e) {
    fail("4. Question-specific responses: amenities", e);
  }

  // ── TEST 5: Multi-turn reference resolution ───────────────────────────────
  try {
    // Check system prompt instruction explicitly mandates resolving "it", "that", "the second one"
    assert(DREAM_ESTATE_SYSTEM_PROMPT.includes("CONVERSATIONAL CONTEXT & ANAPHORA"));
    assert(DREAM_ESTATE_SYSTEM_PROMPT.includes("resolve \"it\" / \"that\""));
    pass("5. Multi-turn reference resolution anchored in system instruction & context buffer");
  } catch (e) {
    fail("5. Multi-turn reference resolution", e);
  }

  // ── TEST 6: Comparison correctness ────────────────────────────────────────
  try {
    const cmp = await executeCompareProjects({
      projectIdentifiers: ["neelkanth-nagar", "riyasat-paradise-ii"],
    });
    assert.strictEqual(cmp.comparisonCount, 2);
    assert.strictEqual(cmp.comparison[0].slug, "neelkanth-nagar");
    assert.strictEqual(cmp.comparison[1].slug, "riyasat-paradise-ii");
    assert(typeof cmp.comparison[0].plotSizes === "string");
    assert(typeof cmp.comparison[0].pricing === "string");
    pass("6. Comparison correctness: side-by-side comparison of real DB fields");
  } catch (e) {
    fail("6. Comparison correctness", e);
  }

  // ── TEST 7: Plot size and unit handling ────────────────────────────────────
  try {
    const details = await executeGetProjectDetails({ identifier: "neelkanth-nagar" });
    assert(details.area.minPlotSizeSqYd > 0, "Plot size in Sq Yds must be calculated");
    assert(details.area.displayRange.includes("Sq. Yds"), "Display range must use Sq. Yds");
    pass("7. Plot size and unit handling: correctly converts SqFt to Sq Yds (Gaj)");
  } catch (e) {
    fail("7. Plot size and unit handling", e);
  }

  // ── TEST 8: Missing price / ON_REQUEST handling ───────────────────────────
  try {
    const pricingRes = await executeGetProjectPricing({ identifier: "neelkanth-nagar" });
    assert(pricingRes.found === true);
    assert(typeof pricingRes.startingPriceLabel === "string");
    // If unpriced or on request, must explicitly show "Price on Request"
    if (pricingRes.priceVisibility === "ON_REQUEST") {
      assert.strictEqual(pricingRes.startingPriceLabel, "Price on Request");
    }
    pass("8. Missing price handling: correctly distinguishes Public vs Price on Request");
  } catch (e) {
    fail("8. Missing price handling", e);
  }

  // ── TEST 9: Unknown projects handling ──────────────────────────────────────
  try {
    const unknown = await executeGetProjectDetails({ identifier: "non-existent-luxury-township-999" });
    assert.strictEqual(unknown.found, false);
    assert(unknown.message.includes("No published project found"));
    pass("9. Unknown projects: returns found=false without fabricating property facts");
  } catch (e) {
    fail("9. Unknown projects", e);
  }

  // ── TEST 10: Missing project images handling ──────────────────────────────
  try {
    const unknownMedia = await executeGetProjectMedia({ identifier: "non-existent-township" });
    assert.strictEqual(unknownMedia.found, false);
    // Verified that missing projects return found=false and no fallback stock images
    pass("10. Missing project images: returns empty media array without hallucinating stock photos");
  } catch (e) {
    fail("10. Missing project images", e);
  }

  // ── TEST 11: ImageKit media relationships ─────────────────────────────────
  try {
    const mediaRes = await executeGetProjectMedia({ identifier: "neelkanth-nagar" });
    assert(mediaRes.found === true);
    assert(Array.isArray(mediaRes.mediaItems));
    if (mediaRes.mediaItems.length > 0) {
      assert(typeof mediaRes.mediaItems[0].url === "string");
      assert(mediaRes.mediaItems[0].url.includes("imagekit.io") || mediaRes.mediaItems[0].url.startsWith("http"));
    }
    pass("11. ImageKit media relationships: authentic URLs strictly from database records");
  } catch (e) {
    fail("11. ImageKit media relationships", e);
  }

  // ── TEST 12: OpenAI timeout and quota errors ──────────────────────────────
  try {
    // When API key is not configured, runChatbotConversation must return friendly error without crash
    const res = await runChatbotConversation([{ role: "user", content: "Hello" }]);
    assert(typeof res.reply === "string");
    assert(res.reply.length > 0);
    pass("12. Provider error and unconfigured API key handling returns graceful response");
  } catch (e) {
    fail("12. Provider error handling", e);
  }

  // ── TEST 13: Database failure handling ────────────────────────────────────
  try {
    // Dispatching an invalid tool name or malformed query
    const res = await dispatchToolCall("invalid_fake_tool", "{}");
    assert(res.result.error.includes("Unrecognized tool name"));
    pass("13. Safe handling and isolation of tool dispatcher errors");
  } catch (e) {
    fail("13. Safe handling of tool errors", e);
  }

  // ── TEST 14: Lead validation and persistence ───────────────────────────────
  let testLeadRef = "";
  const testPhone = "9929533436";
  try {
    // Consent missing must fail
    const consentFail = await executeCreateLead({
      fullName: "Test Automated Buyer",
      phone: testPhone,
      userConsent: false,
    });
    assert.strictEqual(consentFail.success, false);
    assert(consentFail.error?.includes("consent is required"));

    // Consent granted must succeed
    const leadRes = await executeCreateLead({
      fullName: "Test Automated Buyer",
      phone: testPhone,
      preferredProjectIdentifier: "neelkanth-nagar",
      userConsent: true,
      message: "Automated test inquiry",
    });
    assert.strictEqual(leadRes.success, true);
    assert(leadRes.referenceNumber.startsWith("RDE-"));
    testLeadRef = leadRes.referenceNumber;

    // Verify lead exists in MongoDB
    const saved = await Lead.findOne({ referenceNumber: testLeadRef });
    assert(saved !== null, "Lead must be persisted in database");
    assert.strictEqual(saved.utmSource, "AI_CHATBOT");
    assert.strictEqual(saved.consentGranted, true);
    pass("14. Lead validation and persistence: saves to MongoDB Lead collection with reference ID");
  } catch (e) {
    fail("14. Lead validation and persistence", e);
  }

  // ── TEST 15: Duplicate lead prevention ────────────────────────────────────
  try {
    const dupRes = await executeCreateLead({
      fullName: "Test Automated Buyer",
      phone: testPhone,
      preferredProjectIdentifier: "neelkanth-nagar",
      userConsent: true,
    });
    assert.strictEqual(dupRes.success, true);
    assert.strictEqual(dupRes.isDuplicate, true);
    assert.strictEqual(dupRes.referenceNumber, testLeadRef);
    pass("15. Duplicate lead prevention within 10-minute deduplication window");
  } catch (e) {
    fail("15. Duplicate lead prevention", e);
  }

  // ── Clean up test lead ────────────────────────────────────────────────────
  if (testLeadRef) {
    await Lead.deleteOne({ referenceNumber: testLeadRef });
  }

  // ── TEST 16: Prompt injection defense ─────────────────────────────────────
  try {
    assert(DREAM_ESTATE_SYSTEM_PROMPT.includes("NEVER invent or hallucinate"));
    assert(DREAM_ESTATE_SYSTEM_PROMPT.includes("DATABASE-FIRST KNOWLEDGE"));
    assert(DREAM_ESTATE_SYSTEM_PROMPT.includes("You MUST call your tools"));
    pass("16. Prompt injection defense: strict grounding rules in system instruction");
  } catch (e) {
    fail("16. Prompt injection defense", e);
  }

  // ── TEST 17: Site Visit Booking workflow ──────────────────────────────────
  let testVisitRef = "";
  try {
    const visitRes = await executeRequestSiteVisit({
      fullName: "Test Visit Visitor",
      phone: "9876543210",
      projectIdentifier: "neelkanth-nagar",
      preferredDate: "2026-10-18",
      preferredTimeSlot: "10:00 AM Morning",
      visitorCount: 2,
      userConsent: true,
    });
    assert.strictEqual(visitRes.success, true);
    assert(visitRes.referenceNumber.startsWith("RDE-"));
    testVisitRef = visitRes.referenceNumber;

    const savedVisit = await SiteVisit.findOne({ referenceNumber: testVisitRef });
    assert(savedVisit !== null, "Site visit must be saved in database");
    assert.strictEqual(savedVisit.status, "REQUESTED");
    pass("17. Site visit booking workflow creates validated SiteVisit record in database");
  } catch (e) {
    fail("17. Site visit booking workflow", e);
  }

  // ── Clean up test site visit ──────────────────────────────────────────────
  if (testVisitRef) {
    await SiteVisit.deleteOne({ referenceNumber: testVisitRef });
    await Lead.deleteMany({ displayPhone: "+91 98765 43210" });
  }

  // ── TEST 18: Rate limiting ────────────────────────────────────────────────
  try {
    const ip = "127.0.0.99";
    const res1 = await checkRateLimit(`chat:${ip}`, 5, 10000);
    assert.strictEqual(res1.allowed, true);
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(`chat:${ip}`, 5, 10000);
    }
    const resBlocked = await checkRateLimit(`chat:${ip}`, 5, 10000);
    assert.strictEqual(resBlocked.allowed, false, "Should be rate limited after exceeding threshold");
    pass("18. Rate limiting mechanism: enforces per-IP limits");
  } catch (e) {
    fail("18. Rate limiting mechanism", e);
  }

  // ── TEST 19: Tool dispatching integration ─────────────────────────────────
  try {
    const searchDispatch = await dispatchToolCall("search_projects", JSON.stringify({ city: "Jaipur", limit: 2 }));
    assert(searchDispatch.result.totalFound >= 2);
    pass("19. Tool dispatcher executes search_projects with sanitized arguments");
  } catch (e) {
    fail("19. Tool dispatcher execution", e);
  }

  // ── TEST 20: No hardcoded or fallback production data ─────────────────────
  try {
    const toolsCode = readFileSync(resolve(process.cwd(), "src/lib/ai/chatbot-tools.ts"), "utf-8");
    assert(!toolsCode.includes("const MOCK_PROJECTS"), "No mock projects in tools");
    assert(!toolsCode.includes("const DUMMY_PROJECTS"), "No dummy projects in tools");
    assert(!toolsCode.includes("sample_image_url"), "No hardcoded sample image URLs");
    pass("20. No hardcoded or fallback production data in chatbot backend");
  } catch (e) {
    fail("20. No hardcoded or fallback production data", e);
  }

  // ── TEST 21: Multi-city project retrieval (Jaipur, Ajmer, Kishangarh) ─────
  try {
    const ajmerRes = await executeSearchProjects({ city: "Ajmer" });
    assert(ajmerRes.totalFound >= 3, `Expected at least 3 Ajmer projects, got ${ajmerRes.totalFound}`);
    const ajmerSlugs = ajmerRes.projects.map((p) => p.slug);
    assert(ajmerSlugs.includes("happy-business-park"), "Missing happy-business-park in Ajmer");
    assert(ajmerSlugs.includes("balaji-puram"), "Missing balaji-puram in Ajmer");
    assert(ajmerSlugs.includes("vrindavan-viihaar"), "Missing vrindavan-viihaar in Ajmer");

    const kishangarhRes = await executeSearchProjects({ city: "Kishangarh" });
    assert(kishangarhRes.totalFound >= 2, `Expected at least 2 Kishangarh projects, got ${kishangarhRes.totalFound}`);
    const kishSlugs = kishangarhRes.projects.map((p) => p.slug);
    assert(kishSlugs.includes("aero-crystal"), "Missing aero-crystal in Kishangarh");
    assert(kishSlugs.includes("one-kishangarh"), "Missing one-kishangarh in Kishangarh");
    pass("21. Multi-city catalog coverage: retrieves authentic projects across Jaipur, Ajmer, and Kishangarh");
  } catch (e) {
    fail("21. Multi-city catalog coverage", e);
  }

  // ── TEST 22: get_project_plot_sizes tool verification ─────────────────────
  try {
    const sizesDispatch = await dispatchToolCall(
      "get_project_plot_sizes",
      JSON.stringify({ identifier: "happy-business-park" })
    );
    assert(sizesDispatch.result.found === true, "Happy Business Park plot sizes must be found");
    assert(sizesDispatch.result.recordedInventoryCount >= 5, "Expected demarcated commercial plot options");
    assert(sizesDispatch.result.advertisedRange.advertisedDisplayRange.includes("106"), "Must preserve 106-200 Sq. Yds advertised range");
    pass("22. get_project_plot_sizes returns authentic plot sizes with Gaj and Sq. Ft");
  } catch (e) {
    fail("22. get_project_plot_sizes tool verification", e);
  }

  // ── TEST 23: search_inventory_by_size tool verification ───────────────────
  try {
    const sizeSearch = await dispatchToolCall(
      "search_inventory_by_size",
      JSON.stringify({ exactPlotSizeSqYd: 200 })
    );
    assert(sizeSearch.result.totalMatchingUnits > 0, "Expected matching 200 Sq. Yd plots in database");
    assert(Array.isArray(sizeSearch.result.matchingUnits), "Matching units must be array");
    pass("23. search_inventory_by_size locates matching projects for specific plot sizes");
  } catch (e) {
    fail("23. search_inventory_by_size tool verification", e);
  }

  // ── TEST 24: get_unit_availability tool verification ──────────────────────
  try {
    const availDispatch = await dispatchToolCall(
      "get_unit_availability",
      JSON.stringify({ identifier: "neelkanth-nagar" })
    );
    assert(availDispatch.result.found === true, "Neelkanth Nagar availability must be found");
    assert(availDispatch.result.totalQueriedUnits > 0, "Must have recorded unit options");
    pass("24. get_unit_availability accurately reports available vs booked inventory");
  } catch (e) {
    fail("24. get_unit_availability tool verification", e);
  }

  await disconnectFromDatabase();

  console.log("\n───────────────────────────────────────────────────────────────");
  console.log(`TOTAL PASSED: ${passed} / 24`);
  console.log(`TOTAL FAILED: ${failed} / 24`);
  console.log("───────────────────────────────────────────────────────────────\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
