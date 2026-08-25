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
        process.env[key] = val;
      }
    }
  }
} catch {
  // Ignore
}

import { EmailProvider } from "../src/lib/communications/providers/email.provider";

async function testResend() {
  console.log("Testing Resend Live Dispatch with Key:", process.env.RESEND_API_KEY ? "Present" : "Missing");
  console.log("From:", process.env.RESEND_FROM_EMAIL);
  console.log("Reply-To:", process.env.RESEND_REPLY_TO);

  const result = await EmailProvider.send({
    to: "rahulkumawat1408@gmail.com",
    subject: "Ratiwal Dream Estates — Resend Integration Verified",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #fffdf8; border: 1px solid #071a28; border-radius: 8px;">
        <h2 style="color: #071a28; margin: 0 0 12px;">Ratiwal Dream Estates</h2>
        <p style="color: #2b3a42; font-size: 14px; line-height: 1.6;">
          Your Resend transactional email integration has been successfully connected and verified!
        </p>
        <p style="font-size: 12px; color: #647581; margin-top: 16px;">
          Advisory Team · Ratiwal Dream Estates
        </p>
      </div>
    `,
    text: "Your Resend transactional email integration has been successfully connected and verified!",
  });

  console.log("\nDispatch Result:", result);
}

testResend().catch(console.error);
