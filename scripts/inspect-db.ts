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
import { Property } from "../src/models/Property";
import { PlotOption } from "../src/models/PlotOption";

async function run() {
  const dbName = process.env.MONGODB_DB_NAME || "ratiwal_dream_estates";
  await mongoose.connect(process.env.MONGODB_URI!, { dbName });
  console.log(`Connected to database: ${dbName}`);
  const locs = await Location.find({}).lean();
  console.log("LOCATIONS:", JSON.stringify(locs.map((l: any) => ({ _id: l._id, name: l.name, city: l.city, slug: l.slug })), null, 2));
  
  const props = await Property.find({}).select("title slug rera.registrationNumber locationId").lean();
  console.log("PROPERTIES:", JSON.stringify(props, null, 2));

  const plotCount = await PlotOption.countDocuments({});
  console.log("TOTAL PLOT OPTIONS:", plotCount);

  const samplePlots = await PlotOption.find({}).limit(5).lean();
  console.log("SAMPLE PLOTS:", JSON.stringify(samplePlots, null, 2));

  const hpPlots = await PlotOption.find({ propertyId: "6acd1b4e1165e95b28fa508a" }).lean();
  console.log("HAPPY BUSINESS PARK PLOTS:", hpPlots.length);

  const nkPlots = await PlotOption.find({ propertyId: "6ac702091a734c5b62ce1234" }).lean();
  console.log("NEELKANTH NAGAR PLOTS:", nkPlots.length);

  await mongoose.disconnect();
}

run().catch(console.error);
