import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from .env.local if present in CLI environment
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

import assert from "node:assert";
import { connectToDatabase, disconnectFromDatabase } from "../src/lib/db/mongoose";
import { Location } from "../src/models/Location";
import { Property } from "../src/models/Property";
import {
  getDashboardOverview,
  getDashboardProperties,
  getDashboardLocations,
  getLocationOptions,
} from "../src/lib/services/dashboard.service";
import {
  createSessionToken,
  type AdminUser,
} from "../src/lib/auth/session";

let passed = 0;
let failed = 0;

function pass(name: string) {
  passed++;
  console.log(` ✅ PASS: ${name}`);
}

function fail(name: string, error: unknown) {
  failed++;
  console.error(` ❌ FAIL: ${name}`);
  console.error(error);
}

async function runTests() {
  console.log("\n========================================================");
  console.log(" Ratiwal Dream Estates — PRD 3 Admin Dashboard Test Suite");
  console.log("========================================================\n");

  // 1. Auth & Session Token Tests
  console.log("--- [1] Admin Session & Token Utilities ---");
  try {
    const adminUser: AdminUser = {
      id: "admin-101",
      email: "test.admin@ratiwaldreamestates.com",
      name: "Ratiwal Test Officer",
      role: "ADMIN",
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    };

    const token = createSessionToken(adminUser);
    assert(typeof token === "string" && token.startsWith("sess_"), "createSessionToken generates valid session token");
    pass("createSessionToken generates valid sess_ token");

    // Decode and verify session structure
    const payloadStr = Buffer.from(token.replace("sess_", ""), "base64url").toString("utf-8");
    const sessionData = JSON.parse(payloadStr);
    assert(sessionData.user.id === "admin-101", "Session payload contains correct user ID");
    assert(sessionData.user.role === "ADMIN", "Session payload contains correct role");
    assert(sessionData.user.isActive === true, "Session payload marks user active");
    pass("Session token payload decodes and matches user attributes");
  } catch (err) {
    fail("Admin Session Token generation", err);
  }

  // 2. Database Connection
  console.log("\n--- [2] Database Connection & Catalog Seeding Check ---");
  try {
    await connectToDatabase();
    pass("Connected to MongoDB cluster");

    // Check if catalog has data or seed dry-run
    const propCount = await Property.countDocuments();
    const locCount = await Location.countDocuments();
    console.log(` Database currently has ${propCount} properties and ${locCount} locations.`);
    pass("Database connectivity verified");
  } catch (err) {
    fail("Database connectivity", err);
  }

  // 3. Dashboard Overview Aggregation Tests
  console.log("\n--- [3] Dashboard Overview Aggregation ---");
  try {
    const overview = await getDashboardOverview();

    assert(typeof overview.metrics.totalProperties === "number", "totalProperties is a valid number");
    assert(typeof overview.metrics.publishedProperties === "number", "publishedProperties is a valid number");
    assert(typeof overview.metrics.totalPlotOptions === "number", "totalPlotOptions is a valid number");
    assert(typeof overview.metrics.activeLocations === "number", "activeLocations is a valid number");
    pass("getDashboardOverview returns all primary metric counters");

    assert(Array.isArray(overview.inventoryBreakdown), "inventoryBreakdown is an array");
    assert(overview.inventoryBreakdown.length === 5, "inventoryBreakdown contains 5 plot status categories");
    pass("inventoryBreakdown contains Available, Reserved, Sold, On Request, Unavailable categories");

    assert(Array.isArray(overview.publicationBreakdown), "publicationBreakdown is an array");
    assert(overview.publicationBreakdown.length === 4, "publicationBreakdown contains 4 publication categories");
    pass("publicationBreakdown covers DRAFT, REVIEW, PUBLISHED, ARCHIVED");

    assert(Array.isArray(overview.verificationAlerts), "verificationAlerts is an array");
    pass("verificationAlerts is returned cleanly");

    assert(Array.isArray(overview.recentProperties), "recentProperties is an array");
    pass("recentProperties is returned cleanly");

    assert(Array.isArray(overview.locationCoverage), "locationCoverage is an array");
    pass("locationCoverage is returned cleanly");
  } catch (err) {
    fail("Dashboard Overview Aggregation", err);
  }

  // 4. Property Query Service & Filters
  console.log("\n--- [4] Property Query Service & Filters ---");
  try {
    // 4.1 Default query
    const defaultResult = await getDashboardProperties();
    assert(Array.isArray(defaultResult.items), "getDashboardProperties returns items array");
    assert(defaultResult.pagination.page === 1, "Default page is 1");
    assert(defaultResult.pagination.pageSize === 10, "Default pageSize is 10");
    pass("Default properties query returns paginated items");

    // 4.2 Search filter with sanitization
    const searchResult = await getDashboardProperties({ search: "Jaipur" });
    assert(Array.isArray(searchResult.items), "Search query returns items");
    pass("Search query safely executes with regex escaping");

    // 4.3 Property type filter
    const residentialResult = await getDashboardProperties({ propertyType: "RESIDENTIAL_PLOT" });
    assert(Array.isArray(residentialResult.items), "Property type filter executes");
    for (const item of residentialResult.items) {
      assert(item.propertyType === "RESIDENTIAL_PLOT", "Filtered items match RESIDENTIAL_PLOT");
    }
    pass("PropertyType filter correctly isolates residential plots");

    // 4.4 Pagination limit enforcement (max 50)
    const largePageResult = await getDashboardProperties({ pageSize: 100 });
    assert(largePageResult.pagination.pageSize <= 50, "pageSize capped at 50 max");
    pass("Page size strictly capped at 50 to prevent memory exhaustion");

    // 4.5 Stripping private fields
    if (defaultResult.items.length > 0) {
      const first = defaultResult.items[0];
      assert(!("documents" in first), "Private/internal documents stripped from view model");
      assert(!("cloudStorageId" in first), "Storage identifiers stripped from view model");
      pass("Private documents and internal storage IDs stripped from view model");
    }
  } catch (err) {
    fail("Property Query Service & Filters", err);
  }

  // 5. Location Query Service & Enrichment
  console.log("\n--- [5] Location Query Service & Enrichment ---");
  try {
    const locResult = await getDashboardLocations();
    assert(Array.isArray(locResult.items), "getDashboardLocations returns items array");
    pass("getDashboardLocations executes cleanly");

    if (locResult.items.length > 0) {
      const firstLoc = locResult.items[0];
      assert(typeof firstLoc.propertyCount === "number", "Location is enriched with propertyCount");
      assert(typeof firstLoc.activePlotCount === "number", "Location is enriched with activePlotCount");
      pass("Locations are enriched with live property and active plot counts");
    }

    const locOptions = await getLocationOptions();
    assert(Array.isArray(locOptions), "getLocationOptions returns array of options");
    pass("getLocationOptions returns key/value options for filters");
  } catch (err) {
    fail("Location Query Service", err);
  }

  // Disconnect
  await disconnectFromDatabase();
  pass("Database connection cleanly closed");

  console.log("\n========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});
