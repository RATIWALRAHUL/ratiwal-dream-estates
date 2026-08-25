/**
 * Ratiwal Dream Estates — ImageKit Media Subsystem Test Battery
 * Validates ImageKit client initialization, signature generation, and URL transformations.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  // Ignore if .env.local is missing
}

import { getImageKitClient, getImageKitAuthParams } from "../src/lib/imagekit/client";
import {
  isImageKitUrl,
  buildTransformationString,
  getImageKitUrl,
  getBlurPlaceholderUrl,
} from "../src/lib/imagekit/url";
import { getServerEnv } from "../src/lib/env";

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(` ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(` ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
    failedTests++;
  }
}

async function runImageKitTests() {
  console.log("\n========================================================");
  console.log(" Ratiwal Dream Estates — ImageKit Integration Test Suite");
  console.log("========================================================\n");

  // 1. Environment Validation
  console.log("--- [1] Environment & Configuration ---");
  const env = getServerEnv();
  assert(
    env.IMAGEKIT_PUBLIC_KEY === "public_dzOgOjve3IxMrPVRKJcU4f9qHlY=",
    "ImageKit Public Key validated from environment"
  );
  assert(
    env.IMAGEKIT_PRIVATE_KEY.startsWith("private_"),
    "ImageKit Private Key securely configured"
  );
  assert(
    Boolean(env.IMAGEKIT_URL_ENDPOINT),
    "ImageKit URL Endpoint configured"
  );

  // 2. Client Singleton
  console.log("\n--- [2] ImageKit SDK Singleton Client ---");
  const ik = getImageKitClient();
  assert(ik !== null && typeof ik === "object", "getImageKitClient returns valid ImageKit instance");

  const ik2 = getImageKitClient();
  assert(ik === ik2, "getImageKitClient maintains singleton instance across calls");

  // 3. Client Authentication Parameters
  console.log("\n--- [3] Client Upload Authentication Parameters ---");
  const auth = getImageKitAuthParams();
  assert(typeof auth.token === "string" && auth.token.length > 0, "Auth token generated");
  assert(typeof auth.expire === "number" && auth.expire > Date.now() / 1000, "Auth expire timestamp is in the future");
  assert(typeof auth.signature === "string" && auth.signature.length > 0, "HMAC-SHA1 signature generated");
  assert(auth.publicKey === env.IMAGEKIT_PUBLIC_KEY, "Public key matches environment");

  // 4. URL Transformations
  console.log("\n--- [4] ImageKit URL Transformation & Optimization ---");
  const sampleUrl = "https://ik.imagekit.io/ratiwaldream/properties/royal-palms.jpg";
  const externalUrl = "https://example.com/images/photo.jpg";

  assert(isImageKitUrl(sampleUrl) === true, "isImageKitUrl identifies ImageKit URLs");
  assert(isImageKitUrl(externalUrl) === false, "isImageKitUrl ignores non-ImageKit URLs");

  const trString = buildTransformationString({
    width: 800,
    height: 500,
    quality: 85,
    format: "webp",
    focus: "auto",
  });
  assert(
    trString.includes("w-800") && trString.includes("h-500") && trString.includes("q-85") && trString.includes("f-webp"),
    "buildTransformationString generates correct transformation syntax"
  );

  const transformedUrl = getImageKitUrl(sampleUrl, { width: 1200, quality: 90 });
  assert(
    transformedUrl.includes("tr:w-1200,q-90,f-auto"),
    "getImageKitUrl injects transformation segment into URL path"
  );

  const blurUrl = getBlurPlaceholderUrl(sampleUrl);
  assert(
    blurUrl.includes("tr:w-40") && blurUrl.includes("bl-30"),
    "getBlurPlaceholderUrl generates progressive blur placeholder"
  );

  // Non-ImageKit URL pass-through
  const untouchedUrl = getImageKitUrl(externalUrl, { width: 500 });
  assert(untouchedUrl === externalUrl, "getImageKitUrl preserves external URLs unchanged");

  // 5. Summary
  console.log("\n========================================================");
  console.log(` Summary: ${passedTests} passed, ${failedTests} failed`);
  console.log("========================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runImageKitTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
