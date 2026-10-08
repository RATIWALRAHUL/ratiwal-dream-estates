/**
 * Verification Script for Jaipur Townships Seeding
 */

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

import { Property } from "../src/models/Property";
import { Location } from "../src/models/Location";
import { MediaAsset } from "../src/models/MediaAsset";
import { PlotOption } from "../src/models/PlotOption";

async function verify() {
  const dbName = process.env.MONGODB_DB_NAME || "ratiwal_dream_estates";
  await mongoose.connect(process.env.MONGODB_URI!, { dbName });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const jaipurLocation = await Location.findOne({ slug: "jaipur" });
  if (!jaipurLocation) throw new Error("Jaipur location not found");

  const properties = await Property.find({ locationId: jaipurLocation._id }).lean();
  console.log(`\nVerified Jaipur Properties Count: ${properties.length}`);

  const expectedSlugs = [
    "neelkanth-nagar",
    "riyasat-paradise-ii",
    "bhumija-green-block-a",
    "riyasat-heritage-extension",
  ];

  for (const slug of expectedSlugs) {
    const p = properties.find((item) => item.slug === slug);
    if (!p) throw new Error(`Missing property for slug: ${slug}`);

    console.log(`\n========================================`);
    console.log(`Property: ${p.title} (${p.slug})`);
    console.log(`========================================`);
    console.log(`- Status: ${p.publicationStatus} / ${p.listingStatus} / ${p.verificationStatus}`);
    console.log(`- Locality: ${p.locality}`);
    console.log(`- RERA: ${p.rera?.registrationNumber} (${p.rera?.status})`);
    console.log(`- Developer: ${p.developerOrOwnerName}`);
    console.log(`- Media Count: ${p.media?.length}`);
    
    // Check primary image
    const primaryImages = (p.media || []).filter((m) => m.isPrimary);
    console.log(`- Primary Images Count: ${primaryImages.length}`);
    if (primaryImages.length !== 1) {
      throw new Error(`Property ${p.slug} must have exactly 1 primary image! Found: ${primaryImages.length}`);
    }
    console.log(`- Primary Image URL: ${primaryImages[0].url}`);
    if (!primaryImages[0].url.startsWith("https://ik.imagekit.io/")) {
      throw new Error(`Primary image is not hosted on ImageKit! URL: ${primaryImages[0].url}`);
    }

    // Check masterplan
    console.log(`- Masterplan: ${p.masterplan?.title}`);
    console.log(`- Masterplan Image URL: ${p.masterplan?.imageUrl}`);
    if (!p.masterplan?.imageUrl?.startsWith("https://ik.imagekit.io/")) {
      throw new Error(`Masterplan image is not hosted on ImageKit! URL: ${p.masterplan?.imageUrl}`);
    }

    // Check SEO
    console.log(`- SEO Title: ${p.seo?.metaTitle}`);
    console.log(`- SEO Description: ${p.seo?.metaDescription}`);
    console.log(`- Canonical URL: ${p.seo?.canonicalUrl}`);
    console.log(`- OG Image URL: ${p.seo?.ogImageUrl}`);

    // Check Plot Options
    const plotOptions = await PlotOption.find({ propertyId: p._id }).lean();
    console.log(`- Plot Options Count: ${plotOptions.length}`);
    plotOptions.forEach((opt) => {
      console.log(`    Plot ${opt.plotNumber}: ${opt.label} (${opt.areaSqFt} sq ft / ${opt.areaSqFt / 9} sq yds)`);
    });

    // Check MediaAssets
    const mediaAssets = await MediaAsset.find({ ownerId: p._id }).lean();
    console.log(`- MediaAssets Records Count: ${mediaAssets.length}`);

    // Check no dummy fallback
    for (const m of p.media || []) {
      if (m.url.includes("township-development.jpg")) {
        throw new Error(`Found dummy fallback image in property media: ${m.url}`);
      }
    }
  }

  console.log(`\n>>> ALL 4 PROPERTIES PASSED 100% OF VERIFICATION CHECKS! <<<`);
  await mongoose.disconnect();
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
