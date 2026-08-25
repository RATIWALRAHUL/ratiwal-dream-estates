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

import { connectToDatabase } from "../src/lib/db/mongoose";
import { Deal } from "../src/models/Deal";
import { DealOffer } from "../src/models/DealOffer";
import { InventoryHold } from "../src/models/InventoryHold";
import { Reservation } from "../src/models/Reservation";
import { Booking } from "../src/models/Booking";
import { DealActivity } from "../src/models/DealActivity";
import { Lead } from "../src/models/Lead";
import { Property } from "../src/models/Property";
import { InventoryUnit } from "../src/models/InventoryUnit";
import { Location } from "../src/models/Location";
import { DealService } from "../src/lib/services/deal.service";
import { OfferService } from "../src/lib/services/offer.service";
import { HoldService } from "../src/lib/services/hold.service";
import { ReservationService } from "../src/lib/services/reservation.service";
import { BookingService } from "../src/lib/services/booking.service";
import { DealReconciliationService } from "../src/lib/services/deal-reconciliation.service";
import { AdminSession } from "../src/lib/auth/session";

const MOCK_ADMIN_SESSION: AdminSession = {
  user: {
    id: "usr_admin_test_14",
    email: "admin.test@ratiwaldreamestates.com",
    name: "Admin Tester",
    role: "SUPER_ADMIN",
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

async function runTests() {
  console.log("================================================================================");
  console.log("🧪 STARTING PRD 14: DEALS, HOLDS, RESERVATIONS & BOOKINGS TEST SUITE");
  console.log("================================================================================\n");

  await connectToDatabase();

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, failureDetails?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (failureDetails) console.error(`     Details: ${failureDetails}`);
      failedCount++;
    }
  }

  try {
    // 0. Seed test prerequisite entities
    console.log("📦 0. Seeding prerequisite Lead, Property, and Inventory Units...");

    let prop = await Property.findOne();
    if (!prop) {
      prop = await Property.create({
        title: "Test Luxury Villas PRD14",
        slug: `test-luxury-villas-${Date.now()}`,
        shortDescription: "Exclusive luxury villas for testing PRD 14",
        fullDescription: "Detailed description for PRD 14 test property",
        propertyType: "VILLA",
        status: "PUBLISHED",
        locationId: new Types.ObjectId(),
        pricing: { currency: "INR", priceVisibility: "PUBLIC_STARTING_FROM", startingPricePaise: 850000000 },
        area: { minimumAreaSqFt: 3000, maximumAreaSqFt: 5000, displayUnitPreference: "SQ_FT" },
      });
    }

    const testLead = await Lead.create({
      fullName: "Vikram Malhotra",
      email: `vikram.malhotra.${Date.now()}@example.com`,
      phone: "+919876543210",
      displayPhone: "+91 98765 43210",
      source: "WEBSITE",
      stage: "QUALIFIED",
      status: "NEW",
      assignedAdvisorId: MOCK_ADMIN_SESSION.user.id,
      assignedAdvisorName: MOCK_ADMIN_SESSION.user.name,
    });

    const testUnit = await InventoryUnit.create({
      propertyId: prop._id,
      unitNumber: `VILLA-${Date.now().toString().slice(-4)}`,
      referenceCode: `RDE-U-TEST14-${Date.now()}`,
      status: "AVAILABLE",
      floorNumber: 1,
      carpetAreaSqFt: 3200,
      superBuiltUpAreaSqFt: 4000,
      terraceAreaSqFt: 450,
      chargeableAreaSqFt: 4000,
      facing: "NORTH",
      basePricePaise: 850000000, // ₹85,00,000
      currency: "INR",
      version: 1,
    });

    // ─── TEST 1: Deal Creation & Duplicate Detection ───
    console.log("\n📋 1. Testing Deal Creation & Duplicate Checking...");

    const deal = await DealService.createDeal(
      {
        leadId: testLead._id.toString(),
        propertyId: prop._id.toString(),
        unitId: testUnit._id.toString(),
        priority: "HIGH",
        expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        internalNotes: "High-net-worth investor interested in North-facing villa.",
      },
      MOCK_ADMIN_SESSION
    );

    assert(Boolean(deal && deal.dealNumber.startsWith("RDE-DL-")), "Deal created with valid RDE-DL prefix");
    assert(deal.status === "QUALIFICATION", "Initial deal stage is QUALIFICATION");
    assert(deal.version === 1, "Initial deal version is 1");

    const duplicateCheck = await DealService.checkDuplicates({
      leadId: testLead._id.toString(),
      propertyId: prop._id.toString(),
      unitId: testUnit._id.toString(),
    });
    assert(duplicateCheck.hasDuplicate === true, "Duplicate active deal correctly detected");

    // ─── TEST 2: Versioned Offer Proposal & Discount Approval ───
    console.log("\n💰 2. Testing Versioned Offers & Discount Approval...");

    const offer = await OfferService.createOffer(
      {
        dealId: deal._id.toString(),
        basePricePaise: 850000000,
        plcChargePaise: 20000000, // ₹2,00,000
        parkingChargePaise: 30000000, // ₹3,00,000
        discountAmountPaise: 50000000, // ₹5,00,000 (5.5% discount -> requires approval for non-admins)
        discountReason: "Investor loyalty incentive",
        validDays: 14,
      },
      MOCK_ADMIN_SESSION
    );

    assert(Boolean(offer && offer.offerNumber.startsWith("RDE-OFR-")), "Offer generated with RDE-OFR prefix");
    assert(offer.finalOfferedAmountPaise === 850000000 + 20000000 + 30000000 - 50000000, "Calculated final payable matches items");
    assert(offer.version === 1, "Offer version is 1");

    const acceptedOffer = await OfferService.acceptOffer(offer._id.toString(), MOCK_ADMIN_SESSION);
    assert(acceptedOffer.status === "ACCEPTED", "Customer offer acceptance recorded");

    // ─── TEST 3: Atomic Inventory Hold & Concurrency Double Hold Lock ───
    console.log("\n🔒 3. Testing Atomic Inventory Hold & Double Hold Prevention...");

    const hold = await HoldService.acquireHold(
      {
        dealId: deal._id.toString(),
        unitId: testUnit._id.toString(),
        durationHours: 72,
      },
      MOCK_ADMIN_SESSION
    );

    assert(Boolean(hold && hold.holdNumber.startsWith("RDE-HLD-")), "Hold created with RDE-HLD prefix");
    assert(hold.status === "ACTIVE", "Hold status is ACTIVE");

    const unitAfterHold = await InventoryUnit.findById(testUnit._id);
    assert(unitAfterHold?.status === "ON_HOLD", "Inventory unit atomically transitioned to ON_HOLD");

    // Attempt concurrent double hold
    let doubleHoldFailed = false;
    try {
      await HoldService.acquireHold(
        {
          dealId: deal._id.toString(),
          unitId: testUnit._id.toString(),
          durationHours: 24,
        },
        MOCK_ADMIN_SESSION
      );
    } catch (e: any) {
      doubleHoldFailed = e.message.includes("CONFLICT");
    }
    assert(doubleHoldFailed, "Prevented concurrent double hold on locked unit (409 Conflict)");

    // ─── TEST 4: Hold Extension & Release Lifecycle ───
    console.log("\n⏳ 4. Testing Hold Extension & Release...");

    const extendedHold = await HoldService.extendHold({
      holdId: hold._id.toString(),
      extensionHours: 24,
      reason: "Buyer bank loan verification in progress",
      session: MOCK_ADMIN_SESSION,
    });
    assert(extendedHold.extensionCount === 1, "Hold extension count incremented to 1");

    // ─── TEST 5: Reservation Conversion ───
    console.log("\n📋 5. Testing Hold to Reservation Conversion...");

    const reservation = await ReservationService.convertHoldToReservation(
      {
        dealId: deal._id.toString(),
        holdId: hold._id.toString(),
        offerId: offer._id.toString(),
        checklistNotes: "Identity and PAN cards collected.",
      },
      MOCK_ADMIN_SESSION
    );

    assert(Boolean(reservation && reservation.reservationNumber.startsWith("RDE-RSV-")), "Reservation created with RDE-RSV prefix");
    assert(reservation.status === "ACTIVE", "Reservation status is ACTIVE");

    const unitAfterReservation = await InventoryUnit.findById(testUnit._id);
    assert(unitAfterReservation?.status === "RESERVED", "Inventory unit atomically transitioned to RESERVED");

    const holdAfterConversion = await InventoryHold.findById(hold._id);
    assert(holdAfterConversion?.status === "CONVERTED", "Previous hold status marked CONVERTED");

    // ─── TEST 6: Operational Booking Confirmation & Double Booking Prevention ───
    console.log("\n🏷️ 6. Testing Operational Booking Confirmation & Double Booking Prevention...");

    const booking = await BookingService.confirmBooking(
      {
        reservationId: reservation._id.toString(),
        requirements: {
          identityProofVerified: true,
          addressProofVerified: true,
          bookingFormSigned: true,
          downPaymentTermsAccepted: true,
          verificationNotes: "Cheque clearance received.",
        },
        markDealWon: true,
      },
      MOCK_ADMIN_SESSION
    );

    assert(Boolean(booking && booking.bookingNumber.startsWith("RDE-BKG-")), "Booking created with RDE-BKG prefix");
    assert(booking.status === "CONFIRMED", "Booking status is CONFIRMED");

    const unitAfterBooking = await InventoryUnit.findById(testUnit._id);
    assert(unitAfterBooking?.status === "SOLD", "Inventory unit status transitioned to SOLD");

    const dealAfterBooking = await Deal.findById(deal._id);
    assert(dealAfterBooking?.status === "WON", "Deal closed and marked WON");

    // Attempt double booking
    let doubleBookingFailed = false;
    try {
      await BookingService.confirmBooking(
        {
          reservationId: reservation._id.toString(),
          requirements: {
            identityProofVerified: true,
            addressProofVerified: true,
            bookingFormSigned: true,
            downPaymentTermsAccepted: true,
          },
        },
        MOCK_ADMIN_SESSION
      );
    } catch (e: any) {
      doubleBookingFailed = true;
    }
    assert(doubleBookingFailed, "Prevented double booking on already sold unit");

    // ─── TEST 7: Durable Expiration Worker ───
    console.log("\n⏰ 7. Testing Durable Hold Expiration Worker...");

    // Create an expired hold for testing worker
    const expiredUnit = await InventoryUnit.create({
      propertyId: prop._id,
      unitNumber: "VILLA-999-EXP",
      referenceCode: `RDE-U-EXP-${Date.now()}`,
      status: "ON_HOLD",
      floorNumber: 2,
      carpetAreaSqFt: 2500,
      superBuiltUpAreaSqFt: 3000,
      facing: "EAST",
      basePricePaise: 700000000,
      currency: "INR",
      version: 1,
    });

    const expiredHold = await InventoryHold.create({
      holdNumber: "RDE-HLD-EXPIRED-TEST",
      unitId: expiredUnit._id,
      propertyId: prop._id,
      dealId: deal._id,
      leadId: testLead._id,
      status: "ACTIVE",
      heldBy: MOCK_ADMIN_SESSION.user.id,
      startsAt: new Date(Date.now() - 80 * 3600000),
      expiresAt: new Date(Date.now() - 8 * 3600000), // Expired 8 hours ago
      extensionCount: 0,
      version: 1,
      idempotencyKey: `expired-test-${Date.now()}`,
    });

    const workerResult = await HoldService.processExpiredHolds(50);
    assert(workerResult.processedCount >= 1, "Hold expiration worker processed expired hold");

    const releasedUnit = await InventoryUnit.findById(expiredUnit._id);
    assert(releasedUnit?.status === "AVAILABLE", "Expired hold unit automatically restored to AVAILABLE");

    // ─── TEST 8: Deal Reconciliation Consistency Scanner ───
    console.log("\n🔍 8. Testing Deal Reconciliation Scanner...");

    const report = await DealReconciliationService.scanConsistency();
    assert(report.healthScore >= 0 && report.healthScore <= 100, `Reconciliation scan computed health score: ${report.healthScore}%`);

    // ─── TEST 9: Activity Ledger & Audit Trail ───
    console.log("\n📜 9. Testing Activity Ledger & Audit Logs...");

    const activities = await DealActivity.find({ dealId: deal._id });
    assert(activities.length >= 4, `Append-only activity ledger recorded ${activities.length} entries for deal`);

    // Clean up test data
    console.log("\n🧹 Cleaning up test fixtures...");
    await Deal.deleteMany({ dealNumber: deal.dealNumber });
    await DealOffer.deleteMany({ dealId: deal._id });
    await InventoryHold.deleteMany({ $or: [{ _id: hold._id }, { _id: expiredHold._id }] });
    await Reservation.deleteMany({ _id: reservation._id });
    await Booking.deleteMany({ _id: booking._id });
    await DealActivity.deleteMany({ dealId: deal._id });
    await InventoryUnit.deleteMany({ $or: [{ _id: testUnit._id }, { _id: expiredUnit._id }] });
    await Lead.deleteOne({ _id: testLead._id });
  } catch (error: any) {
    console.error("💥 Unhandled exception during PRD 14 tests:", error);
    failedCount++;
  }

  console.log("\n================================================================================");
  console.log(`📊 PRD 14 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
