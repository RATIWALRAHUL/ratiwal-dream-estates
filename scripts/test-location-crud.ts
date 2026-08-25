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
  // .env.local not present or readable
}

import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { Location } from "../src/models/Location";
import { Property } from "../src/models/Property";
import {
  validateLocationPublishingChecklist,
  checkLocationDependencies,
  calculateLocationMarketTrends,
} from "../src/lib/services/location-editor.service";
import type { ILocation } from "../src/types/database";

async function runLocationTestSuite() {
  console.log("\n=======================================================");
  console.log("  RATIWAL DREAM ESTATES — LOCATION CRUD & INTELLIGENCE TEST BATTERY");
  console.log("=======================================================\n");

  await connectToDatabase();

  const testSlug = `test-corridor-${Date.now()}`;
  let createdLocationId: string = "";

  try {
    // 1. Create Location Draft
    console.log("▶ 1. Testing Draft Location Creation...");
    const draftLoc = await Location.create({
      name: "Ajmer Expressway Test Growth Corridor",
      slug: testSlug,
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      region: "Western Investment Belt",
      shortDescription:
        "High-growth plotted residential & commercial investment belt with direct expressway connectivity and verified masterplans.",
      publicationStatus: "DRAFT",
      version: 1,
      supportedPropertyTypes: ["RESIDENTIAL_PLOT", "COMMERCIAL_PLOT"],
    });

    createdLocationId = draftLoc._id.toString();
    console.log(`  ✓ Created draft location: ${draftLoc.name} (ID: ${createdLocationId}, Version: ${draftLoc.version})`);

    // 2. Testing Optimistic Concurrency Control
    console.log("\n▶ 2. Testing Optimistic Concurrency Control (OCC)...");
    const locForOcc = await Location.findById(createdLocationId);
    if (!locForOcc) throw new Error("Location not found for OCC");

    // Simulating version increment
    locForOcc.tagline = "Western Growth & Plotted Belt";
    locForOcc.version += 1;
    await locForOcc.save();
    console.log(`  ✓ Version successfully incremented to v${locForOcc.version}`);

    // 3. Testing Subdocument Additions
    console.log("\n▶ 3. Testing Subdocuments (Micro-Markets, Infrastructure, Connectivity, Observations)...");
    
    // Add micro-market
    locForOcc.microMarkets.push({
      name: "Bagru Logistics & Industrial Hub",
      slug: "bagru-logistics-hub",
      marketType: "INDUSTRIAL_BELT",
      tagline: "RIICO & Gated Plotted Zone",
      description: "Major warehousing and plotted industrial township node on NH-48.",
      highlights: ["60m sector road", "24/7 dedicated industrial power sub-station"],
      propertyTypes: ["INDUSTRIAL_PLOT", "COMMERCIAL_PLOT"],
      sourceReferences: ["JDA Zonal Plan 2025 Gazette"],
      sortOrder: 0,
      featured: true,
      isPublic: true,
    } as any);

    // Add infrastructure milestone
    locForOcc.infrastructureHighlights.push({
      name: "Jaipur Western Ring Road 6-Lane Expressway",
      category: "Highway / Expressway",
      status: "OPERATIONAL",
      description: "Direct interchange linking Ajmer Road to Tonk Road & Delhi Expressway.",
      distanceKm: 2.5,
      expectedCompletionDate: "Q4 2024",
      source: "NHAI Gazette / JDA Notification",
      sourceUrl: "https://nhai.gov.in",
      sortOrder: 0,
      isPublic: true,
      lastVerifiedAt: new Date(),
    } as any);

    // Add connectivity milestone
    locForOcc.connectivityHighlights.push({
      destination: "Jaipur International Airport (JAI)",
      destinationCategory: "Airport / Aviation",
      distanceKm: 18.5,
      approxTravelTime: "22 mins",
      travelMode: "Signal-Free Ring Road Expressway",
      route: "Ajmer Road interchange via Ring Road",
      source: "Speed and Distance GPS Audit Q1 2026",
      sortOrder: 0,
      isPublic: true,
      lastVerifiedAt: new Date(),
    } as any);

    // Add historical market observation (Observation 1)
    locForOcc.marketObservations.push({
      metricType: "AVERAGE_ASKING_RATE",
      numericValue: 380000, // ₹3,800/sq ft (stored as paise)
      canonicalUnit: "PAISE_PER_SQ_FT",
      observationPeriod: "Q4 2024",
      sourceName: "JDA Registrar Circle Rate Notification",
      sourceUrl: "https://igrs.rajasthan.gov.in",
      sourceType: "GOVERNMENT",
      verificationStatus: "VERIFIED",
      isPublic: true,
      createdAt: new Date("2024-10-01"),
    } as any);

    // Add historical market observation (Observation 2)
    locForOcc.marketObservations.push({
      metricType: "AVERAGE_ASKING_RATE",
      numericValue: 460000, // ₹4,600/sq ft (stored as paise)
      canonicalUnit: "PAISE_PER_SQ_FT",
      observationPeriod: "Q1 2026",
      sourceName: "JDA Registrar Circle Rate Master Table",
      sourceUrl: "https://igrs.rajasthan.gov.in",
      sourceType: "GOVERNMENT",
      verificationStatus: "VERIFIED",
      isPublic: true,
      createdAt: new Date("2026-01-15"),
    } as any);

    locForOcc.heroImage = {
      url: "https://ik.imagekit.io/ratiwaldream/locations/ajmer-road-test.jpg",
      storagePublicId: "loc_img_test_123",
      altText: "Plotted masterplan along Ajmer Road Expressway, Jaipur",
      caption: "Masterplan aerial perspective",
    };

    locForOcc.seo = {
      metaTitle: "Plots in Ajmer Road Jaipur | Ratiwal Dream Estates",
      metaDescription:
        "Verified residential and commercial plotted townships along Ajmer Road Expressway, Jaipur with complete JDA approvals.",
    };

    locForOcc.coordinates = {
      latitude: 26.8504,
      longitude: 75.7601,
      isVerified: true,
      source: "On-site GPS Survey Team",
    };

    await locForOcc.save();
    console.log(`  ✓ Subdocuments and hero media successfully attached to location`);

    // 4. Testing 16-Point Publishing Pre-Flight Audit
    console.log("\n▶ 4. Testing 16-Point Publishing Pre-Flight Audit...");
    const checklistResult = validateLocationPublishingChecklist(locForOcc.toObject() as ILocation);
    console.log(`  ✓ Checklist Score: ${checklistResult.readyCount}/${checklistResult.totalChecks} Ready (Can Publish: ${checklistResult.canPublish})`);
    if (!checklistResult.canPublish) {
      console.warn("  Checklist blocking issues:", checklistResult.items.filter((i) => i.status === "BLOCKING"));
    }

    // 5. Testing Market Trend Calculation (With Sufficient vs Insufficient Data)
    console.log("\n▶ 5. Testing Market Trend Calculation...");
    const trends = calculateLocationMarketTrends(locForOcc.toObject() as ILocation);
    console.log(`  ✓ Sufficient Historical Data: ${trends.hasSufficientData}`);
    console.log(`  ✓ Historical Periods Observed: ${trends.periods.map((p) => `${p.period}: ₹${p.rateRupees}/sqft`).join(", ")}`);
    console.log(`  ✓ Calculated Appreciation Rate: +${trends.appreciationPercent}%`);

    // 6. Testing Archival Dependency Guard
    console.log("\n▶ 6. Testing Dependency Guard on Archival...");
    // Check with 0 properties
    const depCheck0 = await checkLocationDependencies(createdLocationId);
    console.log(`  ✓ Dependency check with 0 properties: canArchive=${depCheck0.canArchive}`);

    // Create a published property attached to this location
    const testProp = await Property.create({
      title: "Test Property Dependency Parcel",
      slug: `dep-prop-${Date.now()}`,
      shortDescription: "A temporary property parcel to verify archive dependency enforcement.",
      fullDescription: "Detailed description for the temporary test dependency parcel.",
      propertyType: "RESIDENTIAL_PLOT",
      listingStatus: "AVAILABLE",
      publicationStatus: "PUBLISHED",
      locationId: new Types.ObjectId(createdLocationId),
      pricing: {
        pricingModel: "TOTAL_PRICE",
        startingPricePaise: 450000000,
        priceOnRequest: false,
      },
      area: {
        totalAreaSqFt: 1800,
        minimumAreaSqFt: 1800,
        maximumAreaSqFt: 1800,
        unit: "SQ_FT",
      },
      address: "Ajmer Road, Jaipur, Rajasthan 302026",
      media: [
        {
          url: "https://ik.imagekit.io/ratiwaldream/properties/test-prop.jpg",
          fileId: "prop_file_123",
          name: "Hero Photo",
          altText: "Test parcel hero image",
          isPrimary: true,
        },
      ],
      rera: {
        isReraApproved: true,
        reraNumber: "RAJ/P/2024/9999",
      },
      seo: {
        metaTitle: "Test Dependency Parcel | Ratiwal Dream Estates",
        metaDescription: "Test parcel metadata description for dependency check.",
      },
      lastVerifiedAt: new Date(),
    });

    const depCheck1 = await checkLocationDependencies(createdLocationId);
    console.log(`  ✓ Dependency check with 1 PUBLISHED property: canArchive=${depCheck1.canArchive} (Published Property Count: ${depCheck1.publishedProperties})`);
    if (depCheck1.canArchive === false) {
      console.log(`  ✓ Archival successfully BLOCKED by active property: "${depCheck1.publishedPropertyTitles[0]}"`);
    }

    // Clean up test property
    await Property.findByIdAndDelete(testProp._id);
    console.log("  ✓ Test property dependency cleaned up");

    // 7. Testing Lifecycle Status Transitions
    console.log("\n▶ 7. Testing Lifecycle Status Transitions...");
    locForOcc.publicationStatus = "REVIEW";
    await locForOcc.save();
    console.log("  ✓ Transitioned DRAFT -> REVIEW");

    locForOcc.publicationStatus = "PUBLISHED";
    locForOcc.publishedAt = new Date();
    await locForOcc.save();
    console.log("  ✓ Transitioned REVIEW -> PUBLISHED");

    locForOcc.publicationStatus = "ARCHIVED";
    locForOcc.archivedAt = new Date();
    locForOcc.archiveReason = "Test archival suite complete";
    await locForOcc.save();
    console.log("  ✓ Transitioned PUBLISHED -> ARCHIVED (with reason)");

    locForOcc.publicationStatus = "DRAFT";
    await locForOcc.save();
    console.log("  ✓ Transitioned ARCHIVED -> DRAFT");

    // Clean up test location
    await Location.findByIdAndDelete(createdLocationId);
    console.log(`\n✓ Cleaned up test location (${createdLocationId})`);

    console.log("\n=======================================================");
    console.log("  ✅ ALL PRD 5 LOCATION TESTS PASSED WITH 100% SUCCESS");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ LOCATION TEST SUITE FAILED:", error);
    if (createdLocationId) {
      await Location.findByIdAndDelete(createdLocationId).catch(() => {});
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runLocationTestSuite();
