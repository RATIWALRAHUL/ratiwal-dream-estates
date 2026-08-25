import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load environment variables from .env.local if present in CLI environment
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
  // Ignore
}

import { Location } from "@/models/Location";
import { Property } from "@/models/Property";
import { PlotOption } from "@/models/PlotOption";
import { connectToDatabase, disconnectFromDatabase } from "@/lib/db/mongoose";
import { logger } from "@/lib/logger";

export interface IndexInspectionResult {
  modelName: string;
  collectionName: string;
  definedIndexes: Array<Record<string, unknown>>;
  existingIndexes: Array<Record<string, unknown>>;
}

/**
 * Inspects all schema-defined indexes across Location, Property, and PlotOption.
 */
export async function inspectIndexes(): Promise<IndexInspectionResult[]> {
  await connectToDatabase();

  const models = [
    { name: "Location", model: Location },
    { name: "Property", model: Property },
    { name: "PlotOption", model: PlotOption },
  ];

  const results: IndexInspectionResult[] = [];

  for (const { name, model } of models) {
    const defined = model.schema.indexes();
    let existing: Array<Record<string, unknown>> = [];

    try {
      existing = (await model.collection.indexes()) as Array<Record<string, unknown>>;
    } catch {
      // Collection might not exist yet if empty
      existing = [];
    }

    results.push({
      modelName: name,
      collectionName: model.collection.name,
      definedIndexes: defined.map(([fields, options]) => ({ fields, options })),
      existingIndexes: existing,
    });
  }

  return results;
}

/**
 * Synchronizes schema indexes to MongoDB.
 * Explicitly invoked via CLI; never run automatically at application boot.
 */
export async function syncCatalogIndexes(dryRun = true): Promise<{ synced: string[]; dryRun: boolean }> {
  await connectToDatabase();

  const models = [
    { name: "Location", model: Location },
    { name: "Property", model: Property },
    { name: "PlotOption", model: PlotOption },
  ];

  const synced: string[] = [];

  for (const { name, model } of models) {
    if (dryRun) {
      logger.info(`[Dry Run] Would synchronize indexes for model ${name}`);
      synced.push(name);
    } else {
      logger.info(`Synchronizing indexes for model ${name}...`);
      await model.syncIndexes();
      synced.push(name);
      logger.info(`Indexes synchronized for model ${name}`);
    }
  }

  return { synced, dryRun };
}

// CLI runner if executed directly
if (require.main === module) {
  const isSync = process.argv.includes("--sync");
  const dryRun = !isSync;

  syncCatalogIndexes(dryRun)
    .then((result) => {
      console.log("Index synchronization completed:", result);
      return disconnectFromDatabase();
    })
    .catch((err) => {
      console.error("Index synchronization error:", err);
      process.exit(1);
    });
}
