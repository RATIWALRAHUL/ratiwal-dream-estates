/**
 * Tests for the Phase 4A technical SEO scanner. NO network and NO database: the scan
 * engine runs against an in-memory fake site through an injected fetcher.
 *
 * Run: npx tsx --conditions=react-server scripts/test-seo-technical.ts
 */
import {
  checkJsonLd,
  decodeEntities,
  extractPageFacts,
  isAllowedByRobots,
  isValidLastmod,
  parseRobots,
  parseSitemapXml,
} from "../src/lib/seo-analytics/html-checks";
import {
  DEFAULT_LIMITS,
  normalizeForCompare,
  runTechnicalScan,
  type FetchResult,
  type Fetcher,
  type TechIssueType,
} from "../src/lib/seo-analytics/tech-scanner";
import { planIssueChanges, type StoredIssueRef } from "../src/lib/seo-analytics/issue-diff";
import { buildAllowedHosts, createAllowListedFetcher } from "../src/lib/seo-analytics/tech-fetcher";

let failures = 0;
function check(name: string, condition: boolean, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

const BASE = "https://www.example.test";

// ── Parsers ──────────────────────────────────────────────────────────────────
check("decodeEntities", decodeEntities("a &amp; b &quot;c&quot; &#39;d&#39;") === `a & b "c" 'd'`);

const facts = extractPageFacts(`<!doctype html><html><head>
  <title>Plots &amp; Land in Jaipur | Brand</title>
  <meta name="description" content="A description with &quot;quotes&quot;">
  <meta name="robots" content="NOINDEX, follow">
  <meta property="og:image" content="https://www.example.test/og.jpg">
  <link rel="canonical" href="https://www.example.test/p">
  <link rel="alternate canonical" href="https://www.example.test/q">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
  </head><body><h1>One</h1><h1 class="x">Two</h1>
  <a href="/a">A</a> <a href='https://x.test/b'>B</a> <a name="no-href">C</a>
  <img src="/i.jpg" alt=""><img src="data:image/png;base64,AAAA"></body></html>`);
check("title decoded", facts.title === "Plots & Land in Jaipur | Brand");
check("description decoded", facts.descriptions[0] === 'A description with "quotes"');
check("robots meta lower-cased", facts.robotsMeta[0] === "noindex, follow");
check("og:image", facts.ogImages[0] === "https://www.example.test/og.jpg");
check("canonicals (rel token list)", facts.canonicals.length === 2);
check("h1 count", facts.h1Count === 2);
check("links skip anchors without href", facts.links.length === 2 && facts.links[1] === "https://x.test/b");
check("images skip data URIs", facts.images.length === 1 && facts.images[0] === "/i.jpg");
check("json-ld captured", facts.jsonLd.length === 1);
check("no title -> null", extractPageFacts("<html></html>").title === null);

check("jsonld valid", checkJsonLd('{"@context":"x","@type":"Thing"}').valid);
check("jsonld invalid JSON", !checkJsonLd('{"@type": "Thing",}').valid);
check("jsonld @graph with types", checkJsonLd('{"@graph":[{"@type":"A"},{"@type":"B"}]}').hasTypes);
check("jsonld node without @type", !checkJsonLd('{"@graph":[{"@type":"A"},{"name":"x"}]}').hasTypes);
check("jsonld top-level array", checkJsonLd('[{"@type":"A"}]').hasTypes);

const sm = parseSitemapXml(`<?xml version="1.0"?><urlset xmlns="x"><url><loc>https://a.test/1?x=1&amp;y=2</loc><lastmod>2026-11-01</lastmod></url><url><loc>https://a.test/2</loc></url></urlset>`);
check("sitemap entries + entity decode", sm.entries.length === 2 && sm.entries[0].loc === "https://a.test/1?x=1&y=2" && sm.errors.length === 0);
check("sitemap lastmod", sm.entries[0].lastmod === "2026-11-01");
check("sitemap not xml flagged", parseSitemapXml("<html>nope</html>").errors.length > 0);
check("sitemap missing loc flagged", parseSitemapXml("<urlset><url></url></urlset>").entries.length === 0);
check("sitemap index detected", parseSitemapXml("<sitemapindex><sitemap><loc>https://a.test/s1.xml</loc></sitemap></sitemapindex>").isIndex);
check("lastmod validator", isValidLastmod("2026-11-01") && isValidLastmod("2026-11-01T10:00:00Z") && !isValidLastmod("yesterday") && !isValidLastmod("2026-13-45"));

const rules = parseRobots(`User-agent: *\nAllow: /\nDisallow: /dashboard\nDisallow: /*.pdf$\nAllow: /dashboard/public\nSitemap: ${BASE}/sitemap.xml\n\nUser-agent: Googlebot-Image\nDisallow: /img`);
check("robots sitemaps", rules.sitemaps[0] === `${BASE}/sitemap.xml`);
check("robots: prefix disallow", !isAllowedByRobots(rules, "Googlebot", "/dashboard/x"));
check("robots: longer Allow wins", isAllowedByRobots(rules, "Googlebot", "/dashboard/public/page"));
check("robots: wildcard + $", !isAllowedByRobots(rules, "Googlebot", "/a/b.pdf") && isAllowedByRobots(rules, "Googlebot", "/a/b.pdf?x=1"));
check("robots: default allow", isAllowedByRobots(rules, "Googlebot", "/properties"));
check("robots: specific agent group", !isAllowedByRobots(rules, "Googlebot-Image", "/img/a.png") && isAllowedByRobots(rules, "Googlebot", "/img/a.png"));
check("robots: empty Disallow allows", isAllowedByRobots(parseRobots("User-agent: *\nDisallow:"), "Googlebot", "/anything"));
check("robots: Disallow /_next/ blocks assets", !isAllowedByRobots(parseRobots("User-agent: *\nDisallow: /_next/"), "Googlebot", "/_next/static/chunks/app.js"));

check("normalizeForCompare strips trailing slash/query/hash", normalizeForCompare(`${BASE}/a/?x=1#h`) === `${BASE}/a`);
check("normalizeForCompare keeps root", normalizeForCompare(`${BASE}/`) === `${BASE}/`);

// ── Fake site harness ────────────────────────────────────────────────────────
type Spec = Partial<FetchResult> & { html?: string };
function res(spec: Spec | number): FetchResult {
  if (typeof spec === "number") return { status: spec, headers: {} };
  const { html, ...rest } = spec;
  return {
    status: 200,
    headers: html !== undefined ? { "content-type": "text/html; charset=utf-8" } : {},
    ...(html !== undefined ? { body: html } : {}),
    ...rest,
  };
}
function redirect(to: string, status = 301): Spec {
  return { status, headers: {}, location: to };
}
function page(o: {
  title?: string | null; desc?: string | null; canonical?: string | null; h1?: number;
  og?: string | null; ld?: string[]; links?: string[]; imgs?: string[]; robots?: string;
} = {}): string {
  const t = o.title === undefined ? "Plots for Sale in Jaipur | Example" : o.title;
  const d = o.desc === undefined ? "A sufficiently long and unique description about this particular page of the example site." : o.desc;
  return `<html><head>${t ? `<title>${t}</title>` : ""}${d ? `<meta name="description" content="${d}">` : ""}${
    o.canonical === null ? "" : `<link rel="canonical" href="${o.canonical ?? ""}">`
  }${o.og === null ? "" : `<meta property="og:image" content="${o.og ?? `${BASE}/og.jpg`}">`}${
    o.robots ? `<meta name="robots" content="${o.robots}">` : ""
  }${(o.ld ?? ['{"@context":"https://schema.org","@type":"WebSite"}']).map((j) => `<script type="application/ld+json">${j}</script>`).join("")}</head><body>${
    Array.from({ length: o.h1 ?? 1 }, () => "<h1>Heading</h1>").join("")
  }${(o.links ?? []).map((l) => `<a href="${l}">l</a>`).join("")}${(o.imgs ?? []).map((i) => `<img src="${i}" alt="">`).join("")}</body></html>`;
}

function makeFetcher(site: Record<string, Spec | number>, stats = { inFlight: 0, max: 0, calls: 0, log: [] as string[] }): Fetcher & { stats: typeof stats } {
  const f = (async (url: string, o: { method: "GET" | "HEAD"; readBody: boolean }) => {
    stats.calls++;
    stats.log.push(`${o.method} ${url}`);
    stats.inFlight++;
    stats.max = Math.max(stats.max, stats.inFlight);
    await new Promise((r) => setTimeout(r, 3));
    stats.inFlight--;
    const hit = site[`${o.method} ${url}`] ?? site[url];
    if (hit === undefined) return { status: 404, headers: {} } as FetchResult;
    const r = res(hit);
    if (o.method === "HEAD") delete r.body;
    return r;
  }) as Fetcher & { stats: typeof stats };
  f.stats = stats;
  return f;
}
const limits = () => ({ ...DEFAULT_LIMITS, deadline: Date.now() + 30_000 });
const types = (r: { findings: Array<{ type: TechIssueType }> }) => new Set(r.findings.map((f) => f.type));

const ROBOTS_OK = { headers: { "content-type": "text/plain" }, status: 200, body: `User-agent: *\nAllow: /\nDisallow: /dashboard\nSitemap: ${BASE}/sitemap.xml\n` };
const sitemapXml = (urls: string[], extra = "") => `<?xml version="1.0"?><urlset>${urls.map((u) => `<url><loc>${u}</loc><lastmod>2026-11-01</lastmod></url>`).join("")}${extra}</urlset>`;

async function main() {
  // ── Healthy site → no findings ─────────────────────────────────────────────
  const healthy: Record<string, Spec | number> = {
    [`${BASE}/robots.txt`]: ROBOTS_OK,
    [`${BASE}/sitemap.xml`]: { status: 200, headers: { "content-type": "application/xml" }, body: sitemapXml([`${BASE}/`, `${BASE}/properties`, `${BASE}/about`]) },
    "https://example.test/": redirect(`${BASE}/`, 308),
    [`${BASE}/`]: { html: page({ title: "Real Estate Consultant in Jaipur | Example", desc: "Home page description that is long enough and also unique to the home page of this example website.", canonical: `${BASE}/`, links: ["/properties", "/about", "mailto:a@b.test", "#top", "/_next/static/x.js", "https://external.test/x"], imgs: ["/_next/image?url=%2Fhero.jpg&w=640&q=75", "/_next/image?url=https%3A%2F%2Fik.imagekit.io%2Fx.jpg&w=640&q=75"] }) },
    [`${BASE}/properties`]: { html: page({ title: "Plots for Sale in Jaipur | Example", desc: "Properties catalog description that is long enough and unique to the properties page on the site.", canonical: `${BASE}/properties` }) },
    [`${BASE}/about`]: { html: page({ title: "About the Advisor | Example", desc: "About page description that is long enough and unique to the about page on this example website.", canonical: `${BASE}/about/` }) },
    [`HEAD ${BASE}/hero.jpg`]: 200,
    [`HEAD ${BASE}/og.jpg`]: 200,
  };
  const fh = makeFetcher(healthy);
  const rh = await runTechnicalScan({ baseUrl: BASE, fetcher: fh, limits: limits() });
  check("healthy site: zero findings", rh.findings.length === 0, rh.findings.map((f) => f.type).join(","));
  check("healthy site: completed with all 3 pages", rh.completed && rh.urlsChecked === 3 && rh.urlsPlanned === 3);
  check("healthy site: canonical with trailing slash is not a mismatch", !types(rh).has("CANONICAL_MISMATCH"));
  check("healthy site: concurrency never exceeds 3", fh.stats.max <= 3, `max=${fh.stats.max}`);
  check("healthy site: external/mailto/anchor/_next links not requested", !fh.stats.log.some((l) => /external\.test|mailto|_next\/static/.test(l)));
  check("healthy site: image optimiser endpoint is NOT requested (checks underlying file)", !fh.stats.log.some((l) => l.includes("/_next/image")) && fh.stats.log.includes(`HEAD ${BASE}/hero.jpg`));
  check("healthy site: remote CDN image is not fetched", !fh.stats.log.some((l) => l.includes("imagekit")));
  check("healthy site: only first-party hosts requested", fh.stats.log.every((l) => /https:\/\/(www\.)?example\.test/.test(l)));

  // ── Defective site → each defect detected ──────────────────────────────────
  const bad: Record<string, Spec | number> = {
    [`${BASE}/robots.txt`]: { status: 200, headers: {}, body: "User-agent: *\nDisallow: /_next/\nDisallow: /g\n" },
    [`${BASE}/sitemap.xml`]: {
      status: 200, headers: {},
      body: sitemapXml(
        [`${BASE}/a`, `${BASE}/b`, `${BASE}/c`, `${BASE}/d`, `${BASE}/e`, `${BASE}/f`, `${BASE}/g`, `${BASE}/loop`, `${BASE}/a`, "http://www.example.test/insecure", "https://other.test/off"],
        `<url><loc>${BASE}/badlastmod</loc><lastmod>yesterday</lastmod></url>`
      ),
    },
    "https://example.test/": { status: 200, headers: {}, body: "ok" },
    [`${BASE}/a`]: 404,
    [`${BASE}/b`]: redirect(`${BASE}/b2`),
    [`${BASE}/b2`]: { html: page({ title: "Redirect Target Page Title Here", desc: "A redirect target description that is long enough to be valid and also unique for this test.", canonical: `${BASE}/b2` }) },
    [`${BASE}/c`]: { html: page({ title: "Page C Has Many Defects Inside | Ex", desc: null, canonical: `${BASE}/other`, h1: 2, og: "/relative-og.jpg", robots: "noindex, follow", ld: ['{"@type": "Thing",}'] }) },
    [`${BASE}/d`]: { html: page({ title: "Shared Title For Two Pages Here", desc: "Shared description text which is long enough to be valid but appears on two pages of the site.", canonical: null }) },
    [`${BASE}/e`]: { html: page({ title: "Shared Title For Two Pages Here", desc: "Shared description text which is long enough to be valid but appears on two pages of the site.", canonical: `${BASE}/e` }) },
    [`${BASE}/f`]: {
      status: 200, headers: { "content-type": "text/html", "x-robots-tag": "noindex" },
      body: page({ title: null, canonical: `${BASE}/f`, desc: "Page F description which is long enough and unique to this page for the purposes of the test.", links: ["/missing", "/old", "/chain1"], imgs: ["/img/gone.jpg"], og: `${BASE}/gone-og.jpg`, h1: 0 }),
    },
    [`${BASE}/g`]: { html: page({ title: "Page G Blocked By Robots Txt File", desc: "Page G description that is long enough and unique to the page which robots txt blocks.", canonical: `${BASE}/g` }) },
    [`${BASE}/loop`]: redirect(`${BASE}/loop2`),
    [`${BASE}/loop2`]: redirect(`${BASE}/loop`),
    [`HEAD ${BASE}/missing`]: 404,
    [`HEAD ${BASE}/old`]: redirect(`${BASE}/new`),
    [`HEAD ${BASE}/new`]: 200,
    [`HEAD ${BASE}/chain1`]: redirect(`${BASE}/chain2`),
    [`HEAD ${BASE}/chain2`]: redirect(`${BASE}/chain3`),
    [`HEAD ${BASE}/chain3`]: 200,
    [`HEAD ${BASE}/img/gone.jpg`]: 404,
    [`HEAD ${BASE}/gone-og.jpg`]: 404,
  };
  const rb = await runTechnicalScan({ baseUrl: BASE, fetcher: makeFetcher(bad), limits: limits() });
  const got = types(rb);
  const expected: TechIssueType[] = [
    "ROBOTS_BLOCKS_ASSETS", "ROBOTS_NO_SITEMAP", "ROBOTS_BLOCKS_URL", "SITEMAP_DUPLICATE_URL", "SITEMAP_WRONG_ORIGIN", "SITEMAP_BAD_LASTMOD",
    "NON_WWW_NO_REDIRECT", "PAGE_ERROR", "SITEMAP_URL_REDIRECTS", "CANONICAL_MISMATCH", "CANONICAL_MISSING", "DESCRIPTION_MISSING", "H1_MULTIPLE", "H1_MISSING",
    "OG_IMAGE_INVALID", "UNEXPECTED_NOINDEX", "JSONLD_INVALID", "DUPLICATE_TITLE", "DUPLICATE_DESCRIPTION", "TITLE_MISSING", "BROKEN_INTERNAL_LINK",
    "INTERNAL_LINK_REDIRECTS", "REDIRECT_CHAIN", "IMAGE_BROKEN", "REDIRECT_LOOP",
  ];
  for (const t of expected) check(`defect detected: ${t}`, got.has(t));
  const by = (t: TechIssueType) => rb.findings.filter((f) => f.type === t);
  check("duplicate title reported on BOTH pages", by("DUPLICATE_TITLE").length === 2);
  check("noindex found via meta AND header (2 distinct findings)", by("UNEXPECTED_NOINDEX").length === 2);
  check("broken link points at the target and names its source", by("BROKEN_INTERNAL_LINK")[0]?.message.includes("linked from /f") === true);
  check("sitemap http:// and off-site URLs flagged, not fetched", by("SITEMAP_WRONG_ORIGIN").length === 2);
  check("finding keys are stable and unique", new Set(rb.findings.map((f) => f.key)).size === rb.findings.length);
  check("bad site scan still completes (defects are not scan failures)", rb.completed);
  check("every finding has a severity", rb.findings.every((f) => ["HIGH", "MEDIUM", "LOW"].includes(f.severity)));

  // ── Limits / failure modes ────────────────────────────────────────────────
  const rBudget = await runTechnicalScan({ baseUrl: BASE, fetcher: makeFetcher(healthy), limits: { ...limits(), maxRequests: 5 } });
  check("request budget stops the scan and marks it incomplete", !rBudget.completed && rBudget.stoppedReason === "REQUEST_BUDGET" && rBudget.requests <= 5, `requests=${rBudget.requests}`);
  const rDeadline = await runTechnicalScan({ baseUrl: BASE, fetcher: makeFetcher(healthy), limits: { ...limits(), deadline: Date.now() - 1 } });
  check("deadline stops the scan and marks it incomplete", !rDeadline.completed && rDeadline.stoppedReason === "DEADLINE");
  check("a budget/deadline stop creates NO false findings", rDeadline.findings.length === 0 && rBudget.findings.every((f) => f.type !== "ROBOTS_TXT_UNREACHABLE" && f.type !== "SITEMAP_UNREACHABLE" && f.type !== "PAGE_UNREACHABLE"));
  const rNoSitemap = await runTechnicalScan({ baseUrl: BASE, fetcher: makeFetcher({ [`${BASE}/robots.txt`]: ROBOTS_OK }), limits: limits() });
  check("missing sitemap -> SITEMAP_UNREACHABLE, incomplete", types(rNoSitemap).has("SITEMAP_UNREACHABLE") && !rNoSitemap.completed && rNoSitemap.stoppedReason === "SITEMAP_UNAVAILABLE");
  const rTimeout = await runTechnicalScan({
    baseUrl: BASE,
    fetcher: makeFetcher({ ...healthy, [`${BASE}/about`]: { status: 0, headers: {}, error: "TIMEOUT" } }),
    limits: limits(),
  });
  check("timeouts are reported as PAGE_UNREACHABLE", types(rTimeout).has("PAGE_UNREACHABLE"));
  const rOffsite = await runTechnicalScan({
    baseUrl: BASE,
    fetcher: makeFetcher({ ...healthy, [`${BASE}/about`]: redirect("https://evil.example/landing") }),
    limits: limits(),
  });
  check("redirect to another host is flagged and NOT followed", types(rOffsite).has("SITEMAP_URL_REDIRECTS") && true);

  // ── Issue register diff ───────────────────────────────────────────────────
  const F = (key: string) => ({ key, type: "PAGE_ERROR" as const, severity: "HIGH" as const, url: `${BASE}/${key}`, message: "m" });
  const t0 = new Date("2026-11-01T00:00:00Z");
  const existing: StoredIssueRef[] = [
    { issueKey: "still-open", status: "OPEN", firstRunId: "run1", firstSeenAt: t0, timesSeen: 2 },
    { issueKey: "fixed", status: "OPEN", firstRunId: "run1", firstSeenAt: t0, timesSeen: 1 },
    { issueKey: "reopened", status: "RESOLVED", firstRunId: "run0", firstSeenAt: t0, timesSeen: 5 },
  ];
  const planDone = planIssueChanges({ existing, found: [F("still-open"), F("reopened"), F("brand-new"), F("brand-new")], completed: true, runId: "run3", now: new Date() });
  const w = (k: string) => planDone.writes.find((x) => x.finding.key === k);
  check("diff: still-open is ONGOING, history kept, count incremented", w("still-open")?.state === "ONGOING" && w("still-open")?.firstRunId === "run1" && w("still-open")?.timesSeen === 3);
  check("diff: re-appearing resolved issue is NEW again", w("reopened")?.state === "NEW" && w("reopened")?.firstRunId === "run3" && w("reopened")?.timesSeen === 1);
  check("diff: brand-new is NEW and duplicates are collapsed", w("brand-new")?.state === "NEW" && planDone.writes.filter((x) => x.finding.key === "brand-new").length === 1);
  check("diff: absent open issue is resolved on a COMPLETED scan", planDone.resolveKeys.length === 1 && planDone.resolveKeys[0] === "fixed");
  check("diff: counts", planDone.newCount === 2 && planDone.ongoingCount === 1);
  const planPartial = planIssueChanges({ existing, found: [F("still-open")], completed: false, runId: "run3", now: new Date() });
  check("diff: a PARTIAL scan never resolves anything", planPartial.resolveKeys.length === 0);
  check("diff: already-resolved issues are not re-resolved", !planDone.resolveKeys.includes("reopened"));

  // ── Allow-listed fetcher blocks everything off-site without any network call ──
  check("allow-list: www and bare twin", (() => { const h = buildAllowedHosts(BASE); return h.has("www.example.test") && h.has("example.test") && h.size === 2; })());
  const real = createAllowListedFetcher(BASE, "TestUA/1.0");
  const blocked = [
    "http://169.254.169.254/latest/meta-data/",
    "http://127.0.0.1:3000/",
    "http://localhost:3000/",
    "https://evil.example/",
    "https://www.example.test.evil.example/",
    "https://user:pw@www.example.test/",
    "ftp://www.example.test/",
    "file:///etc/passwd",
    "not a url",
    "https://www.example.test:8443/",
  ];
  for (const u of blocked) {
    const r = await real(u, { method: "GET", readBody: true });
    check(`allow-list blocks ${u}`, r.status === 0 && r.error === "BLOCKED_HOST");
  }

  console.log(failures === 0 ? "\nAll technical SEO tests passed." : `\n${failures} test(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
