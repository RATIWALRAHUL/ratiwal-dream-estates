#!/usr/bin/env node
/**
 * audit-orphans.ts
 * 
 * Identifies and reports MediaAsset records that are PENDING/UPLOADING
 * beyond the configured timeout (orphaned uploads) and optionally
 * finds assets with no associated owner (detached).
 * 
 * Usage:
 *   npm run audit:orphans
 *   npm run audit:orphans -- --fix       (marks orphans as DELETED)
 *   npm run audit:orphans -- --dry-run   (default — no changes)
 */

import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure .env.local is loaded via `tsx --env-file=.env.local scripts/audit-orphans.ts`
// or set MONGODB_URI in your shell before running.

const PENDING_TIMEOUT_HOURS = 4;
const DRY_RUN = !process.argv.includes("--fix");

const MediaAssetSchema = new mongoose.Schema({
  ownerType: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  assetCategory: String,
  purpose: String,
  providerKey: String,
  providerFileId: String,
  status: String,
  safeDisplayName: String,
  uploadedByEmail: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
}, { timestamps: true });

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set. Check your .env.local file.");
    process.exit(1);
  }

  console.log("🔍 Ratiwal Dream Estates — Media Asset Orphan Audit");
  console.log(`📋 Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "FIX MODE (will mark as DELETED)"}`);
  console.log("─".repeat(60));

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB\n");

  const MediaAsset = mongoose.models.MediaAsset || mongoose.model("MediaAsset", MediaAssetSchema);

  const cutoffDate = new Date(Date.now() - PENDING_TIMEOUT_HOURS * 60 * 60 * 1000);

  // 1. Find orphaned PENDING/UPLOADING assets beyond timeout
  const stalePending = await MediaAsset.find({
    status: { $in: ["PENDING", "UPLOADING"] },
    createdAt: { $lt: cutoffDate },
    deletedAt: { $exists: false },
  }).lean();

  console.log(`🔄 Stale PENDING/UPLOADING assets (older than ${PENDING_TIMEOUT_HOURS}h): ${stalePending.length}`);

  for (const asset of stalePending) {
    const age = Math.round((Date.now() - new Date(asset.createdAt as Date).getTime()) / 3600000);
    console.log(`  • [${asset._id}] ${asset.safeDisplayName} — ${age}h old — ${asset.ownerType}/${asset.ownerId}`);
  }

  // 2. Find REJECTED assets that haven't been cleaned up
  const rejectedOld = await MediaAsset.find({
    status: "REJECTED",
    deletedAt: { $exists: false },
    createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // 7 days
  }).lean();

  console.log(`\n❌ Old REJECTED assets (>7 days, not cleaned up): ${rejectedOld.length}`);
  for (const asset of rejectedOld) {
    console.log(`  • [${asset._id}] ${asset.safeDisplayName} — ${asset.ownerType}/${asset.ownerId}`);
  }

  // 3. Find assets with providerKey = "pending" (stuck pre-auth)
  const stuckPending = await MediaAsset.find({
    providerKey: "pending",
    status: { $nin: ["DELETED", "REJECTED"] },
    createdAt: { $lt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours
  }).lean();

  console.log(`\n🔧 Assets stuck with providerKey="pending" (>2h): ${stuckPending.length}`);
  for (const asset of stuckPending) {
    console.log(`  • [${asset._id}] ${asset.safeDisplayName}`);
  }

  // 4. Summary
  const totalOrphans = stalePending.length + stuckPending.length;
  console.log("\n" + "─".repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Stale PENDING/UPLOADING: ${stalePending.length}`);
  console.log(`   Old REJECTED (cleanup needed): ${rejectedOld.length}`);
  console.log(`   Stuck with providerKey=pending: ${stuckPending.length}`);
  console.log(`   Total orphan candidates: ${totalOrphans}`);

  if (!DRY_RUN && totalOrphans > 0) {
    console.log("\n🗑️  Marking orphans as DELETED...");
    const idsToDelete = [
      ...stalePending.map((a) => a._id),
      ...stuckPending.map((a) => a._id),
    ];

    const result = await MediaAsset.updateMany(
      { _id: { $in: idsToDelete } },
      { status: "DELETED", deletedAt: new Date() }
    );
    console.log(`✅ Marked ${result.modifiedCount} assets as DELETED.`);
  } else if (DRY_RUN && totalOrphans > 0) {
    console.log("\n💡 Run with --fix to mark these orphans as DELETED.");
  }

  await mongoose.disconnect();
  console.log("\n✅ Audit complete. Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Audit failed:", err.message);
  process.exit(1);
});
