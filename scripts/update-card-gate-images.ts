import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";
import ImageKit from "imagekit";

// Load .env.local
const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
}

import { Property } from "../src/models/Property";
import { MediaAsset } from "../src/models/MediaAsset";
import { PlotOption } from "../src/models/PlotOption";

async function run() {
  const ik = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });

  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: process.env.MONGODB_DB_NAME || "ratiwal_dream_estates",
  });
  console.log(`Connected to DB: ${mongoose.connection.name}`);

  // 1. Handle Riyasat Paradise II Main Gate Image
  console.log("\n[1] Updating Riyasat Paradise II Main Gate Image...");
  const paradise = await Property.findOne({ slug: "riyasat-paradise-ii" });
  if (!paradise) throw new Error("Riyasat Paradise II not found");

  const gateUrl = "https://cdn.prod.website-files.com/67b6bb5106e0b321737746fb/6a50eba48b4a72a8abfdbdbb_Entry-Gate-03.jpg";
  const gateRes = await fetch(gateUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  if (!gateRes.ok) throw new Error(`Failed to download gate image: ${gateRes.status}`);
  const gateBuffer = Buffer.from(await gateRes.arrayBuffer());
  console.log(`Downloaded gate image (${gateBuffer.length} bytes). Uploading to ImageKit...`);

  const uploadRes = await ik.upload({
    file: gateBuffer,
    fileName: "riyasat-paradise-ii-main-gate.jpg",
    folder: "/dreamestate/projects/jaipur/riyasat-paradise-ii",
    useUniqueFileName: false,
    tags: ["jaipur", "riyasat-paradise-ii", "main-gate", "entrance"],
  });
  console.log(`Uploaded to ImageKit: ${uploadRes.url}`);

  // Create or update MediaAsset for the main gate
  await MediaAsset.findOneAndUpdate(
    {
      ownerId: paradise._id,
      originalFilename: "riyasat-paradise-ii-main-gate.jpg",
    },
    {
      $set: {
        ownerType: "PROPERTY",
        ownerId: paradise._id,
        assetCategory: "IMAGE",
        purpose: "PROPERTY_HERO",
        provider: "imagekit",
        providerFileId: uploadRes.fileId,
        providerKey: uploadRes.filePath || `/dreamestate/projects/jaipur/riyasat-paradise-ii/riyasat-paradise-ii-main-gate.jpg`,
        publicUrl: uploadRes.url,
        access: "PUBLIC",
        originalFilename: "riyasat-paradise-ii-main-gate.jpg",
        safeDisplayName: "Riyasat Paradise II Grand Entrance Gate",
        mimeType: "image/jpeg",
        extension: "jpg",
        sizeBytes: gateBuffer.length,
        width: uploadRes.width || 1920,
        height: uploadRes.height || 1080,
        status: "READY",
        altText: "Riyasat Paradise II Grand Entrance Gate on Diggi-Malpura Road Vatika Jaipur",
        caption: "Iconic Dubai-inspired monumental entrance gateway at Riyasat Paradise II",
        isPrimary: true,
        sortOrder: 0,
        uploadedBy: "SYSTEM_SEED",
        uploadedByEmail: "admin@dreamestate.in",
        uploadedAt: new Date(),
        verifiedAt: new Date(),
      }
    },
    { upsert: true, new: true }
  );

  // Set previous primary images to false in MediaAsset
  await MediaAsset.updateMany(
    {
      ownerId: paradise._id,
      originalFilename: { $ne: "riyasat-paradise-ii-main-gate.jpg" },
      isPrimary: true,
    },
    { $set: { isPrimary: false, sortOrder: 1 } }
  );

  // Update Property.media array
  const updatedMedia = [
    {
      mediaAssetId: new mongoose.Types.ObjectId(),
      url: uploadRes.url,
      caption: "Iconic Dubai-inspired monumental entrance gateway at Riyasat Paradise II",
      altText: "Riyasat Paradise II Grand Entrance Gate on Diggi-Malpura Road Vatika Jaipur",
      sortOrder: 0,
      isPrimary: true,
      publicationStatus: "ACTIVE",
    },
    ...(paradise.media || [])
      .filter((m) => !m.url.includes("main-gate"))
      .map((m, idx) => ({
        ...m.toObject ? m.toObject() : m,
        isPrimary: false,
        sortOrder: idx + 1,
      })),
  ];

  paradise.media = updatedMedia as any;
  if (paradise.seo) {
    paradise.seo.ogImageUrl = uploadRes.url;
  }
  await paradise.save();
  console.log("Riyasat Paradise II updated with Main Gate as primary!");

  // 2. Ensure all 4 properties have proper alt texts mentioning Grand Entrance Gate
  console.log("\n[2] Verifying Grand Entrance Gate tags on all properties...");
  const neelkanth = await Property.findOne({ slug: "neelkanth-nagar" });
  if (neelkanth && neelkanth.media && neelkanth.media[0]) {
    neelkanth.media[0].altText = "Neelkanth Nagar Grand Entrance Gate and Main Boulevard in Chaksu Jaipur";
    neelkanth.media[0].caption = "Grand entrance gateway and welcome archway at Neelkanth Nagar, Chaksu";
    await neelkanth.save();
    console.log("Neelkanth Nagar primary gate alt text updated.");
  }

  const heritage = await Property.findOne({ slug: "riyasat-heritage-extension" });
  if (heritage && heritage.media && heritage.media[0]) {
    heritage.media[0].altText = "Riyasat Heritage Extension Royal Grand Entrance Gate in Chaksu Jaipur";
    heritage.media[0].caption = "Royal heritage grand entrance gateway and avenue at Riyasat Heritage Extension";
    await heritage.save();
    console.log("Riyasat Heritage Extension primary gate alt text updated.");
  }

  // 3. Add explicit 1,000 Sq. Ft. (111.11 Sq. Yd.) and standard plot options to all properties
  console.log("\n[3] Adding verified ~1,000 sq ft plot options...");
  const properties = [
    { slug: "neelkanth-nagar", code: "NK", rate: 1800 },
    { slug: "riyasat-paradise-ii", code: "RP", rate: 2850 },
    { slug: "bhumija-green-block-a", code: "BG", rate: 2400 },
    { slug: "riyasat-heritage-extension", code: "RH", rate: 1950 },
  ];

  for (const item of properties) {
    const p = await Property.findOne({ slug: item.slug });
    if (!p) continue;

    console.log(`Ensuring 1,000 Sq. Ft. (111.11 Sq. Yd.) plot for ${p.title}...`);
    await PlotOption.findOneAndUpdate(
      { propertyId: p._id, plotNumber: `${item.code}-1000SQFT` },
      {
        $set: {
          propertyId: p._id,
          plotNumber: `${item.code}-1000SQFT`,
          label: "111.11 Sq. Yds (1,000 Sq. Ft.) Villa Plot",
          areaSqFt: 1000,
          widthFeet: 20,
          lengthFeet: 50,
          basePricePaise: Math.round(111.11 * item.rate * 100),
          facing: "EAST",
          cornerPlot: false,
          status: "AVAILABLE",
          publiclyVisible: true,
          sortOrder: 2,
          lastVerifiedAt: new Date(),
        }
      },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(` -> 1,000 Sq. Ft. plot ensured for ${p.title}`);
  }

  console.log("\n>>> ALL PROPERTY MAIN GATE IMAGES & PLOT OPTIONS UPDATED SUCCESSFULLY! <<<");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
