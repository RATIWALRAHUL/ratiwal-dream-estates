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
import { Types } from "mongoose";
import { connectToDatabase, disconnectFromDatabase } from "../src/lib/db/mongoose";
import { Location } from "../src/models/Location";
import { Property } from "../src/models/Property";
import { PlotOption } from "../src/models/PlotOption";
import { AuditLog } from "../src/models/AuditLog";
import {
  createPropertyDraftAction,
  updatePropertyAction,
  submitPropertyForReviewAction,
  returnPropertyToDraftAction,
  publishPropertyAction,
  archivePropertyAction,
  restorePropertyToDraftAction,
  changePublishedSlugAction,
} from "../src/lib/actions/property.actions";
import {
  createPlotOptionAction,
  updatePlotOptionAction,
  changePlotOptionStatusAction,
  removePlotOptionAction,
} from "../src/lib/actions/inventory.actions";
import { validatePublishingChecklist } from "../src/lib/services/property-editor.service";
import { createSessionToken } from "../src/lib/auth/session";

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
  console.log(" Ratiwal Dream Estates — PRD 4 Property CRUD Test Suite");
  console.log("========================================================\n");

  await connectToDatabase();
  console.log(" Connected to MongoDB cluster.\n");

  let testLocationId = "";
  let createdPropertyId = "";
  let createdPlotId = "";

  // 1. Setup Active Test Location & Cleanup Stale Test Data
  console.log("--- [1] Test Environment & Location Discovery ---");
  try {
    // Cleanup any lingering documents from previous interrupted runs
    const staleProps = await Property.find({ slug: { $regex: /^crud-test-township/ } });
    for (const p of staleProps) {
      await PlotOption.deleteMany({ propertyId: p._id });
      await AuditLog.deleteMany({ targetPropertyId: p._id });
      await Property.findByIdAndDelete(p._id);
    }

    let loc = await Location.findOne({ slug: "jaipur" });
    if (!loc) {
      loc = await Location.create({
        name: "Jaipur Central Corridor",
        slug: "jaipur-central-crud-test",
        city: "Jaipur",
        state: "Rajasthan",
        shortDescription: "Test corridor for CRUD validation",
        publicationStatus: "PUBLISHED",
      });
    }
    testLocationId = loc._id.toString();
    pass("Test location resolved and stale test data cleaned: " + loc.name);
  } catch (err) {
    fail("Test location resolution", err);
  }

  // 2. Property Draft Creation
  console.log("\n--- [2] Property Draft Creation & Validation ---");
  try {
    const res = await createPropertyDraftAction({
      title: "CRUD Test Township — Golden Mile",
      slug: "crud-test-township-golden-mile",
      locationId: testLocationId,
      propertyType: "RESIDENTIAL_PLOT",
      shortDescription: "Exclusive 100-300 sq yd residential plots on 60ft arterial road.",
      listingStatus: "AVAILABLE",
    });

    if (!res.success) {
      console.log("Draft creation failure result:", res);
    }
    assert(res.success === true, "createPropertyDraftAction succeeds");
    assert(res.data?.propertyId, "Property ID returned on creation");
    createdPropertyId = res.data!.propertyId;

    const property = await Property.findById(createdPropertyId);
    assert(property !== null, "Property document exists in database");
    assert(property.publicationStatus === "DRAFT", "New property is set to DRAFT status");
    assert(property.__v === 0, "Initial document version is 0");
    pass("Property draft created in DRAFT status with version 0");

    // Test duplicate slug handling
    const dupRes = await createPropertyDraftAction({
      title: "CRUD Test Township Duplicate",
      slug: "crud-test-township-golden-mile",
      locationId: testLocationId,
      propertyType: "RESIDENTIAL_PLOT",
      shortDescription: "Another short description for duplicate test",
      listingStatus: "AVAILABLE",
    });

    assert(dupRes.success === true, "Duplicate slug handled gracefully with suffix");
    assert(dupRes.data?.slug !== "crud-test-township-golden-mile", "Unique slug suffix appended");
    if (dupRes.data?.propertyId) {
      await Property.findByIdAndDelete(dupRes.data.propertyId);
    }
    pass("Duplicate slug candidate collision automatically suffixed");
  } catch (err) {
    fail("Property Draft Creation", err);
  }

  // 3. Optimistic Concurrency Control
  console.log("\n--- [3] Optimistic Concurrency & Document Versioning ---");
  try {
    // 3.1 Attempt update with stale version
    const staleRes = await updatePropertyAction(createdPropertyId, {
      expectedVersion: 999, // Stale version
      title: "CRUD Test Township — Golden Mile (Updated)",
      slug: "crud-test-township-golden-mile",
      locationId: testLocationId,
      propertyType: "RESIDENTIAL_PLOT",
      listingStatus: "AVAILABLE",
      featured: false,
      sortOrder: 0,
      sourceType: "INTERNAL",
      shortDescription: "Updated short description for concurrency test.",
      highlights: ["60ft wide road", "Underground cabling"],
      amenities: ["Gated security", "LED streetlights"],
      pricingType: "STARTING_FROM",
      startingPricePaise: 300000000,
      maximumPricePaise: 900000000,
      ratePerSqYdPaise: 3000000,
      priceVisibility: "PUBLIC",
      minimumAreaSqFt: 900,
      maximumAreaSqFt: 2700,
      displayPreference: "BOTH",
      infrastructureMilestones: [],
      connectivityMilestones: [],
      media: [],
      documents: [],
      rera: { isApplicable: true, reraStatus: "REGISTERED" },
      verificationStatus: "UNDER_REVIEW",
      seo: { noIndex: false, noFollow: false },
    });

    assert(staleRes.success === false, "Stale update rejected");
    assert(staleRes.code === "CONFLICT", "Conflict code returned on version mismatch");
    pass("Stale edit rejected with CONFLICT code");

    // 3.2 Update with correct version
    const validRes = await updatePropertyAction(createdPropertyId, {
      expectedVersion: 0,
      title: "CRUD Test Township — Golden Mile (Valid Edit)",
      slug: "crud-test-township-golden-mile",
      locationId: testLocationId,
      propertyType: "RESIDENTIAL_PLOT",
      listingStatus: "AVAILABLE",
      featured: false,
      sortOrder: 0,
      sourceType: "INTERNAL",
      shortDescription: "Updated short description with valid version.",
      highlights: ["60ft wide road", "Underground cabling"],
      amenities: ["Gated security", "LED streetlights"],
      pricingType: "STARTING_FROM",
      startingPricePaise: 300000000,
      maximumPricePaise: 900000000,
      ratePerSqYdPaise: 3000000,
      priceVisibility: "PUBLIC",
      minimumAreaSqFt: 900,
      maximumAreaSqFt: 2700,
      displayPreference: "BOTH",
      infrastructureMilestones: [],
      connectivityMilestones: [],
      media: [
        {
          url: "/images/properties/crud-hero.jpg",
          altText: "Hero elevation",
          isPrimary: true,
          publicationStatus: "PUBLISHED",
          sortOrder: 0,
        },
      ],
      documents: [],
      rera: {
        isApplicable: true,
        registrationNumber: "RAJ/P/2024/9999",
        authorityName: "Rajasthan RERA",
        reraStatus: "REGISTERED",
      },
      verificationStatus: "VERIFIED",
      seo: { noIndex: false, noFollow: false },
    });

    if (!validRes.success) {
      console.log("Valid update error:", validRes);
    }
    assert(validRes.success === true, "Valid update succeeds");
    assert(validRes.data?.version === 1, "Document version incremented to 1");
    pass("Update with expectedVersion: 0 increments version to 1");
  } catch (err) {
    fail("Optimistic Concurrency", err);
  }

  // 4. Plot Inventory Management & Compound Uniqueness
  console.log("\n--- [4] Plot Inventory Subsystem ---");
  try {
    // 4.1 Create plot option
    const plotRes = await createPlotOptionAction(createdPropertyId, {
      plotNumber: "A-101",
      label: "Corner Plot Park Facing",
      areaSqFt: 1800,
      dimensions: { widthFt: 30, lengthFt: 60 },
      facing: "NORTH_EAST",
      isCorner: true,
      basePricePaise: 600000000,
      ratePerSqYdPaise: 3000000,
      status: "AVAILABLE",
      publicVisibility: true,
      sortOrder: 1,
    });

    assert(plotRes.success === true, "createPlotOptionAction succeeds");
    assert(plotRes.data?.plotId, "Plot ID returned");
    createdPlotId = plotRes.data!.plotId;
    pass("Plot Option A-101 created");

    // 4.2 Rejection of duplicate plotNumber inside same property
    const dupPlotRes = await createPlotOptionAction(createdPropertyId, {
      plotNumber: "A-101",
      areaSqFt: 1800,
      facing: "EAST",
      isCorner: false,
      status: "AVAILABLE",
      publicVisibility: true,
      sortOrder: 2,
    });

    assert(dupPlotRes.success === false, "Duplicate plot number in same property rejected");
    assert(dupPlotRes.code === "DUPLICATE_PLOT_NUMBER", "DUPLICATE_PLOT_NUMBER error code returned");
    pass("Duplicate plotNumber inside same property rejected");

    // 4.3 Quick status change
    const statusRes = await changePlotOptionStatusAction(createdPropertyId, createdPlotId, "RESERVED");
    assert(statusRes.success === true, "changePlotOptionStatusAction succeeds");
    const updatedPlot = await PlotOption.findById(createdPlotId);
    assert(updatedPlot?.status === "RESERVED", "Plot status updated to RESERVED in database");
    pass("Plot status changed from AVAILABLE to RESERVED");

    // 4.4 Soft remove plot (sets UNAVAILABLE)
    const removeRes = await removePlotOptionAction(createdPropertyId, createdPlotId);
    assert(removeRes.success === true, "removePlotOptionAction succeeds");
    const archivedPlot = await PlotOption.findById(createdPlotId);
    assert(archivedPlot?.status === "UNAVAILABLE", "Plot status set to UNAVAILABLE (no hard delete)");
    pass("Plot soft-removed as UNAVAILABLE without hard delete");
  } catch (err) {
    fail("Plot Inventory Management", err);
  }

  // 5. Lifecycle Transitions (DRAFT -> REVIEW -> DRAFT -> REVIEW -> PUBLISHED -> ARCHIVED -> DRAFT)
  console.log("\n--- [5] Property Lifecycle State Machine ---");
  try {
    // 5.1 Submit for Review (DRAFT -> REVIEW)
    const submitRes = await submitPropertyForReviewAction(createdPropertyId, 1);
    if (!submitRes.success) {
      console.log("Submit for review error:", submitRes);
    }
    assert(submitRes.success === true, "submitPropertyForReviewAction succeeds");
    let prop = await Property.findById(createdPropertyId);
    assert(prop?.publicationStatus === "REVIEW", "Property status is now REVIEW");
    pass("State Transition: DRAFT -> REVIEW");

    // 5.2 Return to Draft with Reason (REVIEW -> DRAFT)
    const returnRes = await returnPropertyToDraftAction(
      createdPropertyId,
      "Please upload high resolution masterplan and verify pricing notes.",
      2
    );
    assert(returnRes.success === true, "returnPropertyToDraftAction succeeds");
    prop = await Property.findById(createdPropertyId);
    assert(prop?.publicationStatus === "DRAFT", "Property status is now back to DRAFT");
    pass("State Transition: REVIEW -> DRAFT (with return reason)");

    // 5.3 Re-submit for Review
    await submitPropertyForReviewAction(createdPropertyId, 3);
    pass("Re-submitted for review (DRAFT -> REVIEW)");

    // 5.4 Pre-flight Checklist Evaluation
    const checklist = await validatePublishingChecklist(createdPropertyId);
    assert(typeof checklist.canPublish === "boolean", "Checklist returns boolean canPublish");
    assert(checklist.blocking.length === 0, "No blocking issues remain for valid property");
    pass("Publishing Pre-flight checklist passes with 0 blocking issues");

    // 5.5 Publish Property (REVIEW -> PUBLISHED)
    let currentProp = await Property.findById(createdPropertyId);
    const pubRes = await publishPropertyAction(createdPropertyId, currentProp?.__v);
    if (!pubRes.success) {
      console.log("Publish error:", pubRes);
    }
    assert(pubRes.success === true, "publishPropertyAction succeeds");
    prop = await Property.findById(createdPropertyId);
    assert(prop?.publicationStatus === "PUBLISHED", "Property status is now PUBLISHED");
    assert(prop?.publishedAt !== undefined, "publishedAt timestamp populated");
    pass("State Transition: REVIEW -> PUBLISHED");

    // 5.6 Super Admin Change Published Slug
    currentProp = await Property.findById(createdPropertyId);
    const slugRes = await changePublishedSlugAction(
      createdPropertyId,
      "crud-test-township-golden-mile-v2",
      "Corridor rebranding approved by corporate governance",
      currentProp?.__v
    );
    assert(slugRes.success === true, "changePublishedSlugAction succeeds");
    prop = await Property.findById(createdPropertyId);
    assert(prop?.slug === "crud-test-township-golden-mile-v2", "Published slug updated");
    pass("Super Admin changed published property slug with reason");

    // 5.7 Archive Property (PUBLISHED -> ARCHIVED)
    currentProp = await Property.findById(createdPropertyId);
    const archiveRes = await archivePropertyAction(
      createdPropertyId,
      "All inventory allocated and development completed.",
      currentProp?.__v
    );
    assert(archiveRes.success === true, "archivePropertyAction succeeds");
    prop = await Property.findById(createdPropertyId);
    assert(prop?.publicationStatus === "ARCHIVED", "Property status is now ARCHIVED");
    assert(prop?.archivedAt !== undefined, "archivedAt timestamp populated");
    pass("State Transition: PUBLISHED -> ARCHIVED");

    // 5.8 Restore Archived Property (ARCHIVED -> DRAFT)
    currentProp = await Property.findById(createdPropertyId);
    const restoreRes = await restorePropertyToDraftAction(createdPropertyId, currentProp?.__v);
    assert(restoreRes.success === true, "restorePropertyToDraftAction succeeds");
    prop = await Property.findById(createdPropertyId);
    assert(prop?.publicationStatus === "DRAFT", "Property restored to DRAFT status");
    pass("State Transition: ARCHIVED -> DRAFT");
  } catch (err) {
    fail("Property Lifecycle State Machine", err);
  }

  // 6. Audit Trail Logging Verification
  console.log("\n--- [6] Append-Only Audit Logging Verification ---");
  try {
    const auditLogs = await AuditLog.find({ targetPropertyId: new Types.ObjectId(createdPropertyId) }).sort({ timestamp: 1 });
    assert(auditLogs.length >= 6, "Audit trail captured multiple lifecycle events");

    const actions = auditLogs.map((l) => l.action);
    assert(actions.includes("PROPERTY_CREATED"), "Audit recorded PROPERTY_CREATED");
    assert(actions.includes("PROPERTY_UPDATED"), "Audit recorded PROPERTY_UPDATED");
    assert(actions.includes("PROPERTY_SUBMITTED_FOR_REVIEW"), "Audit recorded PROPERTY_SUBMITTED_FOR_REVIEW");
    assert(actions.includes("PROPERTY_RETURNED_TO_DRAFT"), "Audit recorded PROPERTY_RETURNED_TO_DRAFT");
    assert(actions.includes("PROPERTY_PUBLISHED"), "Audit recorded PROPERTY_PUBLISHED");
    assert(actions.includes("PROPERTY_ARCHIVED"), "Audit recorded PROPERTY_ARCHIVED");
    assert(actions.includes("PROPERTY_RESTORED"), "Audit recorded PROPERTY_RESTORED");
    pass("AuditLog collection contains complete chronological audit history");
  } catch (err) {
    fail("Audit Trail Verification", err);
  }

  // Cleanup Test Documents
  if (createdPropertyId) {
    await Property.findByIdAndDelete(createdPropertyId);
    await PlotOption.deleteMany({ propertyId: new Types.ObjectId(createdPropertyId) });
    await AuditLog.deleteMany({ targetPropertyId: new Types.ObjectId(createdPropertyId) });
  }

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
