import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

// Load .env.local
const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
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

import { getAllProperties, getPropertyBySlug, getRelatedProperties } from "../src/lib/data/properties";

async function main() {
  const dbName = process.env.MONGODB_DB_NAME || "ratiwal_dream_estates";
  await mongoose.connect(process.env.MONGODB_URI!, { dbName });
  console.log("Connected to Mongo.");

  console.log("\nTesting getAllProperties()...");
  const all = await getAllProperties();
  const jaipurProps = all.filter((p) => p.city.toLowerCase() === "jaipur");
  console.log(`Total properties in DB: ${all.length}, Jaipur properties: ${jaipurProps.length}`);

  for (const p of jaipurProps) {
    console.log(`\n- Name: ${p.name}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Location: ${p.location}, ${p.city}`);
    console.log(`  Plot Sizes: ${p.plotSizes.join(", ")}`);
    console.log(`  Images (${p.images.length}): ${p.images[0]}`);
    console.log(`  RERA: ${p.approvalDetails}`);
    console.log(`  Masterplan Image: ${p.masterplan?.imageUrl}`);
    console.log(`  Documents Count: ${p.documentsList?.length}`);
    console.log(`  Plot Options Count: ${p.plotOptions?.length}`);
  }

  console.log("\nTesting getPropertyBySlug('neelkanth-nagar')...");
  const single = await getPropertyBySlug("neelkanth-nagar");
  if (!single) throw new Error("Could not find neelkanth-nagar via getPropertyBySlug!");
  console.log(`Found: ${single.name}, Highlights count: ${single.highlights?.length}`);

  console.log("\nTesting getRelatedProperties('neelkanth-nagar', 3)...");
  const related = await getRelatedProperties("neelkanth-nagar", 3);
  console.log(`Related properties found: ${related.length}`);
  related.forEach((r) => console.log(`  Related: ${r.name} (${r.slug})`));

  console.log("\nALL DATA LAYER TESTS PASSED SUCCESSFULLY!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
