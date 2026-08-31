import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

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

import { connectToDatabase, disconnectFromDatabase } from "@/lib/db/mongoose";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { SiteVisit } from "@/models/SiteVisit";
import { Location } from "@/models/Location";
import { logger } from "@/lib/logger";

export interface IndexMigrationPlan {
  collection: string;
  indexSpec: Record<string, 1 | -1 | "text">;
  options?: Record<string, unknown>;
  expectedIndexName?: string;
  purpose: string;
}

export const APPROVED_INDEXES: IndexMigrationPlan[] = [
  {
    collection: "properties",
    indexSpec: { publicationStatus: 1, updatedAt: -1 },
    expectedIndexName: "publicationStatus_1_updatedAt_-1",
    purpose: "Accelerates dashboard properties listing and recent properties queries",
  },
  {
    collection: "properties",
    indexSpec: { verificationStatus: 1, lastVerifiedAt: -1 },
    expectedIndexName: "verificationStatus_1_lastVerifiedAt_-1",
    purpose: "Eliminates COLLSCAN on due diligence and verification alerts query",
  },
  {
    collection: "properties",
    indexSpec: { title: "text", locality: "text", slug: "text" },
    options: { weights: { title: 10, locality: 5, slug: 2 }, name: "property_text_search_idx" },
    expectedIndexName: "property_text_search_idx",
    purpose: "Supports text search without unbounded regex scans",
  },
  {
    collection: "leads",
    indexSpec: { createdAt: -1, status: 1 },
    expectedIndexName: "createdAt_-1_status_1",
    purpose: "Accelerates analytics time-series and funnel date range pipelines",
  },
  {
    collection: "leads",
    indexSpec: { assignedToId: 1, createdAt: -1 },
    expectedIndexName: "assignedToId_1_createdAt_-1",
    purpose: "Accelerates advisor workload and RBAC-scoped queries",
  },
  {
    collection: "sitevisits",
    indexSpec: { createdAt: -1, status: 1 },
    expectedIndexName: "createdAt_-1_status_1",
    purpose: "Accelerates site visit conversion and completion analytics",
  },
  {
    collection: "sitevisits",
    indexSpec: { assignedAdvisorId: 1, createdAt: -1 },
    expectedIndexName: "assignedAdvisorId_1_createdAt_-1",
    purpose: "Accelerates advisor site visit analytics",
  },
  {
    collection: "locations",
    indexSpec: { publicationStatus: 1, sortOrder: 1, name: 1 },
    expectedIndexName: "publicationStatus_1_sortOrder_1_name_1",
    purpose: "Accelerates locations overview and filter dropdown sorting",
  },
];

function validateTargetDatabaseSafety() {
  const dbName = mongoose.connection.db?.databaseName;
  if (!dbName || dbName.trim().length === 0) {
    throw new Error("MIGRATION SAFETY HALT: Connected database name is empty or undefined.");
  }

  const isPerfDb = dbName.endsWith("_perf_test");
  const isAuthorizedProduction = process.env.ALLOW_INDEX_MIGRATION === "true";
  const isAuthorizedPerf = process.env.ALLOW_PERF_TEST_DB === "true" && isPerfDb;

  if (!isAuthorizedProduction && !isAuthorizedPerf) {
    throw new Error(
      `MIGRATION SAFETY HALT: Database '${dbName}' is not authorized for index modification. ` +
      `You must explicitly supply ALLOW_INDEX_MIGRATION=true or ALLOW_PERF_TEST_DB=true (for *_perf_test databases).`
    );
  }
}

export async function runIndexMigration(dryRun = true): Promise<{
  dryRun: boolean;
  totalPlanned: number;
  created: string[];
  alreadyExisting: string[];
  errors: string[];
}> {
  await connectToDatabase();
  validateTargetDatabaseSafety();

  const created: string[] = [];
  const alreadyExisting: string[] = [];
  const errors: string[] = [];

  const modelMap: Record<string, any> = {
    properties: Property,
    leads: Lead,
    sitevisits: SiteVisit,
    locations: Location,
  };

  for (const plan of APPROVED_INDEXES) {
    const model = modelMap[plan.collection];
    if (!model) {
      errors.push(`Unknown collection ${plan.collection}`);
      continue;
    }

    try {
      const existingIndexes = (await model.collection.indexes()) as Array<{ name: string; key: Record<string, unknown> }>;
      
      // Check if matching index already exists (by name or by exact key spec)
      const isExisting = existingIndexes.some((existing) => {
        if (plan.options && (plan.options as any).name && existing.name === (plan.options as any).name) {
          return true;
        }
        if (plan.expectedIndexName && existing.name === plan.expectedIndexName) {
          return true;
        }
        const existingKeys = Object.keys(existing.key);
        const plannedKeys = Object.keys(plan.indexSpec);
        if (existingKeys.length !== plannedKeys.length) return false;
        return plannedKeys.every((k) => (existing.key as any)[k] === (plan.indexSpec as any)[k]);
      });

      const specDesc = `${plan.collection}.${JSON.stringify(plan.indexSpec)}`;

      if (isExisting) {
        alreadyExisting.push(specDesc);
        logger.info(`[Index Exists] ${specDesc}`);
      } else if (dryRun) {
        created.push(`[DRY RUN] Would create ${specDesc} (${plan.purpose})`);
        logger.info(`[Dry Run] Would create index on ${specDesc}`);
      } else {
        await model.collection.createIndex(plan.indexSpec, plan.options || {});
        created.push(`Created ${specDesc}`);
        logger.info(`[Index Created] ${specDesc}`);
      }
    } catch (err: any) {
      errors.push(`Failed on ${plan.collection}: ${err.message}`);
      logger.error(`Error migrating index for ${plan.collection}`, { error: err.message });
    }
  }

  return {
    dryRun,
    totalPlanned: APPROVED_INDEXES.length,
    created,
    alreadyExisting,
    errors,
  };
}

export async function rollbackIndexMigration(dryRun = true): Promise<{
  dryRun: boolean;
  totalPlanned: number;
  dropped: string[];
  skippedNotPresent: string[];
  errors: string[];
}> {
  await connectToDatabase();
  validateTargetDatabaseSafety();

  const dropped: string[] = [];
  const skippedNotPresent: string[] = [];
  const errors: string[] = [];

  const modelMap: Record<string, any> = {
    properties: Property,
    leads: Lead,
    sitevisits: SiteVisit,
    locations: Location,
  };

  for (const plan of APPROVED_INDEXES) {
    const model = modelMap[plan.collection];
    if (!model) continue;

    try {
      const existingIndexes = (await model.collection.indexes()) as Array<{ name: string; key: Record<string, unknown> }>;
      
      const found = existingIndexes.find((existing) => {
        if (plan.options && (plan.options as any).name && existing.name === (plan.options as any).name) {
          return true;
        }
        if (plan.expectedIndexName && existing.name === plan.expectedIndexName) {
          return true;
        }
        const existingKeys = Object.keys(existing.key);
        const plannedKeys = Object.keys(plan.indexSpec);
        if (existingKeys.length !== plannedKeys.length) return false;
        return plannedKeys.every((k) => (existing.key as any)[k] === (plan.indexSpec as any)[k]);
      });

      if (!found) {
        skippedNotPresent.push(`${plan.collection}.${plan.expectedIndexName || JSON.stringify(plan.indexSpec)}`);
      } else if (found.name === "_id_") {
        // Safety guard: never drop primary key index
        continue;
      } else if (dryRun) {
        dropped.push(`[DRY RUN] Would drop ${plan.collection}.${found.name}`);
      } else {
        await model.collection.dropIndex(found.name);
        dropped.push(`Dropped ${plan.collection}.${found.name}`);
        logger.info(`[Index Dropped] ${plan.collection}.${found.name}`);
      }
    } catch (err: any) {
      errors.push(`Failed to drop on ${plan.collection}: ${err.message}`);
      logger.error(`Error dropping index on ${plan.collection}`, { error: err.message });
    }
  }

  return {
    dryRun,
    totalPlanned: APPROVED_INDEXES.length,
    dropped,
    skippedNotPresent,
    errors,
  };
}

if (require.main === module) {
  const isApply = process.argv.includes("--apply");
  const isRollback = process.argv.includes("--rollback");
  const dryRun = !isApply && !isRollback;

  console.log(`\n======================================================`);
  console.log(` Ratiwal Dream Estates — Performance Index Migration`);
  console.log(` Mode: ${isRollback ? "ROLLBACK" : isApply ? "APPLY" : "DRY-RUN (Default Safe)"}`);
  console.log(`======================================================\n`);

  const runPromise = isRollback ? rollbackIndexMigration(false) : runIndexMigration(dryRun);

  runPromise
    .then((res) => {
      console.log("Migration Lifecycle Result:", JSON.stringify(res, null, 2));
      return disconnectFromDatabase();
    })
    .catch((err) => {
      console.error("Migration fatal error:", err.message);
      process.exit(1);
    });
}
