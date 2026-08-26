/**
 * @file test-channel-partners.ts
 * @description Automated Unit & Integration Test Suite for PRD 18:
 * Channel Partners, Brokers, Lead Attribution & Commission Management.
 */

import {
  hashPartnerPassword,
  verifyPartnerPassword,
  createPartnerSessionToken,
  verifyPartnerSessionToken,
  PARTNER_AUTH_COOKIE_NAME,
} from "../src/lib/auth/partner-session";
import {
  isValidPartnerStatusTransition,
  PartnerStatus,
  PartnerUser,
} from "../src/types/partner";
import { PartnerInvitationService } from "../src/lib/services/partner-invitation.service";
import { PartnerLeadService } from "../src/lib/services/partner-lead.service";
import { CommissionEngineService } from "../src/lib/services/commission-engine.service";
import { MoneyUtils } from "../src/lib/utils/money";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${testName}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n============================================================");
  console.log("  PRD 18: Channel Partners & Commissions Test Suite");
  console.log("============================================================\n");

  // ─── Test Group 1: Partner Lifecycle State Machine ──────────────────────────
  console.log("1. Partner Lifecycle State Machine Transitions:");
  assert(
    isValidPartnerStatusTransition("DRAFT", "INVITED"),
    "Permits transition: DRAFT -> INVITED"
  );
  assert(
    isValidPartnerStatusTransition("INVITED", "ONBOARDING"),
    "Permits transition: INVITED -> ONBOARDING"
  );
  assert(
    isValidPartnerStatusTransition("ONBOARDING", "UNDER_REVIEW"),
    "Permits transition: ONBOARDING -> UNDER_REVIEW"
  );
  assert(
    isValidPartnerStatusTransition("UNDER_REVIEW", "APPROVED"),
    "Permits transition: UNDER_REVIEW -> APPROVED"
  );
  assert(
    isValidPartnerStatusTransition("APPROVED", "ACTIVE"),
    "Permits transition: APPROVED -> ACTIVE"
  );
  assert(
    isValidPartnerStatusTransition("ACTIVE", "SUSPENDED"),
    "Permits transition: ACTIVE -> SUSPENDED"
  );
  assert(
    !isValidPartnerStatusTransition("DRAFT", "ACTIVE"),
    "Rejects illegal transition: DRAFT -> ACTIVE without compliance"
  );
  assert(
    !isValidPartnerStatusTransition("REJECTED", "ACTIVE"),
    "Rejects illegal transition: REJECTED -> ACTIVE"
  );

  // ─── Test Group 2: Session Isolation & Password Cryptography ───────────────
  console.log("\n2. Session Isolation & Password PBKDF2 Cryptography:");
  assert(
    PARTNER_AUTH_COOKIE_NAME === "ratiwal_partner_token",
    "Partner cookie is isolated as 'ratiwal_partner_token'"
  );

  const rawPassword = "SecureBrokerPassword2026!";
  const { hash, salt } = hashPartnerPassword(rawPassword);
  assert(
    hash.length === 128 && salt.length === 32,
    "Generates 128-hex PBKDF2 hash and 32-hex salt"
  );
  assert(
    verifyPartnerPassword(rawPassword, hash, salt),
    "Verifies valid password against PBKDF2 hash"
  );
  assert(
    !verifyPartnerPassword("WrongPassword123", hash, salt),
    "Rejects invalid password attempt"
  );

  const mockUser: PartnerUser = {
    id: "65d8a9e01234567890123456",
    partnerId: "65d8a9e01234567890654321",
    email: "partner@apexrealty.com",
    name: "Apex Realty Partner",
    phone: "+919876543210",
    partnerType: "CHANNEL_PARTNER",
    partnerCode: "RDE-CP-100293",
    companyName: "Apex Realty LLP",
    isActive: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    complianceStatus: "ACTIVE",
  };

  const sessionToken = createPartnerSessionToken(mockUser);
  assert(
    sessionToken.startsWith("part_"),
    "Session token format starts with prefix 'part_'"
  );

  const verifiedSession = verifyPartnerSessionToken(sessionToken);
  assert(
    verifiedSession !== null && verifiedSession.user.partnerCode === "RDE-CP-100293",
    "Verifies valid signed HMAC partner session token"
  );

  const tamperedToken = sessionToken.slice(0, -5) + "abcde";
  assert(
    verifyPartnerSessionToken(tamperedToken) === null,
    "Detects and rejects tampered session token signature"
  );

  // ─── Test Group 3: One-Time Token Cryptography ─────────────────────────────
  console.log("\n3. One-Time Invitation Token Cryptography:");
  const testRawToken = "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0";
  const tokenHash = PartnerInvitationService.hashToken(testRawToken);
  assert(
    tokenHash.length === 64,
    "Generates 64-character SHA-256 hash for invitation verification"
  );
  assert(
    PartnerInvitationService.hashToken(testRawToken) === tokenHash,
    "Produces deterministic SHA-256 token hashes"
  );

  // ─── Test Group 4: Zero-PII Leak Masking & Deduplication ───────────────────
  console.log("\n4. Zero-PII Leak Masking & Deduplication Helpers:");
  const maskedName = PartnerLeadService.maskName("Rajesh Sharma");
  assert(
    maskedName === "Rajesh S****",
    `Masks customer full name safely (${maskedName})`
  );

  const maskedPhone = PartnerLeadService.maskPhone("+919876543210");
  assert(
    maskedPhone === "+91 98*** **210",
    `Masks phone number displaying only safe prefix and suffix (${maskedPhone})`
  );

  const phoneHash1 = PartnerLeadService.hashPhone("+91 98765 43210");
  const phoneHash2 = PartnerLeadService.hashPhone("9876543210");
  assert(
    phoneHash1 === phoneHash2 && phoneHash1.length === 64,
    "Normalized phone hashing matches standard and formatted inputs"
  );

  // ─── Test Group 5: Deterministic Commission Calculations ───────────────────
  console.log("\n5. Deterministic Commission Calculations & Money Utilities:");
  const testBaseAmountPaise = 500000000; // ₹50 Lakhs = 5,000,000 INR

  // Test 5.1: Percentage Plan (2.5%)
  const percentagePlan: any = {
    calculationMethod: "PERCENTAGE",
    defaultPercentage: 2.5,
  };
  const grossPct = CommissionEngineService.calculateGrossCommission(percentagePlan, testBaseAmountPaise);
  assert(
    grossPct === 12500000, // ₹1,25,000
    `Calculates 2.5% commission on ₹50L: ${MoneyUtils.formatINR(grossPct)} (12500000 Paise)`
  );

  // Test 5.2: Flat Amount Plan (₹75,000)
  const flatPlan: any = {
    calculationMethod: "FLAT_AMOUNT",
    flatAmountPaise: 7500000,
  };
  const grossFlat = CommissionEngineService.calculateGrossCommission(flatPlan, testBaseAmountPaise);
  assert(
    grossFlat === 7500000,
    `Calculates flat commission: ${MoneyUtils.formatINR(grossFlat)}`
  );

  // Test 5.3: Slab Plan (Slab 1: <₹1Cr @ 2.0%, Slab 2: >=₹1Cr @ 3.0%)
  const slabPlan: any = {
    calculationMethod: "SLAB",
    slabs: [
      { minAmountPaise: 0, maxAmountPaise: 99999999, ratePercentage: 2.0 },
      { minAmountPaise: 100000000, maxAmountPaise: undefined, ratePercentage: 3.0 },
    ],
    defaultPercentage: 2.0,
  };

  const grossSlab1 = CommissionEngineService.calculateGrossCommission(slabPlan, 50000000); // ₹50L (in paise: 50,00,000 * 100) -> 5,00,00,000
  assert(
    grossSlab1 === 1000000, // 2% of 5,00,00,000 Paise = 10,00,000 Paise (₹10,000)
    `Calculates slab 1 (<₹1Cr) rate of 2.0%`
  );

  const grossSlab2 = CommissionEngineService.calculateGrossCommission(slabPlan, 200000000); // ₹2Cr
  assert(
    grossSlab2 === 6000000, // 3% of 2,00,00,000 = 6,00,000
    `Calculates slab 2 (>=₹1Cr) tier rate of 3.0%`
  );

  // Test 5.4: Statutory TDS Withholding calculation
  const grossAccrualPaise = 10000000; // ₹1,00,000
  const standardTdsRate = 2.0; // 2% under current schedule
  const tdsWithheldPaise = MoneyUtils.percentageOf(grossAccrualPaise, standardTdsRate);
  const netPayablePaise = MoneyUtils.subtract(grossAccrualPaise, tdsWithheldPaise);

  assert(
    tdsWithheldPaise === 200000 && netPayablePaise === 9800000,
    `Calculates 2.0% TDS Withholding: Gross ₹1,00,000 - TDS ₹2,000 = Net ₹98,000`
  );

  // ─── Test Group 6: Proportional Refund Clawback Calculation ────────────────
  console.log("\n6. Proportional Refund Clawback Arithmetic:");
  const bookingValuePaise = 100000000; // ₹1 Crore
  const totalCommissionPaise = 2000000; // ₹2 Lakhs (2%)
  const refundAmountPaise = 25000000; // ₹25 Lakhs (25% refund)

  const clawbackProportion = (refundAmountPaise / bookingValuePaise) * 100; // 25%
  const clawbackAmountPaise = MoneyUtils.percentageOf(totalCommissionPaise, clawbackProportion);

  assert(
    clawbackAmountPaise === 500000, // 25% of ₹2L = ₹50,000 (500000 Paise)
    `Calculates proportional 25% refund clawback: ₹50,000 (500000 Paise)`
  );

  // Summary
  console.log("\n============================================================");
  console.log(`  Test Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[31m${failed} Failed\x1b[0m`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
