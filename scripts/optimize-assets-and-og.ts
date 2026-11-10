import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const cwd = process.cwd();
const backupDir = path.join(cwd, "public", "images", ".backup");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const largeImages = [
  "public/images/properties/happy-business-park-site.webp",
  "public/images/properties/happy-business-park-layout.webp",
  "public/images/properties/happy-business-park-hero.webp",
  "public/images/properties/vrindavan-viihaar-hero.webp",
  "public/images/properties/happy-business-park-overview.webp",
  "public/images/about/leadership-ethos.jpg",
  "public/images/brand/suresh-kumawat-cutout.png",
  "public/images/brand/advisor-portrait.png",
];

const duplicateSlides = [
  "public/images/hero/slide-1.jpg",
  "public/images/hero/slide-2.jpg",
  "public/images/hero/slide-3.jpg",
  "public/images/hero/slide-4.jpg",
];

async function backupFiles() {
  console.log("--- STEP 1: Backing up original files ---");
  const allToBackup = [...largeImages, ...duplicateSlides, "public/images/brand/og-image.jpg"];
  for (const relPath of allToBackup) {
    const fullPath = path.join(cwd, relPath);
    if (fs.existsSync(fullPath)) {
      const destPath = path.join(backupDir, path.basename(relPath));
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(fullPath, destPath);
        console.log(`Backed up ${relPath} -> ${destPath}`);
      }
    }
  }
}

async function optimizeLargeImages() {
  console.log("\n--- STEP 2: Optimizing 8 large images (>1MB) ---");
  for (const relPath of largeImages) {
    const fullPath = path.join(cwd, relPath);
    if (!fs.existsSync(fullPath)) continue;

    const statsBefore = fs.statSync(fullPath);
    const beforeBytes = statsBefore.size;
    const ext = path.extname(relPath).toLowerCase();
    const inputBuffer = fs.readFileSync(fullPath);
    const meta = await sharp(inputBuffer).metadata();

    let pipeline = sharp(inputBuffer);
    if (ext === ".webp") {
      pipeline = pipeline.webp({ quality: 80, effort: 6 });
    } else if (ext === ".jpg" || ext === ".jpeg") {
      pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
    } else if (ext === ".png") {
      pipeline = pipeline.png({ compressionLevel: 9, effort: 8 });
    }

    const tempPath = fullPath + ".tmp";
    await pipeline.toFile(tempPath);
    const statsAfter = fs.statSync(tempPath);
    const afterBytes = statsAfter.size;

    fs.renameSync(tempPath, fullPath);
    const pct = (((beforeBytes - afterBytes) / beforeBytes) * 100).toFixed(1);
    console.log(
      `Optimized ${relPath}: ${(beforeBytes / 1024 / 1024).toFixed(2)} MB -> ${(afterBytes / 1024).toFixed(1)} KB (-${pct}%) [${meta.width}x${meta.height}]`
    );
  }
}

async function removeDuplicateSlides() {
  console.log("\n--- STEP 3: Removing unused duplicate hero slides ---");
  for (const relPath of duplicateSlides) {
    const fullPath = path.join(cwd, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted duplicate file: ${relPath}`);
    }
  }
}

async function generateBrandedOgImage() {
  console.log("\n--- STEP 4: Generating standard 1200x630 Branded OG Image ---");
  const ogPath = path.join(cwd, "public", "images", "brand", "og-image.jpg");

  // Read SVG logo if available
  const logoSvgPath = path.join(cwd, "public", "images", "brand", "ratiwal-logo-white.svg");
  let logoSvgContent = "";
  if (fs.existsSync(logoSvgPath)) {
    logoSvgContent = fs.readFileSync(logoSvgPath, "utf-8");
  }

  // Construct SVG template for 1200x630
  const svgBanner = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#04121d" />
        <stop offset="45%" stop-color="#071a28" />
        <stop offset="100%" stop-color="#0a2a42" />
      </linearGradient>
      <radialGradient id="glow" cx="80%" cy="25%" r="65%">
        <stop offset="0%" stop-color="#087fc3" stop-opacity="0.28" />
        <stop offset="60%" stop-color="#071a28" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="bottomGlow" cx="20%" cy="85%" r="55%">
        <stop offset="0%" stop-color="#52BDE9" stop-opacity="0.18" />
        <stop offset="70%" stop-color="#071a28" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#087fc3" />
        <stop offset="50%" stop-color="#52BDE9" />
        <stop offset="100%" stop-color="#24D17F" />
      </linearGradient>
    </defs>

    <!-- Deep Navy Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <!-- Ambient Cyan Glows -->
    <rect width="1200" height="630" fill="url(#glow)" />
    <rect width="1200" height="630" fill="url(#bottomGlow)" />

    <!-- Subtle Structural Grid Pattern -->
    <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
      <line x1="100" y1="0" x2="100" y2="630" />
      <line x1="200" y1="0" x2="200" y2="630" />
      <line x1="300" y1="0" x2="300" y2="630" />
      <line x1="400" y1="0" x2="400" y2="630" />
      <line x1="500" y1="0" x2="500" y2="630" />
      <line x1="600" y1="0" x2="600" y2="630" />
      <line x1="700" y1="0" x2="700" y2="630" />
      <line x1="800" y1="0" x2="800" y2="630" />
      <line x1="900" y1="0" x2="900" y2="630" />
      <line x1="1000" y1="0" x2="1000" y2="630" />
      <line x1="1100" y1="0" x2="1100" y2="630" />
      <line x1="0" y1="105" x2="1200" y2="105" />
      <line x1="0" y1="210" x2="1200" y2="210" />
      <line x1="0" y1="315" x2="1200" y2="315" />
      <line x1="0" y1="420" x2="1200" y2="420" />
      <line x1="0" y1="525" x2="1200" y2="525" />
    </g>

    <!-- Outer Card Framing -->
    <rect x="40" y="40" width="1120" height="550" rx="20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
    <rect x="40" y="40" width="1120" height="4" fill="url(#goldAccent)" />

    <!-- Top Badge Strip -->
    <g transform="translate(80, 85)">
      <rect x="0" y="0" width="370" height="34" rx="17" fill="rgba(8,127,195,0.15)" stroke="rgba(82,189,233,0.35)" stroke-width="1" />
      <circle cx="18" cy="17" r="5" fill="#24D17F" />
      <text x="32" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#52BDE9" letter-spacing="1.5">VERIFIED PROPERTY ADVISORY</text>

      <rect x="385" y="0" width="235" height="34" rx="17" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
      <text x="502" y="22" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#CBD5E1" letter-spacing="1">RERA: RAJ/A/2019/983</text>
    </g>

    <!-- Main Typography -->
    <g transform="translate(80, 200)">
      <!-- Main Brand Name -->
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Montserrat', 'Segoe UI', sans-serif" font-size="56" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
        Ratiwal Dream Estates
      </text>

      <!-- Subtitle Headline -->
      <text x="0" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="400" fill="#94A3B8">
        Lifelong Property Consultancy, Built on <tspan fill="#52BDE9" font-weight="600">Trust &amp; Transparency</tspan>.
      </text>

      <!-- Core Value Points Strip -->
      <g transform="translate(0, 115)">
        <!-- Pill 1 -->
        <rect x="0" y="0" width="280" height="48" rx="12" fill="rgba(7,26,40,0.8)" stroke="rgba(82,189,233,0.25)" stroke-width="1" />
        <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#F1F5F9">✓ 100% Legal Due Diligence</text>

        <!-- Pill 2 -->
        <rect x="295" y="0" width="280" height="48" rx="12" fill="rgba(7,26,40,0.8)" stroke="rgba(82,189,233,0.25)" stroke-width="1" />
        <text x="315" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#F1F5F9">✓ JDA &amp; RERA Sanctioned Plots</text>

        <!-- Pill 3 -->
        <rect x="590" y="0" width="310" height="48" rx="12" fill="rgba(7,26,40,0.8)" stroke="rgba(82,189,233,0.25)" stroke-width="1" />
        <text x="610" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="600" fill="#F1F5F9">✓ Jaipur • Ajmer • Kishangarh</text>
      </g>
    </g>

    <!-- Bottom Metadata Bar -->
    <g transform="translate(80, 520)">
      <line x1="0" y1="0" x2="1040" y2="0" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <text x="0" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="15" font-weight="700" fill="#52BDE9" letter-spacing="0.5">
        www.ratiwaldreamestates.com
      </text>
      <text x="1040" y="35" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="14" font-weight="500" fill="#64748B">
        Direct Landowner Pricing • Accompanied Site Visits
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svgBanner))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(ogPath);

  const stats = fs.statSync(ogPath);
  const meta = await sharp(ogPath).metadata();
  console.log(`Generated ${ogPath}: ${meta.width}x${meta.height} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function run() {
  await backupFiles();
  await optimizeLargeImages();
  await removeDuplicateSlides();
  await generateBrandedOgImage();
  console.log("\nAsset optimization completed successfully!");
}

run().catch((err) => {
  console.error("Asset optimization error:", err);
  process.exit(1);
});

