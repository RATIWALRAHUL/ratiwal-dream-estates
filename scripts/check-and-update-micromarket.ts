import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (t && !t.startsWith("#")) {
    const idx = t.indexOf("=");
    if (idx > 0) process.env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  }
}

import { Location } from "../src/models/Location";

async function main() {
  const dbName = process.env.MONGODB_DB_NAME || "ratiwal_dream_estates";
  console.log(`Connecting to database: ${dbName}...`);
  await mongoose.connect(process.env.MONGODB_URI!, { dbName });
  console.log("Connected.");

  const locBefore = await Location.findOne({ slug: "jaipur" }).lean();
  if (!locBefore) {
    console.log("Location 'jaipur' not found in MongoDB!");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("BEFORE UPDATE:");
  const tonkMmBefore = (locBefore.microMarkets as any[])?.find(
    (mm) => mm.id === "mm-jaipur-tonk-rd" || mm.name.toLowerCase().includes("tonk road")
  );
  console.log("Micro-market:", tonkMmBefore?.name);
  console.log("relevantPropertySlugs:", tonkMmBefore?.relevantPropertySlugs);

  // Perform atomic update
  const result = await Location.updateOne(
    {
      slug: "jaipur",
      "microMarkets.name": { $regex: /tonk road/i },
    },
    {
      $addToSet: {
        "microMarkets.$.relevantPropertySlugs": "riyasat-paradise-ii",
      },
    }
  );

  console.log("Update result:", result);

  const locAfter = await Location.findOne({ slug: "jaipur" }).lean();
  const tonkMmAfter = (locAfter?.microMarkets as any[])?.find(
    (mm) => mm.id === "mm-jaipur-tonk-rd" || mm.name.toLowerCase().includes("tonk road")
  );
  console.log("\nAFTER UPDATE:");
  console.log("Micro-market:", tonkMmAfter?.name);
  console.log("relevantPropertySlugs:", tonkMmAfter?.relevantPropertySlugs);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Error executing micromarket update:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
