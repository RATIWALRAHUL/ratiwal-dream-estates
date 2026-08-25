import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

// Load environment variables from .env.local if present
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

async function runModelTests() {
  console.log("\n========================================================");
  console.log(" Ratiwal Dream Estates — PRD 2 Database Models Test Suite");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Data Utilities Tests
  console.log("\n--- [1] Currency & Monetary Utilities ---");
  const { rupeesToPaise, paiseToRupees, isValidPaise, formatPaiseToRupeeString } = await import(
    "../src/lib/utils/currency"
  );

  assert(rupeesToPaise(100) === 10000, "rupeesToPaise converts 100 INR to 10,000 paise");
  assert(paiseToRupees(285000000) === 2850000, "paiseToRupees converts 28.5L paise to 28,50,000 INR");
  assert(isValidPaise(50000), "isValidPaise accepts non-negative safe integer");
  assert(!isValidPaise(-100), "isValidPaise rejects negative values");
  assert(!isValidPaise(12.5), "isValidPaise rejects floating point paise");
  assert(!isValidPaise(NaN), "isValidPaise rejects NaN");
  assert(formatPaiseToRupeeString(285000000) === "₹28.5 Lakhs", "formatPaiseToRupeeString formats 28.5 Lakhs correctly");
  assert(formatPaiseToRupeeString(1500000000) === "₹1.5 Cr", "formatPaiseToRupeeString formats 1.5 Cr correctly");
  assert(formatPaiseToRupeeString(15000000000) === "₹15 Cr", "formatPaiseToRupeeString formats 15 Cr correctly");

  console.log("\n--- [2] Area Conversion Utilities ---");
  const { sqYardsToSqFt, sqFtToSqYards, isValidArea } = await import("../src/lib/utils/area");

  assert(sqYardsToSqFt(100) === 900, "sqYardsToSqFt converts 100 sq yds to 900 sq ft");
  assert(sqFtToSqYards(900) === 100, "sqFtToSqYards converts 900 sq ft to 100 sq yds");
  assert(isValidArea(150.5), "isValidArea accepts positive floats");
  assert(!isValidArea(0), "isValidArea rejects zero");
  assert(!isValidArea(-10), "isValidArea rejects negative area");

  console.log("\n--- [3] Slug & URL Utilities ---");
  const { normalizeSlug } = await import("../src/lib/utils/slug");
  const { isValidHttpUrl } = await import("../src/lib/utils/url");
  const { normalizeMongoDuplicateError } = await import("../src/lib/utils/mongo-errors");

  assert(normalizeSlug("Royal Palms — Ajmer Road (Jaipur)") === "royal-palms-ajmer-road-jaipur", "normalizeSlug produces lowercase kebab-case slug");
  assert(normalizeSlug("  Special---Plot__Sector  ") === "special-plot-sector", "normalizeSlug collapses repeated hyphens and underscores");
  assert(isValidHttpUrl("https://ratiwaldreamestates.com"), "isValidHttpUrl accepts HTTPS URL");
  assert(!isValidHttpUrl("javascript:alert(1)"), "isValidHttpUrl rejects unsafe protocols");

  const mockMongoErr = { code: 11000, keyValue: { slug: "jaipur" } };
  const normalizedErr = normalizeMongoDuplicateError(mockMongoErr);
  assert(normalizedErr.isDuplicate && normalizedErr.field === "slug", "normalizeMongoDuplicateError extracts duplicate field");

  // 2. Database Connection
  console.log("\n--- [4] Database Connection & Setup ---");
  const { connectToDatabase, disconnectFromDatabase } = await import("../src/lib/db/mongoose");
  await connectToDatabase();
  console.log(" Connected to MongoDB cluster.");

  const { Location } = await import("../src/models/Location");
  const { Property } = await import("../src/models/Property");
  const { PlotOption } = await import("../src/models/PlotOption");

  // Ensure database indexes are built before duplicate testing
  await Location.init();
  await Property.init();
  await PlotOption.init();

  // 3. Location Model Tests
  console.log("\n--- [5] Location Model Validation & Persistence ---");
  const testLocSlug = `test-loc-${Date.now()}`;

  const validLoc = new Location({
    name: "Test Location Jaipur",
    slug: testLocSlug,
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    shortDescription: "A premier test investment corridor.",
    publicationStatus: "PUBLISHED",
    lastVerifiedAt: new Date(),
    seo: {
      metaTitle: "Test Location | Ratiwal Dream Estates",
      metaDescription: "Test location meta description for testing.",
    },
  });

  await validLoc.save();
  assert(Boolean(validLoc._id), "Location document created successfully");
  assert(Boolean(validLoc.publishedAt), "Location publishedAt automatically populated on publication");

  // Test duplicate slug on Location
  try {
    const dupLoc = new Location({
      name: "Another Location",
      slug: testLocSlug,
      city: "Jaipur",
      state: "Rajasthan",
      shortDescription: "Duplicate test",
      seo: { metaTitle: "Dup", metaDescription: "Dup" },
    });
    await dupLoc.save();
    assert(false, "Duplicate location slug should throw E11000 error");
  } catch (err) {
    const dupCheck = normalizeMongoDuplicateError(err);
    assert(dupCheck.isDuplicate, "Duplicate location slug rejected by database unique index");
  }

  // Soft archive test
  validLoc.publicationStatus = "ARCHIVED";
  await validLoc.save();
  assert(Boolean(validLoc.archivedAt), "Location archivedAt populated on soft archive");

  // 4. Property Model Tests
  console.log("\n--- [6] Property Model Validation, Invariants & Subdocuments ---");
  const testPropSlug = `test-prop-${Date.now()}`;

  const validProp = new Property({
    title: "Royal Test Township",
    slug: testPropSlug,
    shortDescription: "JDA-approved plotted development for testing.",
    fullDescription: "Detailed description of test property.",
    propertyType: "RESIDENTIAL_PLOT",
    listingStatus: "AVAILABLE",
    publicationStatus: "DRAFT",
    verificationStatus: "VERIFIED",
    locationId: validLoc._id,
    pricing: {
      currency: "INR",
      priceVisibility: "PUBLIC",
      startingPricePaise: 285000000,
      ratePaisePerSqFt: 300000,
    },
    area: {
      minimumAreaSqFt: 900,
      maximumAreaSqFt: 2700,
      displayUnitPreference: "SQ_YD",
    },
    rera: {
      applicable: true,
      registrationNumber: "RAJ/P/2024/9999",
      authorityName: "RajRERA",
      status: "VERIFIED",
      lastVerifiedAt: new Date(),
    },
    media: [
      {
        type: "IMAGE",
        url: "https://ratiwaldreamestates.com/images/test.jpg",
        altText: "Township primary entrance view",
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    lastVerifiedAt: new Date(),
    seo: {
      metaTitle: "Royal Test Township | Ratiwal Dream Estates",
      metaDescription: "Test property meta description",
    },
  });

  await validProp.save();
  assert(Boolean(validProp._id), "Property created with embedded subdocuments");
  assert(validProp.minimumAreaSqYd === 100, "Virtual minimumAreaSqYd returns 100 sq yds for 900 sq ft");
  assert(validProp.maximumAreaSqYd === 300, "Virtual maximumAreaSqYd returns 300 sq yds for 2700 sq ft");
  assert(validProp.startingPriceRupees === 2850000, "Virtual startingPriceRupees returns 28,50,000 INR");

  // Invariant Test: Negative price rejection
  try {
    const invalidPriceProp = new Property({
      ...validProp.toObject(),
      _id: undefined,
      slug: `test-neg-price-${Date.now()}`,
      pricing: {
        currency: "INR",
        priceVisibility: "PUBLIC",
        startingPricePaise: -5000,
      },
    });
    await invalidPriceProp.validate();
    assert(false, "Negative startingPricePaise should fail validation");
  } catch (err) {
    assert(true, "Negative price rejected by schema validation");
  }

  // Invariant Test: Area min > max rejection
  try {
    const invalidAreaProp = new Property({
      ...validProp.toObject(),
      _id: undefined,
      slug: `test-inv-area-${Date.now()}`,
      area: {
        minimumAreaSqFt: 2500,
        maximumAreaSqFt: 1000, // Invalid: max < min
      },
    });
    await invalidAreaProp.validate();
    assert(false, "Max area < Min area should fail validation");
  } catch (err) {
    assert(true, "Maximum area smaller than minimum area rejected");
  }

  // Invariant Test: Multiple primary images rejection
  try {
    const multiPrimaryProp = new Property({
      ...validProp.toObject(),
      _id: undefined,
      slug: `test-multi-primary-${Date.now()}`,
      media: [
        { type: "IMAGE", url: "https://example.com/1.jpg", altText: "Img 1", isPrimary: true },
        { type: "IMAGE", url: "https://example.com/2.jpg", altText: "Img 2", isPrimary: true },
      ],
    });
    await multiPrimaryProp.validate();
    assert(false, "Multiple primary images should fail validation");
  } catch (err) {
    assert(true, "Multiple primary images rejected by validation hook");
  }

  // Invariant Test: RERA verified without registration number rejection
  try {
    const invalidReraProp = new Property({
      ...validProp.toObject(),
      _id: undefined,
      slug: `test-inv-rera-${Date.now()}`,
      rera: {
        applicable: true,
        status: "VERIFIED",
        registrationNumber: "", // Missing registration number!
      },
    });
    await invalidReraProp.validate();
    assert(false, "Verified RERA without registration number should fail validation");
  } catch (err) {
    assert(true, "Verified RERA without registration number rejected");
  }

  // 5. PlotOption Model Tests
  console.log("\n--- [7] PlotOption Model & Compound Indexes ---");
  const plot1 = new PlotOption({
    propertyId: validProp._id,
    plotNumber: "A-101",
    label: "Corner Villa Plot 111 Sq Yd",
    areaSqFt: 999,
    basePricePaise: 300000000,
    cornerPlot: true,
    status: "AVAILABLE",
    sortOrder: 1,
  });

  await plot1.save();
  assert(Boolean(plot1._id), "PlotOption created and linked to Property");
  assert(plot1.areaSqYd === 111, "PlotOption virtual areaSqYd calculates 111 sq yds");
  assert(plot1.basePriceRupees === 3000000, "PlotOption virtual basePriceRupees calculates 30,00,000 INR");

  // Duplicate plotNumber on SAME property should fail
  try {
    const dupPlot = new PlotOption({
      propertyId: validProp._id,
      plotNumber: "A-101",
      areaSqFt: 999,
      status: "AVAILABLE",
    });
    await dupPlot.save();
    assert(false, "Duplicate plotNumber on same property should throw duplicate key error");
  } catch (err) {
    const dupCheck = normalizeMongoDuplicateError(err);
    assert(dupCheck.isDuplicate, "Duplicate plotNumber on same property rejected by compound unique index");
  }

  // Same plotNumber on a DIFFERENT property should SUCCEED
  const anotherProp = new Property({
    ...validProp.toObject(),
    _id: new mongoose.Types.ObjectId(),
    slug: `test-prop-2-${Date.now()}`,
  });
  await anotherProp.save();

  const plotOnOtherProp = new PlotOption({
    propertyId: anotherProp._id,
    plotNumber: "A-101", // Same plot number, different property
    areaSqFt: 999,
    status: "AVAILABLE",
  });
  await plotOnOtherProp.save();
  assert(Boolean(plotOnOtherProp._id), "Same plotNumber on different property permitted");

  // Clean up test documents
  await PlotOption.deleteMany({ _id: { $in: [plot1._id, plotOnOtherProp._id] } });
  await Property.deleteMany({ _id: { $in: [validProp._id, anotherProp._id] } });
  await Location.deleteOne({ _id: validLoc._id });
  console.log(" Test documents cleaned up.");

  // 6. Migration Dry-Run Test
  console.log("\n--- [8] Catalog Migration Dry-Run Test ---");
  const { seedCatalog } = await import("../src/lib/db/migrations/seed-catalog");
  const migrationReport = await seedCatalog(true);
  assert(migrationReport.dryRun === true, "seedCatalog correctly executes in dry-run mode");
  assert(migrationReport.locations.total > 0, `seedCatalog identifies ${migrationReport.locations.total} static locations`);
  assert(migrationReport.properties.total > 0, `seedCatalog identifies ${migrationReport.properties.total} static properties`);

  // 7. Index Inspection Test
  console.log("\n--- [9] Schema Index Definitions ---");
  const { inspectIndexes } = await import("../src/lib/db/indexes");
  const indexResults = await inspectIndexes();
  assert(indexResults.length === 3, "inspectIndexes returns index metadata for Location, Property, and PlotOption");
  const locIndexes = indexResults.find((r) => r.modelName === "Location");
  assert(Boolean(locIndexes?.definedIndexes.some((idx) => typeof idx.fields === "object" && idx.fields && "slug" in idx.fields)), "Location defines unique index on slug");

  await disconnectFromDatabase();

  console.log("\n========================================================");
  console.log(` Summary: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runModelTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
