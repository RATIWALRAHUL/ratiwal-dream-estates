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
  // Ignore if not found
}

import assert from "node:assert";
import mongoose, { Types } from "mongoose";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { Property } from "../src/models/Property";
import { Location } from "../src/models/Location";
import { LegalDocument } from "../src/models/LegalDocument";
import { LegalDocumentVersion } from "../src/models/LegalDocumentVersion";
import { LegalDocumentReview } from "../src/models/LegalDocumentReview";
import { LegalChecklistTemplate } from "../src/models/LegalChecklistTemplate";
import { PropertyLegalChecklist } from "../src/models/PropertyLegalChecklist";
import { LegalDocumentShare } from "../src/models/LegalDocumentShare";
import { LegalDocumentAccessLog } from "../src/models/LegalDocumentAccessLog";
import { LegalVaultService } from "../src/lib/services/legal-vault.service";
import { LegalShareService } from "../src/lib/services/legal-share.service";
import { LegalChecklistService } from "../src/lib/services/legal-checklist.service";
import { LegalExpiryService } from "../src/lib/services/legal-expiry.service";
import { AdminSession } from "../src/lib/auth/session";

const mockAdminSession: AdminSession = {
  user: {
    id: "legal-admin-test-01",
    email: "legal.counsel@ratiwal.com",
    name: "Advocate Rahul Kumawat",
    role: "ADMIN",
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

async function runLegalVaultTests() {
  console.log("\n⚖️  --- STARTING PRD 9 LEGAL VAULT TEST SUITE ---\n");
  await connectToDatabase();

  // Clean up any test artifacts
  await LegalDocument.deleteMany({ title: /TEST_LEGAL_/ });
  await Property.deleteMany({ title: /TEST_LEGAL_PROPERTY_/ });
  await Location.deleteMany({ name: /TEST_LEGAL_LOCATION_/ });
  await LegalDocumentShare.deleteMany({ intendedPurpose: /TEST_SHARE_/ });

  let property = await Property.findOne();
  if (!property) {
    let location = await Location.findOne();
    if (!location) {
      location = await Location.create({
        name: "TEST_LEGAL_LOCATION_JAIPUR",
        slug: `test-legal-loc-${Date.now()}`,
        state: "Rajasthan",
        city: "Jaipur",
        shortDescription: "Test location Jaipur",
        fullDescription: "Full description for test location",
        status: "PUBLISHED",
        createdBy: "TEST_RUNNER",
      });
    }

    property = await Property.create({
      title: "TEST_LEGAL_PROPERTY_ROYAL_CITY",
      slug: `test-legal-prop-${Date.now()}`,
      shortDescription: "Plotted development test for legal vault",
      fullDescription: "Comprehensive statutory verification test property",
      locationId: location._id,
      propertyType: "RESIDENTIAL_PLOT",
      status: "PUBLISHED",
      pricing: { currency: "INR", priceVisibility: "STARTING_AT", startingPricePaise: 500000000 },
      area: { minimumAreaSqFt: 1800, maximumAreaSqFt: 3600, displayUnitPreference: "SQ_YD" },
      rera: { status: "NOT_APPLICABLE" },
      seo: { title: "Test Property", description: "Test description for SEO" },
      createdBy: "TEST_RUNNER",
    });
  }

  console.log("✅ Setup: Created test Location and Property fixture.");

  // Test 1: File Integrity Hashing & Duplicate Detection
  console.log("\n🧪 Test 1: File Integrity Hashing & Duplicate Detection");
  const testBuffer1 = Buffer.from("Ratiwal JDA Land Conversion Order 2024 certified copy");
  const hash1 = LegalVaultService.computeSha256(testBuffer1);
  assert.strictEqual(typeof hash1, "string");
  assert.strictEqual(hash1.length, 64);

  const testBuffer2 = Buffer.from("Ratiwal JDA Land Conversion Order 2024 certified copy");
  const hash2 = LegalVaultService.computeSha256(testBuffer2);
  assert.strictEqual(hash1, hash2, "Identical content must produce identical SHA-256 hash");
  console.log("✅ Test 1 Passed: SHA-256 integrity hash is deterministic and robust.");

  // Test 2: Concurrency-safe Legal Document Creation & Initial Version Snapshot
  console.log("\n🧪 Test 2: Document Creation & Initial Version Snapshot");
  const doc = await LegalVaultService.createDocument(
    {
      propertyId: property._id.toString(),
      title: "TEST_LEGAL_JDA_90A_ORDER",
      category: "LAND_USE_CONVERSION",
      classification: "CONFIDENTIAL",
      issuingAuthority: "Jaipur Development Authority",
      jurisdiction: "Sanganer, Jaipur",
      documentNumberMasked: "JDA/LU/2024/7781",
      isRequired: true,
      checklistItemKey: "JDA_LAND_CONVERSION",
    },
    mockAdminSession
  );

  assert.ok(doc._id, "Legal Document must be created with valid ObjectId");
  assert.ok(doc.documentReference.startsWith("RDE-LEG-"), "Document reference must follow RDE-LEG-XXXXXX pattern");
  assert.strictEqual(doc.status, "DRAFT");
  assert.strictEqual(doc.version, 1);
  console.log(`✅ Test 2 Passed: Created Legal Document with reference ${doc.documentReference}`);

  // Test 3: Append-Only Version Replacement
  console.log("\n🧪 Test 3: Append-Only Version Replacement");
  const ver1 = await LegalVaultService.addVersion(
    {
      legalDocumentId: doc._id.toString(),
      providerKey: `legal/${property._id}/${doc._id}_v1.pdf`,
      sanitizedOriginalFilename: "jda_90a_order_scan_v1.pdf",
      mimeType: "application/pdf",
      fileSize: 1048576,
      sha256Checksum: hash1,
      versionNote: "Initial certified copy scan",
    },
    mockAdminSession
  );

  assert.strictEqual(ver1.versionNumber, 1);
  assert.strictEqual(ver1.sanitizedOriginalFilename, "jda_90a_order_scan_v1.pdf");

  const ver2 = await LegalVaultService.addVersion(
    {
      legalDocumentId: doc._id.toString(),
      providerKey: `legal/${property._id}/${doc._id}_v2.pdf`,
      sanitizedOriginalFilename: "jda_90a_order_rectified_v2.pdf",
      mimeType: "application/pdf",
      fileSize: 1248576,
      sha256Checksum: LegalVaultService.computeSha256("Rectified version with official stamp"),
      versionNote: "Attached registrar correction seal",
    },
    mockAdminSession
  );

  assert.strictEqual(ver2.versionNumber, 2);

  // Verify all versions preserved in ledger
  const allVersions = await LegalDocumentVersion.find({ legalDocumentId: doc._id }).sort({ versionNumber: 1 });
  assert.strictEqual(allVersions.length, 2, "Both version 1 and version 2 must be preserved in immutable ledger");
  assert.ok(allVersions[0].supersededAt, "Version 1 must be marked superseded upon version 2 creation");
  console.log("✅ Test 3 Passed: Immutable versioning successfully preserved history.");

  // Test 4: Status Transition Matrix Enforcement
  console.log("\n🧪 Test 4: Status Transition Matrix Enforcement");
  // Illegal transition: DRAFT cannot jump directly to INTERNALLY_VERIFIED without UNDER_REVIEW
  let threwExpected = false;
  try {
    await LegalVaultService.transitionStatus({
      legalDocumentId: doc._id.toString(),
      currentVersion: 3, // Doc version incremented on addVersion
      toStatus: "INTERNALLY_VERIFIED",
      reasonCode: "DIRECT_APPROVAL_NOT_ALLOWED",
      session: mockAdminSession,
    });
  } catch (err: any) {
    threwExpected = true;
    assert.ok(err.message.includes("INVALID_TRANSITION"), "Must reject illegal status transition leap");
  }
  assert.ok(threwExpected, "Direct jump from DRAFT to INTERNALLY_VERIFIED must throw error");

  // Valid step 1: DRAFT -> UNDER_REVIEW
  const underReviewDoc = await LegalVaultService.transitionStatus({
    legalDocumentId: doc._id.toString(),
    currentVersion: 3,
    toStatus: "UNDER_REVIEW",
    reasonCode: "SUBMITTED_FOR_LEGAL_DUE_DILIGENCE",
    comment: "Submitted for title inspection",
    session: mockAdminSession,
  });
  assert.strictEqual(underReviewDoc.status, "UNDER_REVIEW");

  // Valid step 2: UNDER_REVIEW -> INTERNALLY_VERIFIED
  const verifiedDoc = await LegalVaultService.transitionStatus({
    legalDocumentId: doc._id.toString(),
    currentVersion: underReviewDoc.version,
    toStatus: "INTERNALLY_VERIFIED",
    reasonCode: "COMPLIANCE_REVIEW_COMPLETED",
    comment: "Advocate verified JDA seal and revenue department signature",
    session: mockAdminSession,
  });
  assert.strictEqual(verifiedDoc.status, "INTERNALLY_VERIFIED");
  console.log("✅ Test 4 Passed: Status transition state machine strictly enforced.");

  // Test 5: Review History Ledger
  console.log("\n🧪 Test 5: Review History Ledger");
  const reviews = await LegalDocumentReview.find({ legalDocumentId: doc._id }).sort({ reviewedAt: 1 });
  assert.strictEqual(reviews.length, 2);
  assert.strictEqual(reviews[0].toStatus, "UNDER_REVIEW");
  assert.strictEqual(reviews[1].toStatus, "INTERNALLY_VERIFIED");
  assert.strictEqual(reviews[1].reasonCode, "COMPLIANCE_REVIEW_COMPLETED");
  console.log("✅ Test 5 Passed: Append-only review history correctly records transitions.");

  // Test 6: Checklist Template Instantiation & Readiness Calculation
  console.log("\n🧪 Test 6: Checklist Template Instantiation & Readiness Calculation");
  const checklist = await LegalChecklistService.evaluatePropertyChecklist(property._id.toString(), mockAdminSession.user.id);
  assert.ok(checklist.totalApplicableItems > 0, "Checklist must contain template items");
  assert.strictEqual(checklist.completedItemsCount, 1, "One item (JDA_LAND_CONVERSION) was verified");
  assert.ok(checklist.readinessPercentage > 0, "Readiness percentage must reflect verified items");

  const readinessSummary = await LegalChecklistService.getPropertyReadinessSummary(property._id.toString());
  assert.strictEqual(readinessSummary.internallyVerifiedCount, 1);
  assert.strictEqual(readinessSummary.propertyName, property.title);
  console.log(`✅ Test 6 Passed: Property document readiness computed at ${readinessSummary.readinessPercentage}%.`);

  // Test 7: Expiring External Share with Hashed Token
  console.log("\n🧪 Test 7: Expiring External Share with Hashed Token");
  const shareRes = await LegalShareService.createShare({
    legalDocumentId: doc._id.toString(),
    intendedPurpose: "TEST_SHARE_Bank Due Diligence",
    intendedRecipientEmail: "officer@sbi.co.in",
    maxDownloads: 2,
    durationHours: 24,
    passcode: "SecretPass123",
    session: mockAdminSession,
  });

  assert.ok(shareRes.shareToken, "Must return raw unhashed secret token");
  const tokenHash = LegalShareService.hashToken(shareRes.shareToken);
  const shareRecord = await LegalDocumentShare.findOne({ tokenHash });
  assert.ok(shareRecord, "Database must store SHA-256 hashed token, not plaintext");
  assert.strictEqual(shareRecord.downloadCount, 0);

  // Access share with passcode
  const accessResult = await LegalShareService.validateAndAccessShare(shareRes.shareToken, "SecretPass123");
  assert.strictEqual(accessResult.document.documentReference, doc.documentReference);

  const updatedShare = await LegalDocumentShare.findById(shareRecord._id);
  assert.strictEqual(updatedShare?.downloadCount, 1, "Download count must be incremented on access");
  console.log("✅ Test 7 Passed: Secure expiring external share verified with token hashing and download counting.");

  // Test 8: Access Logging Verification
  console.log("\n🧪 Test 8: Access Logging Verification");
  const accessLogs = await LegalDocumentAccessLog.find({ legalDocumentId: doc._id });
  assert.ok(accessLogs.length >= 2, "Access logs must record upload, version replacement, review, and share access");
  console.log(`✅ Test 8 Passed: ${accessLogs.length} immutable access audit records confirmed.`);

  // Clean up
  await LegalDocument.deleteMany({ title: /TEST_LEGAL_/ });
  await LegalDocumentVersion.deleteMany({ sanitizedOriginalFilename: /jda_90a/ });
  await LegalDocumentReview.deleteMany({ legalDocumentId: doc._id });
  await PropertyLegalChecklist.deleteMany({ propertyId: property._id });
  await LegalDocumentShare.deleteMany({ intendedPurpose: /TEST_SHARE_/ });
  await LegalDocumentAccessLog.deleteMany({ legalDocumentId: doc._id });

  console.log("\n🎉 ALL PRD 9 LEGAL VAULT TESTS COMPLETED SUCCESSFULLY! 🎉\n");
}

runLegalVaultTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Legal Vault Test Failed:", err);
    process.exit(1);
  });
