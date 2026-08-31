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
import { AnalyticsService } from "../src/lib/services/analytics.service";
import {
  getDashboardOverview,
  getDashboardProperties,
  getDashboardLocations,
} from "../src/lib/services/dashboard.service";
import type { AdminSession } from "../src/lib/auth/session";

const mockSuperAdminSession: AdminSession = {
  user: {
    id: "admin-super-01",
    email: "admin@ratiwal.com",
    name: "Super Administrator",
    role: "SUPER_ADMIN",
    isActive: true,
  },
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

const mockEditorSession: AdminSession = {
  user: {
    id: "editor-user-01",
    email: "advisor@ratiwal.com",
    name: "Staff Advisor",
    role: "EDITOR",
    isActive: true,
  },
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

let passed = 0;

function it(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(` ✅ PASS: ${name}`);
      passed++;
    })
    .catch((err) => {
      console.error(` ❌ FAIL: ${name}`);
      console.error(err);
      process.exit(1);
    });
}

async function runEquivalenceTests() {
  console.log("\n========================================================");
  console.log(" Ratiwal Dream Estates — Backend Equivalence Test Suite");
  console.log("========================================================\n");

  await connectToDatabase();

  // --- 1. Dashboard Overview Contract & Invariants ---
  console.log("--- [1] Dashboard Overview Structure & Metrics ---");
  await it("getDashboardOverview returns all required KPI metric blocks", async () => {
    const data = await getDashboardOverview();
    assert(data.metrics !== undefined, "metrics block must exist");
    assert(typeof data.metrics.totalProperties === "number", "totalProperties is number");
    assert(typeof data.metrics.publishedProperties === "number", "publishedProperties is number");
    assert(typeof data.metrics.totalPlotOptions === "number", "totalPlotOptions is number");
    assert(typeof data.metrics.availablePlots === "number", "availablePlots is number");
    assert(Array.isArray(data.inventoryBreakdown), "inventoryBreakdown is array");
    assert(Array.isArray(data.publicationBreakdown), "publicationBreakdown is array");
    assert(Array.isArray(data.verificationAlerts), "verificationAlerts is array");
    assert(Array.isArray(data.recentProperties), "recentProperties is array");
    assert(Array.isArray(data.locationCoverage), "locationCoverage is array");
    assert(data.locationCoverage.length <= 8, "locationCoverage limited to max 8");
  });

  // --- 2. Dashboard Locations Query & Pagination ---
  console.log("\n--- [2] Dashboard Locations Pagination & Summary ---");
  await it("getDashboardLocations calculates summary and preserves paginated items", async () => {
    const res = await getDashboardLocations({ page: 1, pageSize: 10 });
    assert(res.summary !== undefined, "summary must exist");
    assert(typeof res.summary.totalLocations === "number", "totalLocations is number");
    assert(typeof res.summary.activeMarkets === "number", "activeMarkets is number");
    assert(typeof res.summary.verifiedStates === "number", "verifiedStates is number");
    assert(Array.isArray(res.items), "items is array");
    assert(res.pagination.page === 1, "page matches");
    assert(res.pagination.pageSize === 10, "pageSize matches");
  });

  // --- 3. Property Query & Text/Prefix Search ---
  console.log("\n--- [3] Property Query & Search Correctness ---");
  await it("getDashboardProperties returns paginated result with search", async () => {
    const allProps = await getDashboardProperties({ pageSize: 10 });
    assert(Array.isArray(allProps.items), "items is array");
    assert(allProps.pagination.totalItems >= 0, "totalItems is non-negative");

    const searched = await getDashboardProperties({ search: "Jaipur", pageSize: 10 });
    assert(Array.isArray(searched.items), "searched items is array");
  });

  // --- 4. Analytics Overview Engine Contract & RBAC ---
  console.log("\n--- [4] Analytics Overview Output Contracts ---");
  await it("AnalyticsService.getOverviewAnalytics returns valid data structure for SUPER_ADMIN", async () => {
    const data = await AnalyticsService.getOverviewAnalytics({ preset: "LAST_30_DAYS" }, mockSuperAdminSession);
    assert(data.metrics !== undefined, "metrics exists");
    assert(data.timeSeries !== undefined, "timeSeries exists");
    assert(Array.isArray(data.timeSeries.dates), "timeSeries.dates is array");
    assert(Array.isArray(data.sourceDistribution), "sourceDistribution is array");
    assert(Array.isArray(data.topDemandProperties), "topDemandProperties is array");
    assert(Array.isArray(data.topDemandLocations), "topDemandLocations is array");
    assert(data.followUpHealth !== undefined, "followUpHealth exists");
  });

  await it("AnalyticsService.getOverviewAnalytics executes cleanly for EDITOR (RBAC Scoped)", async () => {
    const data = await AnalyticsService.getOverviewAnalytics({ preset: "LAST_30_DAYS" }, mockEditorSession);
    assert(data.metrics !== undefined, "metrics exists");
  });

  // --- 5. Funnel Analytics Contract ---
  console.log("\n--- [5] Funnel Analytics Output Contracts ---");
  await it("AnalyticsService.getFunnelAnalytics returns ordered stages and lost reasons", async () => {
    const funnel = await AnalyticsService.getFunnelAnalytics({ preset: "LAST_30_DAYS" }, mockSuperAdminSession);
    assert(typeof funnel.totalEntered === "number", "totalEntered is number");
    assert(Array.isArray(funnel.stages), "stages is array");
    assert.strictEqual(funnel.stages.length, 6, "Must have 6 standard stages");
    assert(Array.isArray(funnel.lostReasonBreakdown), "lostReasonBreakdown is array");
  });

  // --- 6. Property & Location Demand Contracts ---
  console.log("\n--- [6] Property & Location Demand Output Contracts ---");
  await it("AnalyticsService.getPropertyDemandAnalytics returns ranked properties and locations", async () => {
    const demand = await AnalyticsService.getPropertyDemandAnalytics({ preset: "LAST_30_DAYS" }, mockSuperAdminSession);
    assert(Array.isArray(demand.properties), "properties is array");
    assert(Array.isArray(demand.locations), "locations is array");
  });

  // --- 7. Advisor Workload & Site Visits Contracts ---
  console.log("\n--- [7] Advisor & Site Visit Analytics Output Contracts ---");
  await it("AnalyticsService.getAdvisorWorkloadAnalytics returns advisor metrics", async () => {
    const adv = await AnalyticsService.getAdvisorWorkloadAnalytics({ preset: "LAST_30_DAYS" }, mockSuperAdminSession);
    assert(Array.isArray(adv), "advisor list is array");
  });

  await it("AnalyticsService.getSiteVisitAnalytics returns tour breakdown", async () => {
    const visits = await AnalyticsService.getSiteVisitAnalytics({ preset: "LAST_30_DAYS" }, mockSuperAdminSession);
    assert(typeof visits.totalRequested === "number", "totalRequested is number");
    assert(typeof visits.completionRate === "number", "completionRate is number");
    assert(Array.isArray(visits.cancellationReasonBreakdown), "cancellationReasonBreakdown is array");
  });

  // --- 8. Data Quality & Hygiene Contract ---
  console.log("\n--- [8] Data Quality & Hygiene Report ---");
  await it("AnalyticsService.getDataQualityReport returns hygiene score and issues", async () => {
    const dq = await AnalyticsService.getDataQualityReport(mockSuperAdminSession);
    assert(typeof dq.overallScore === "number", "overallScore is number");
    assert(Array.isArray(dq.issues), "issues is array");
    assert(dq.issues.length >= 4, "Must contain at least 4 health audit checks");
  });

  await disconnectFromDatabase();

  console.log("\n========================================================");
  console.log(` Equivalence Summary: ${passed} passed, 0 failed`);
  console.log("========================================================\n");
}

runEquivalenceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
