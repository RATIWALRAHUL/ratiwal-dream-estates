/**
 * Regression tests for the SEO metadata text helpers.
 *
 * Run: npx tsx scripts/test-seo-metadata.ts
 *
 * Guards against a past bug where a lost backslash (`/s+/g` instead of `/\s+/g`)
 * silently replaced every letter "s" in generated descriptions with a space
 * ("re idential", "Riya at Paradi e II", "Ki hangarh").
 */
import { fitMetaText, pickFittingText, getMetadata } from "../src/lib/seo";
import { homeCopy, catalogCopy, locationsCopy } from "../src/lib/seo-copy";
import { summarizeLocations } from "../src/lib/utils/listing-summary";

let failures = 0;
function check(name: string, condition: boolean, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

const NAMES = [
  "Riyasat Paradise II in Vatika, Jaipur: residential plots from 100 to 250 Sq. Yds. Price on Request. View documents, connectivity and book a site visit.",
  "Happy Business Park in Gagwana, Ajmer: commercial plots from 106 to 200 Sq. Yds. Price on Request. Book a site visit.",
  "Aero Crystal in Kishangarh B, Kishangarh: residential plots from 100 to 200 Sq. Yds. Price on Request.",
  "Explore residential and commercial plots, micro-markets, infrastructure and buyer guidance for Navi Mumbai, Maharashtra.",
];

// 1. Letters are never altered: output must equal the input with only whitespace normalised.
for (const text of NAMES) {
  check(`pickFittingText keeps every character: "${text.slice(0, 34)}…"`, pickFittingText([text]) === text);
  check(`fitMetaText keeps every character:     "${text.slice(0, 34)}…"`, fitMetaText(text) === text);
}
check("pickFittingText only normalises whitespace", pickFittingText(["  a   b \n c  "]) === "a b c");
check("letter 's' survives", pickFittingText(["assess the sites"]) === "assess the sites");

// 2. Picks the first candidate that fits, unchanged; falls back to a trimmed whole-word cut.
const short = "Short complete sentence.";
const long = "Long ".repeat(50).trim();
check("picks first fitting candidate", pickFittingText([long, short]) === short);
const cut = pickFittingText([long]);
check("fallback is <= 160 and ends with ellipsis", cut.length <= 160 && cut.endsWith("…"), `len=${cut.length}`);
check("fallback never splits a word", /(^| )Long( Long)*…$/.test(cut), cut.slice(-20));

// 3. Index-page copy: complete names, within limits.
const locs = [
  { name: "Ajmer", state: "Rajasthan" }, { name: "Bhiwadi", state: "Rajasthan / NCR" }, { name: "Jaipur", state: "Rajasthan" },
  { name: "Kishangarh", state: "Rajasthan" }, { name: "Navi Mumbai", state: "Maharashtra" }, { name: "Panvel", state: "Maharashtra" },
];
const props = [...Array(4).fill({ city: "Jaipur" }), ...Array(3).fill({ city: "Ajmer" }), ...Array(2).fill({ city: "Kishangarh" })];
const summary = summarizeLocations(locs, props);
for (const [name, copy] of [["home", homeCopy(summary)], ["catalog", catalogCopy(summary)], ["locations", locationsCopy(summary)]] as const) {
  const full = `${copy.title} | Ratiwal Dream Estates`;
  check(`${name}: title <= 60`, full.length <= 60, `(${full.length})`);
  check(`${name}: description <= 160`, copy.description.length <= 160, `(${copy.description.length})`);
  check(`${name}: no double spaces / stray single letters`, !/ {2}/.test(copy.description) && !/\b[a-z] [a-z]{2,}\b/.test(copy.title + " " + copy.description.replace(/\ba\b/g, "A")));
  check(`${name}: contains "Jaipur" spelled correctly`, /Jaipur/.test(copy.title + copy.description));
}

// 4. getMetadata output.
const md = getMetadata({ title: "Test", description: "A description.", slug: "/x" });
check("canonical uses www domain", (md.alternates as { canonical: string }).canonical === "https://www.ratiwaldreamestates.com/x");
const priv = getMetadata({ title: "Private", noIndex: true });
check("noindex page without slug has no canonical", !priv.alternates);
const root = getMetadata({ omitCanonical: true, omitRobots: true });
check("root metadata omits canonical and robots", !root.alternates && !root.robots);

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
