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
} catch {}

import { connectToDatabase } from "../src/lib/db/mongoose";
import { DashboardAuthService } from "../src/lib/services/dashboard-auth.service";

async function testOtp() {
  console.log("Testing live Resend OTP dispatch to rahulkumawat1408@gmail.com...");
  await connectToDatabase();
  const res = await DashboardAuthService.requestPasswordReset("rahulkumawat1408@gmail.com");
  console.log("Result:", res);
  process.exit(0);
}

testOtp();
