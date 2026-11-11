/**
 * DRY-RUN ONLY — stale canonical database field audit.
 *
 * Read-only: uses find()/countDocuments() exclusively. This script has no write
 * path and cannot modify the database. See SEO_CANONICAL_DATABASE_CLEANUP_PLAN.md
 * for the (separate, owner-approved) apply procedure.
 *
 * Usage:
 *   npx tsx scripts/dry-run-canonical-cleanup.ts
 *   npx tsx scripts/dry-run-canonical-cleanup.ts --backup-dir backups/seo-canonical-2026-11-11
 *     (--backup-dir only writes a local JSON snapshot of the affected `seo`
 *      subdocuments; it still never writes to MongoDB.)
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
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

const PREFERRED_ORIGIN = "https://www.ratiwaldreamestates.com";
const STALE_NEEDLE = /dreamestate/i; // matches dreamestate.in and the bare brand "DreamEstate"
const COLLECTIONS = ["properties", "locations", "mediaassets", "organizationsettings"];

type Hit = { path: string; value: string };

function walk(node: unknown, path: string, hits: Hit[]) {
  if (typeof node === "string") {
    if (STALE_NEEDLE.test(node)) hits.push({ path, value: node });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, hits));
  } else if (node && typeof node === "object" && !("_bsontype" in node)) {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      walk(v, path ? `${path}.${k}` : k, hits);
    }
  }
}

async function run() {
  const backupIdx = process.argv.indexOf("--backup-dir");
  const backupDir = backupIdx > -1 ? process.argv[backupIdx + 1] : null;

  const dbName = process.env.MONGODB_DB_NAME || "ratiwal_dream_estates";
  await mongoose.connect(process.env.MONGODB_URI!, { dbName, serverSelectionTimeoutMS: 20000 });
  console.log(`DRY RUN — connected read-only intent to database: ${dbName}\n`);
  const db = mongoose.connection.db!;

  // 1) Every 'dreamestate' string in candidate collections, CLASSIFIED.
  //    IMAGEKIT_PATH is the legitimate `/dreamestate/...` media folder (CLAUDE.md §1) — NOT stale.
  console.log("== A. Scan: 'dreamestate' strings, classified ==");
  const classify = (v: string) => {
    if (/ik\.imagekit\.io\/[^/]+\/dreamestate\//i.test(v) || /^\/?dreamestate\//i.test(v)) return "IMAGEKIT_PATH (legit)";
    if (/@dreamestate\.in/i.test(v)) return "PLACEHOLDER_EMAIL";
    if (/dreamestate\.in/i.test(v)) return "PLACEHOLDER_DOMAIN";
    return "OTHER_BRAND_STRING";
  };
  for (const c of COLLECTIONS) {
    const docs = await db.collection(c).find({}).toArray();
    const tally = new Map<string, { n: number; samples: Set<string> }>();
    for (const d of docs) {
      const hits: Hit[] = [];
      walk(d, "", hits);
      for (const h of hits) {
        const key = `${classify(h.value)} :: ${h.path.replace(/\[\d+\]/g, "[]")}`;
        const e = tally.get(key) || { n: 0, samples: new Set<string>() };
        e.n++;
        if (e.samples.size < 2) e.samples.add(h.value.length > 110 ? h.value.slice(0, 110) + "…" : h.value);
        tally.set(key, e);
      }
    }
    console.log(`${c}: ${docs.length} docs`);
    for (const [k, e] of [...tally].sort()) {
      console.log(`   ${k}  x${e.n}`);
      if (!k.startsWith("IMAGEKIT_PATH")) for (const s of e.samples) console.log(`        e.g. ${s}`);
    }
  }

  // 2) Exact fix list for properties.seo.canonicalUrl
  console.log("\n== B. Proposed changes: properties.seo.canonicalUrl ==");
  const props = await db
    .collection("properties")
    .find({})
    .project({ slug: 1, title: 1, publicationStatus: 1, seo: 1 })
    .toArray();

  const changes: Array<{ _id: string; slug: string; field: string; before: string | null; after: string }> = [];
  for (const p of props) {
    const before: string | null = p.seo?.canonicalUrl ?? null;
    const after = `${PREFERRED_ORIGIN}/properties/${p.slug}`;
    const needsFix = before !== after;
    console.log(
      `${needsFix ? "CHANGE" : "OK    "} ${String(p._id)}  ${p.slug}  [${p.publicationStatus}]\n         before: ${before}\n         after : ${after}`
    );
    if (needsFix) changes.push({ _id: String(p._id), slug: p.slug, field: "seo.canonicalUrl", before, after });
  }
  console.log(`\nSummary: ${changes.length} of ${props.length} property docs would change (0 written).`);

  // 3) Sibling fields on the same subdocument, for context
  console.log("\n== C. seo subdocument keys per property (context) ==");
  for (const p of props) {
    const s = p.seo || {};
    console.log(
      `${p.slug}: keys=[${Object.keys(s).join(",")}] metaTitle=${JSON.stringify(s.metaTitle)} ogImageUrl=${s.ogImageUrl ? "set" : "empty"} noIndex=${s.noIndex}`
    );
  }

  if (backupDir) {
    mkdirSync(backupDir, { recursive: true });
    const snapshot = props.map((p) => ({ _id: String(p._id), slug: p.slug, seo: p.seo ?? null }));
    const file = resolve(backupDir, "properties-seo-before.json");
    writeFileSync(file, JSON.stringify({ takenAt: new Date().toISOString(), dbName, collection: "properties", docs: snapshot }, null, 2));
    console.log(`\nLocal backup snapshot written: ${file}`);
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
