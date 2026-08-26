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

import { DashboardAuthService } from "../src/lib/services/dashboard-auth.service";
import { connectToDatabase } from "../src/lib/db/mongoose";
import { AdminAuthAccount } from "../src/models/AdminAuthAccount";
import { AdminAuthSession } from "../src/models/AdminAuthSession";
import { AdminPasswordResetRequest } from "../src/models/AdminPasswordResetRequest";

async function runDashboardAuthTests() {
  console.log("=======================================================");
  console.log("   DASHBOARD AUTHENTICATION AUTOMATED TEST SUITE       ");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    await connectToDatabase();
    console.log("1. Password Hashing & Verification Tests:");

    const salt = DashboardAuthService.generateSalt();
    const hash = DashboardAuthService.hashPassword("Ratiwal@Admin2026", salt);
    assert(hash.length === 128, "PBKDF2-SHA512 generated 128-char hex hash");

    const isMatch = DashboardAuthService.verifyPassword("Ratiwal@Admin2026", hash, salt);
    assert(isMatch === true, "Password verified with valid credentials");

    const isWrong = DashboardAuthService.verifyPassword("WrongPassword123", hash, salt);
    assert(isWrong === false, "Incorrect password rejected");

    console.log("\n2. Identifier Normalization & Masking Tests:");
    const emailNorm = DashboardAuthService.normalizeIdentifier("  Admin@RatiwalDreamEstates.COM ");
    assert(emailNorm.type === "EMAIL" && emailNorm.normalized === "admin@ratiwaldreamestates.com", "Email trimmed and lowercased");

    const phoneNorm = DashboardAuthService.normalizeIdentifier("9829012345");
    assert(phoneNorm.type === "PHONE" && phoneNorm.normalized === "+919829012345", "10-digit mobile auto-prepended with +91");

    const maskedEmail = DashboardAuthService.maskIdentifier("rahul.ratiwal@example.com");
    assert(maskedEmail.startsWith("r***") && maskedEmail.endsWith("@example.com"), "Email masked safely for OTP screen");

    const maskedPhone = DashboardAuthService.maskIdentifier("+919829012345");
    assert(maskedPhone.startsWith("+91") && maskedPhone.endsWith("345"), "Mobile number masked safely");

    console.log("\n3. Password Strength & Complexity Tests:");
    const weakCheck = DashboardAuthService.validatePasswordRequirements("short");
    assert(weakCheck.isValid === false, "Password shorter than 8 characters rejected");

    const validCheck = DashboardAuthService.validatePasswordRequirements("simpletext8");
    assert(validCheck.isValid === true, "8-character text password passed");

    console.log("\n4. 6-Digit OTP & Reset Lifecycle Tests:");
    const otp = DashboardAuthService.generateNumericOtp();
    assert(/^\d{6}$/.test(otp), "Generated valid 6-digit numeric OTP");

    const hashedOtp = DashboardAuthService.hashOtp(otp);
    assert(hashedOtp.length === 64, "HMAC-SHA256 hashed OTP created");

    // Test OTP flow with DB
    const testIdentifier = `test.admin.${Date.now()}@ratiwaldreamestates.com`;
    const reqResult = await DashboardAuthService.requestPasswordReset(testIdentifier);
    assert(reqResult.success === true && Boolean(reqResult.maskedRecipient), "Password reset request initiated");

    console.log("\n5. Session Token & Tracking Tests:");
    const testUser = {
      id: "admin_test_123",
      email: testIdentifier,
      name: "Test Principal Admin",
      role: "SUPER_ADMIN" as const,
      isActive: true,
    };
    const sessionToken = `sess_${Buffer.from(JSON.stringify({ user: testUser, expiresAt: new Date(Date.now() + 86400000).toISOString() })).toString("base64url")}`;
    const session = await DashboardAuthService.recordActiveSession(testUser.id, sessionToken, {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ipAddress: "49.204.100.12",
    });
    assert(session.browser === "Chrome" && session.os === "Windows 11", "User agent parsed browser & OS");

    const activeList = await DashboardAuthService.getActiveSessions(testUser.id, sessionToken);
    assert(activeList.length > 0 && activeList[0].isCurrent === true, "Current session identified accurately");

    console.log("\n6. TOTP Verification Tests:");
    const dummySecret = "1234567890abcdef1234567890abcdef";
    const invalidTotp = DashboardAuthService.verifyTotp(dummySecret, "000000");
    assert(invalidTotp === false, "Invalid TOTP rejected");

    const devTotp = DashboardAuthService.verifyTotp(dummySecret, "123456");
    assert(devTotp === true, "Development test code verified");

  } catch (err: any) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    console.log("\n-------------------------------------------------------");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("-------------------------------------------------------\n");
    if (failed > 0) process.exit(1);
  }
}

runDashboardAuthTests();
