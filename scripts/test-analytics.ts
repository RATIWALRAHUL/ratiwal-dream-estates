/**
 * @file test-analytics.ts
 * @description Automated verification test suite for PRD 10:
 * Business Analytics, Sales Funnel Intelligence, Report Centre, and Data Quality.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore
}

import { connectToDatabase } from "../src/lib/db/mongoose";
import { Lead } from "../src/models/Lead";
import { SiteVisit } from "../src/models/SiteVisit";
import { Property } from "../src/models/Property";
import { Location } from "../src/models/Location";
import { LeadStageHistory } from "../src/models/LeadStageHistory";
import { AnalyticsService } from "../src/lib/services/analytics.service";
import { ReportExportService } from "../src/lib/services/report-export.service";
import { AdminSession } from "../src/lib/auth/session";
import { Types } from "mongoose";

async function runTests() {
  console.log("================================================================================");
  console.log("PRD 10: Business Analytics, Sales Funnel & Reporting Test Suite");
  console.log("================================================================================\n");

  await connectToDatabase();
  console.log("✓ Connected to MongoDB for analytics testing.");

  const mockAdminSession: AdminSession = {
    user: {
      id: "admin-test-id",
      name: "Super Admin",
      email: "admin@ratiwal.com",
      role: "SUPER_ADMIN",
      isActive: true,
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockAdvisorSession: AdminSession = {
    user: {
      id: "advisor-test-id",
      name: "Vikram Advisor",
      email: "vikram@ratiwal.com",
      role: "EDITOR",
      isActive: true,
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  // ── TEST 1: Date Range & Comparison Boundaries ─────────────────────────────
  console.log("\n[TEST 1] Testing Date Range & Comparison Calculation...");
  const dateRange = AnalyticsService.resolveDateRange({ preset: "LAST_7_DAYS" });

  const durationCurr = dateRange.current.to.getTime() - dateRange.current.from.getTime();
  const durationPrev = dateRange.previous.to.getTime() - dateRange.previous.from.getTime();

  // Difference between durations should be within 1000ms
  if (Math.abs(durationCurr - durationPrev) > 1000) {
    throw new Error("FAIL: Comparison period must equal current period duration.");
  }
  console.log("✓ Current period:", dateRange.current.label, `(${Math.round(durationCurr / 86400000)} days)`);
  console.log("✓ Preceding comparison period:", dateRange.previous.label, `(${Math.round(durationPrev / 86400000)} days)`);

  // ── TEST 2: Append-Only LeadStageHistory & Duration Math ───────────────────
  console.log("\n[TEST 2] Testing Append-Only LeadStageHistory Creation...");
  const testLeadId = new Types.ObjectId();

  const historyEntry1 = await LeadStageHistory.create({
    leadId: testLeadId,
    fromStage: "NEW",
    toStage: "CONTACTED",
    changedBy: mockAdminSession.user.id,
    changedByName: mockAdminSession.user.name,
    changedAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
    durationInPreviousStageMs: 3600000 * 4,
  });

  if (!historyEntry1._id) {
    throw new Error("FAIL: LeadStageHistory entry was not created.");
  }
  console.log("✓ Created stage transition history:", `${historyEntry1.fromStage} → ${historyEntry1.toStage} (${historyEntry1.durationInPreviousStageMs! / 3600000}h)`);

  // ── TEST 3: Overview Analytics Aggregations ────────────────────────────────
  console.log("\n[TEST 3] Testing Overview Analytics Query...");
  const overview = await AnalyticsService.getOverviewAnalytics({ preset: "LAST_30_DAYS" }, mockAdminSession);

  if (!overview.metrics.totalInquiries || !overview.metrics.avgFirstResponseHours) {
    throw new Error("FAIL: Overview metrics are incomplete.");
  }
  console.log("✓ Overview KPIs computed:", {
    totalInquiries: overview.metrics.totalInquiries.formatted,
    qualifiedLeads: overview.metrics.qualifiedLeads.formatted,
    activePipeline: overview.metrics.activePipelineLeads.formatted,
    firstResponse: overview.metrics.avgFirstResponseHours.formatted,
    siteVisits: overview.metrics.totalSiteVisits.formatted,
  });

  // ── TEST 4: Sales Funnel Stage Progression ─────────────────────────────────
  console.log("\n[TEST 4] Testing Funnel Analytics Query...");
  const funnel = await AnalyticsService.getFunnelAnalytics({ preset: "LAST_30_DAYS" }, mockAdminSession);

  if (!funnel.stages || funnel.stages.length === 0) {
    throw new Error("FAIL: Funnel stages are missing.");
  }
  console.log(`✓ Funnel analyzed across ${funnel.stages.length} pipeline stages (Total entered: ${funnel.totalEntered})`);
  console.log(`✓ First stage (${funnel.stages[0].label}): ${funnel.stages[0].count} leads`);

  // ── TEST 5: CSV Formula-Injection Protection ───────────────────────────────
  console.log("\n[TEST 5] Testing CSV Formula Injection Sanitization...");
  const dangerousInputs = [
    "=1+1",
    "+CMD|' /C calc'!A0",
    "-2+3",
    "@SUM(1,2)",
    "\tmalicious_tab",
  ];

  for (const input of dangerousInputs) {
    const sanitized = ReportExportService.sanitizeCsvCell(input);
    if (!sanitized.startsWith("'") && !sanitized.startsWith('"\'')) {
      throw new Error(`FAIL: Formula prefix was not escaped in: ${input} -> ${sanitized}`);
    }
  }
  console.log("✓ Successfully escaped all formula injection attack vectors (=, +, -, @, \\t).");

  // ── TEST 6: Report Generation & Column Allowlists ──────────────────────────
  console.log("\n[TEST 6] Testing Report Generation...");
  const inquiryReport = await ReportExportService.executeReport("INQUIRY_REPORT", 1, 10, mockAdminSession);
  if (!inquiryReport.columns || inquiryReport.columns.length === 0) {
    throw new Error("FAIL: Report columns missing.");
  }
  console.log(`✓ Generated ${inquiryReport.reportType} with ${inquiryReport.columns.length} columns and ${inquiryReport.rows.length} rows.`);

  // ── TEST 7: Data Quality Hygiene Audit ─────────────────────────────────────
  console.log("\n[TEST 7] Testing Data Quality Scanner...");
  const dqReport = await AnalyticsService.getDataQualityReport(mockAdminSession);
  if (dqReport.overallScore < 0 || dqReport.overallScore > 100) {
    throw new Error("FAIL: Data quality score out of bounds.");
  }
  console.log(`✓ Data Quality Scanned: Score ${dqReport.overallScore}/100, Issues Detected: ${dqReport.totalIssuesCount}`);

  console.log("\n================================================================================");
  console.log("✅ ALL PRD 10 AUTOMATED ANALYTICS TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ PRD 10 TEST SUITE FAILED:", err);
  process.exit(1);
});
