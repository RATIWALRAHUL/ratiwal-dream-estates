/**
 * @file test-inventory.ts
 * @description Automated verification test suite for PRD 13:
 * Property Inventory, Units, Availability & Pricing Management.
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
import { InventoryUnit } from "../src/models/InventoryUnit";
import { InventoryStatusHistory } from "../src/models/InventoryStatusHistory";
import { InventoryPriceHistory } from "../src/models/InventoryPriceHistory";
import { Property } from "../src/models/Property";
import { InventoryService } from "../src/lib/services/inventory.service";
import { InventoryImportService } from "../src/lib/services/inventory-import.service";
import { AdminSession } from "../src/lib/auth/session";
import { isValidStatusTransition } from "../src/types/inventory";
import { Types } from "mongoose";

async function runTests() {
  console.log("================================================================================");
  console.log("PRD 11: Property Inventory, Units & Pricing Test Suite");
  console.log("================================================================================\n");

  await connectToDatabase();
  console.log("✓ Connected to MongoDB for inventory verification.");

  const mockAdminSession: AdminSession = {
    user: {
      id: "admin-inv-test",
      name: "Inventory Manager",
      email: "manager@ratiwal.com",
      role: "SUPER_ADMIN",
      isActive: true,
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockAdvisorSession: AdminSession = {
    user: {
      id: "advisor-inv-test",
      name: "Advisor Rahul",
      email: "advisor@ratiwal.com",
      role: "EDITOR",
      isActive: true,
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  // Find or create a test parent property
  let testProperty = await Property.findOne();
  if (!testProperty) {
    testProperty = await Property.create({
      title: "Royal Palms Township Test",
      slug: `royal-palms-test-${Date.now()}`,
      shortDescription: "Plotted development test",
      fullDescription: "Full description test",
      propertyType: "RESIDENTIAL_PLOT",
      inventoryMode: "PLOT_INVENTORY",
      locationId: new Types.ObjectId(),
      pricing: { currency: "INR", priceVisibility: "PUBLIC_STARTING_FROM", startingPricePaise: 500000000 },
      area: { minimumAreaSqFt: 1800, maximumAreaSqFt: 3600, displayUnitPreference: "SQ_YD" },
      rera: { status: "VERIFIED" },
    });
  }

  const propId = testProperty._id.toString();

  // ── TEST 1: Deterministic Key Generation & Duplicate Prevention ────────────
  console.log("\n[TEST 1] Testing Inventory Key Generation & Uniqueness...");
  const key1 = InventoryService.generateInventoryKey({
    propertyId: propId,
    phaseName: "Phase 1",
    towerBlockSector: "Sector A",
    floorLevel: "",
    unitNumber: "Plot 101",
  });

  const key2 = InventoryService.generateInventoryKey({
    propertyId: propId,
    phaseName: "phase 1",
    towerBlockSector: "sector-a",
    floorLevel: "",
    unitNumber: "plot 101",
  });

  if (key1 !== key2) {
    throw new Error(`FAIL: Normalized keys must match. Expected ${key1}, got ${key2}`);
  }
  console.log("✓ Normalized inventory key generated:", key1);

  // ── TEST 2: Unit Creation with Initial History & Version 1 ──────────────────
  console.log("\n[TEST 2] Testing Concurrency-Safe Unit Creation...");
  const randomPlotNum = `TEST-PLT-${Date.now()}`;
  const createdUnit = await InventoryService.createUnit(
    {
      propertyId: propId,
      phaseName: "Phase 1",
      towerBlockSector: "Sector A",
      unitNumber: randomPlotNum,
      unitCategory: "RESIDENTIAL_PLOT",
      configuration: "PLOT",
      plotAreaSqFt: 2250,
      basePricePaise: 650000000, // ₹65 Lakhs
      status: "AVAILABLE",
      visibility: "PUBLIC_DETAIL",
      facing: "NORTH_EAST",
      cornerUnit: true,
    },
    mockAdminSession
  );

  if (!createdUnit._id || createdUnit.version !== 1) {
    throw new Error("FAIL: Unit creation did not initialize version 1.");
  }
  console.log("✓ Created unit:", createdUnit.unitNumber, `(${createdUnit.referenceCode})`, "Version:", createdUnit.version);

  // Verify status history entry was created
  const initStatusHistory = await InventoryStatusHistory.findOne({ unitId: createdUnit._id });
  if (!initStatusHistory || initStatusHistory.toStatus !== "AVAILABLE") {
    throw new Error("FAIL: Initial status history was not recorded.");
  }
  console.log("✓ Initial status history logged:", `${initStatusHistory.fromStatus} → ${initStatusHistory.toStatus}`);

  // ── TEST 3: Status Transition Policy Validation ─────────────────────────────
  console.log("\n[TEST 3] Testing Central Status Transition Policy...");
  if (!isValidStatusTransition("AVAILABLE", "ON_HOLD")) {
    throw new Error("FAIL: AVAILABLE → ON_HOLD must be allowed.");
  }
  if (isValidStatusTransition("DRAFT", "SOLD")) {
    throw new Error("FAIL: Direct DRAFT → SOLD jump must be rejected.");
  }
  console.log("✓ Transition matrix validated (Valid transitions passed, illegal jumps blocked).");

  // Perform transition to ON_HOLD
  const transitioned = await InventoryService.transitionStatus({
    unitId: createdUnit._id.toString(),
    toStatus: "ON_HOLD",
    currentVersion: createdUnit.version,
    reasonCode: "CLIENT_TOKEN_HOLD",
    comment: "Client requested 24h review hold",
    session: mockAdminSession,
  });

  if (transitioned.status !== "ON_HOLD" || transitioned.version !== 2) {
    throw new Error("FAIL: Status transition did not advance version to 2.");
  }
  console.log("✓ Transitioned unit to ON_HOLD. New version:", transitioned.version);

  // ── TEST 4: Optimistic Concurrency Conflict Detection ──────────────────────
  console.log("\n[TEST 4] Testing Optimistic Concurrency Conflict Protection...");
  let conflictCaught = false;
  try {
    // Attempt to update with stale version 1
    await InventoryService.transitionStatus({
      unitId: createdUnit._id.toString(),
      toStatus: "BLOCKED",
      currentVersion: 1, // Stale version! Current is 2
      reasonCode: "STALE_UPDATE",
      session: mockAdminSession,
    });
  } catch (err: any) {
    if (err.message.includes("CONFLICT")) {
      conflictCaught = true;
    }
  }

  if (!conflictCaught) {
    throw new Error("FAIL: Stale version update must fail with a CONFLICT error.");
  }
  console.log("✓ Optimistic concurrency successfully rejected stale mutation with CONFLICT error.");

  // ── TEST 5: Safe Money & Rupee Conversions ──────────────────────────────────
  console.log("\n[TEST 5] Testing Safe Money Handling in Paise...");
  if (createdUnit.basePricePaise !== 650000000 || createdUnit.basePriceRupees !== 6500000) {
    throw new Error("FAIL: Price conversion mismatch between paise and rupees.");
  }
  console.log("✓ Price verified:", `₹${createdUnit.basePriceRupees?.toLocaleString("en-IN")}`, `(${createdUnit.basePricePaise} paise)`);

  // ── TEST 6: Availability Aggregation & Matrix ──────────────────────────────
  console.log("\n[TEST 6] Testing Inventory Availability Summaries...");
  const summaries = await InventoryService.getAvailabilitySummary(propId);
  if (!summaries || summaries.length === 0) {
    throw new Error("FAIL: Availability summary returned empty.");
  }
  console.log("✓ Availability Summary computed:", {
    totalUnits: summaries[0].totalUnits,
    available: summaries[0].availableCount,
    onHold: summaries[0].onHoldCount,
  });

  // ── TEST 7: CSV Formula Injection Protection ───────────────────────────────
  console.log("\n[TEST 7] Testing CSV Formula Injection Sanitization...");
  const dangerousCells = ["=2+5", "+cmd|' /C calc'!A0", "-3*4", "@SUM(A1:A5)", "\tmalicious_tab"];
  for (const cell of dangerousCells) {
    const sanitized = InventoryImportService.sanitizeCsvCell(cell);
    if (!sanitized.startsWith("'") && !sanitized.startsWith('"\'')) {
      throw new Error(`FAIL: Formula prefix not escaped in: ${cell} -> ${sanitized}`);
    }
  }
  console.log("✓ Successfully escaped all CSV formula injection attack vectors.");

  // ── TEST 8: Data Quality Scanner ───────────────────────────────────────────
  console.log("\n[TEST 8] Testing Inventory Data Quality Scanner...");
  const dq = await InventoryService.scanDataQuality();
  if (dq.overallScore < 0 || dq.overallScore > 100) {
    throw new Error("FAIL: Data quality score out of bounds.");
  }
  console.log(`✓ Data Quality Scanned: Score ${dq.overallScore}/100, Issues Detected: ${dq.totalIssuesCount}`);

  console.log("\n================================================================================");
  console.log("✅ ALL PRD 13 AUTOMATED INVENTORY TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");

  process.exit(0);
}

runTests().catch((err) => {
  console.error("\n❌ PRD 13 TEST SUITE FAILED:", err);
  process.exit(1);
});
