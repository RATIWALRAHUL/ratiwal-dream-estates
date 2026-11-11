import {
  checkJsonLd,
  extractPageFacts,
  isAllowedByRobots,
  isValidLastmod,
  parseRobots,
  parseSitemapXml,
  type RobotsRules,
} from "./html-checks";

/**
 * Technical SEO scan engine (first-party only).
 *
 * This module has NO network code of its own: all requests go through an injected
 * `Fetcher`, which in production is the allow-listed, size/time-limited fetcher in
 * tech-fetcher.ts. That keeps the SSRF boundary in one place and lets tests run
 * against an in-memory fake site with zero production load.
 */

export type TechSeverity = "HIGH" | "MEDIUM" | "LOW";

export const TECH_ISSUE_TYPES = {
  PAGE_ERROR: { label: "Page returns an error", severity: "HIGH" },
  PAGE_UNREACHABLE: { label: "Page unreachable or timed out", severity: "MEDIUM" },
  SITEMAP_URL_REDIRECTS: { label: "Sitemap URL redirects", severity: "MEDIUM" },
  REDIRECT_CHAIN: { label: "Redirect chain (2+ hops)", severity: "MEDIUM" },
  REDIRECT_LOOP: { label: "Redirect loop", severity: "HIGH" },
  BROKEN_INTERNAL_LINK: { label: "Broken internal link", severity: "MEDIUM" },
  INTERNAL_LINK_REDIRECTS: { label: "Internal link goes through a redirect", severity: "LOW" },
  CANONICAL_MISSING: { label: "Canonical tag missing", severity: "MEDIUM" },
  CANONICAL_MISMATCH: { label: "Canonical points elsewhere", severity: "HIGH" },
  CANONICAL_MULTIPLE: { label: "Multiple canonical tags", severity: "MEDIUM" },
  TITLE_MISSING: { label: "Title missing", severity: "HIGH" },
  TITLE_LENGTH: { label: "Title length outside 20–65 characters", severity: "LOW" },
  DESCRIPTION_MISSING: { label: "Meta description missing", severity: "MEDIUM" },
  DESCRIPTION_LENGTH: { label: "Description length outside 70–170 characters", severity: "LOW" },
  DUPLICATE_TITLE: { label: "Duplicate title", severity: "MEDIUM" },
  DUPLICATE_DESCRIPTION: { label: "Duplicate meta description", severity: "LOW" },
  H1_MISSING: { label: "No H1 heading", severity: "MEDIUM" },
  H1_MULTIPLE: { label: "More than one H1", severity: "LOW" },
  UNEXPECTED_NOINDEX: { label: "Indexable page marked noindex", severity: "HIGH" },
  ROBOTS_TXT_UNREACHABLE: { label: "robots.txt unreachable", severity: "HIGH" },
  ROBOTS_BLOCKS_URL: { label: "robots.txt blocks a sitemap URL", severity: "HIGH" },
  ROBOTS_BLOCKS_ASSETS: { label: "robots.txt blocks /_next/ assets", severity: "HIGH" },
  ROBOTS_NO_SITEMAP: { label: "robots.txt has no Sitemap line", severity: "LOW" },
  SITEMAP_UNREACHABLE: { label: "Sitemap unreachable", severity: "HIGH" },
  SITEMAP_INVALID: { label: "Sitemap is not valid", severity: "HIGH" },
  SITEMAP_EMPTY: { label: "Sitemap lists no URLs", severity: "HIGH" },
  SITEMAP_WRONG_ORIGIN: { label: "Sitemap URL on wrong origin/protocol", severity: "HIGH" },
  SITEMAP_DUPLICATE_URL: { label: "Duplicate URL in sitemap", severity: "LOW" },
  SITEMAP_BAD_LASTMOD: { label: "Invalid lastmod date in sitemap", severity: "LOW" },
  NON_WWW_NO_REDIRECT: { label: "Non-www host does not permanently redirect to www", severity: "MEDIUM" },
  IMAGE_BROKEN: { label: "Image not found", severity: "MEDIUM" },
  OG_IMAGE_MISSING: { label: "og:image missing", severity: "MEDIUM" },
  OG_IMAGE_INVALID: { label: "og:image is not an absolute https URL", severity: "MEDIUM" },
  JSONLD_INVALID: { label: "Structured data is not valid JSON", severity: "HIGH" },
  JSONLD_MISSING_TYPE: { label: "Structured data node has no @type", severity: "LOW" },
} as const satisfies Record<string, { label: string; severity: TechSeverity }>;

export type TechIssueType = keyof typeof TECH_ISSUE_TYPES;

export interface Finding {
  key: string; // stable identity across runs
  type: TechIssueType;
  severity: TechSeverity;
  url: string; // full URL the issue is about
  message: string;
}

export interface FetchResult {
  status: number; // 0 when error
  headers: Record<string, string>;
  body?: string;
  location?: string;
  error?: "TIMEOUT" | "NETWORK" | "TOO_LARGE" | "BLOCKED_HOST" | "BUDGET";
}

export type Fetcher = (
  url: string,
  opts: { method: "GET" | "HEAD"; readBody: boolean }
) => Promise<FetchResult>;

export interface ScanLimits {
  concurrency: number;
  maxRequests: number;
  /** Absolute epoch ms after which no new work is started. */
  deadline: number;
  maxLinkChecks: number;
  maxImageChecks: number;
  maxSitemaps: number;
}

export const DEFAULT_LIMITS: Omit<ScanLimits, "deadline"> = {
  concurrency: 3,
  maxRequests: 400,
  maxLinkChecks: 150,
  maxImageChecks: 100,
  maxSitemaps: 5,
};

export interface ScanResult {
  findings: Finding[];
  urlsPlanned: number;
  urlsChecked: number;
  requests: number;
  /** True only if every planned check ran; partial scans must never resolve old issues. */
  completed: boolean;
  stoppedReason?: "DEADLINE" | "REQUEST_BUDGET" | "SITEMAP_UNAVAILABLE";
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const MAX_HOPS = 5;

export function pathKey(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + (u.search || "");
  } catch {
    return url;
  }
}

/** origin + pathname without trailing slash (root stays "/"), no query/hash. */
export function normalizeForCompare(url: string): string {
  try {
    const u = new URL(url);
    let p = u.pathname;
    if (p.length > 1) p = p.replace(/\/+$/, "");
    return `${u.protocol}//${u.host}${p}`;
  } catch {
    return url;
  }
}

async function mapPool<T>(items: T[], concurrency: number, stop: () => boolean, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const worker = async () => {
    while (i < items.length && !stop()) {
      const item = items[i++];
      await fn(item);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
}

interface Resolved {
  first: FetchResult;
  final: FetchResult;
  hops: Array<{ url: string; status: number }>;
  finalUrl: string;
  loop: boolean;
  offSite: boolean;
}

// ─── engine ──────────────────────────────────────────────────────────────────

export async function runTechnicalScan(opts: {
  baseUrl: string;
  fetcher: Fetcher;
  limits: ScanLimits;
}): Promise<ScanResult> {
  const { baseUrl, limits } = opts;
  const base = new URL(baseUrl);
  const origin = base.origin;
  const host = base.host;

  const findings = new Map<string, Finding>();
  let requests = 0;
  let stoppedReason: ScanResult["stoppedReason"];

  const add = (type: TechIssueType, url: string, message: string, detail = "") => {
    const key = `${type}|${pathKey(url)}${detail ? `|${detail}` : ""}`;
    if (!findings.has(key)) {
      findings.set(key, { key, type, severity: TECH_ISSUE_TYPES[type].severity, url, message });
    }
  };

  const stop = () => {
    if (stoppedReason) return true;
    if (Date.now() > limits.deadline) {
      stoppedReason = "DEADLINE";
      return true;
    }
    if (requests >= limits.maxRequests) {
      stoppedReason = "REQUEST_BUDGET";
      return true;
    }
    return false;
  };

  const doFetch: Fetcher = async (url, o) => {
    if (stop()) return { status: 0, headers: {}, error: "BUDGET" };
    requests++;
    return opts.fetcher(url, o);
  };

  const cache = new Map<string, Resolved>();
  async function resolve(url: string, method: "GET" | "HEAD", readBody: boolean): Promise<Resolved> {
    const ck = `${method}|${url}`;
    const hit = cache.get(ck);
    if (hit) return hit;
    const hops: Resolved["hops"] = [];
    const seen = new Set<string>();
    let cur = url;
    let first: FetchResult | null = null;
    let res: FetchResult = { status: 0, headers: {}, error: "NETWORK" };
    let loop = false;
    let offSite = false;
    for (let n = 0; n <= MAX_HOPS; n++) {
      if (seen.has(cur)) {
        loop = true;
        break;
      }
      seen.add(cur);
      res = await doFetch(cur, { method, readBody }); // redirect responses carry no body, so this only costs on the final hop
      first ??= res;
      hops.push({ url: cur, status: res.status });
      if (res.status >= 300 && res.status < 400 && res.location) {
        let next: string;
        try {
          next = new URL(res.location, cur).toString();
        } catch {
          break;
        }
        if (new URL(next).host !== host && new URL(next).host !== host.replace(/^www\./, "")) {
          offSite = true;
          break;
        }
        cur = next;
        continue;
      }
      break;
    }
    if (hops.length > MAX_HOPS) loop = true;
    const out: Resolved = { first: first ?? res, final: res, hops, finalUrl: cur, loop, offSite };
    cache.set(ck, out);
    return out;
  }

  // 1) robots.txt ────────────────────────────────────────────────────────────
  let robots: RobotsRules | null = null;
  const robotsUrl = `${origin}/robots.txt`;
  const rb = await resolve(robotsUrl, "GET", true);
  if (rb.final.error === "BUDGET") {
    // Stopped by our own limits: that says nothing about the site, so no finding.
  } else if (rb.final.status !== 200 || !rb.final.body) {
    add("ROBOTS_TXT_UNREACHABLE", robotsUrl, `robots.txt returned ${rb.final.status || rb.final.error || "no response"}.`);
  } else {
    robots = parseRobots(rb.final.body);
    if (robots.sitemaps.length === 0) add("ROBOTS_NO_SITEMAP", robotsUrl, "robots.txt does not declare a Sitemap.");
    if (!isAllowedByRobots(robots, "Googlebot", "/_next/static/chunks/app.js")) {
      add("ROBOTS_BLOCKS_ASSETS", robotsUrl, "Googlebot is blocked from /_next/ assets, so Google cannot render pages properly.");
    }
  }

  // 2) sitemap(s) ────────────────────────────────────────────────────────────
  const sitemapUrl = `${origin}/sitemap.xml`;
  const pageUrls: string[] = [];
  const seenLoc = new Set<string>();
  let sitemapOk = true;

  const visitSitemap = async (url: string, depth: number): Promise<void> => {
    const r = await resolve(url, "GET", true);
    if (r.final.error === "BUDGET") {
      sitemapOk = false; // our own limit, not a site problem: no finding
      return;
    }
    if (r.final.status !== 200 || !r.final.body) {
      add("SITEMAP_UNREACHABLE", url, `Sitemap returned ${r.final.status || r.final.error || "no response"}.`);
      sitemapOk = false;
      return;
    }
    const parsed = parseSitemapXml(r.final.body);
    for (const e of parsed.errors) add("SITEMAP_INVALID", url, e, e);
    if (parsed.errors.length) sitemapOk = false;
    if (parsed.isIndex) {
      if (depth > 0) return;
      for (const child of parsed.entries.slice(0, limits.maxSitemaps)) {
        let cu: URL;
        try {
          cu = new URL(child.loc);
        } catch {
          add("SITEMAP_INVALID", url, `Child sitemap URL is not valid: ${child.loc}`, child.loc);
          continue;
        }
        if (cu.host === host) await visitSitemap(cu.toString(), depth + 1);
        else add("SITEMAP_WRONG_ORIGIN", url, `Child sitemap is on another host: ${cu.host}`, cu.host);
      }
      return;
    }
    for (const e of parsed.entries) {
      let u: URL;
      try {
        u = new URL(e.loc);
      } catch {
        add("SITEMAP_INVALID", url, `Not a valid URL: ${e.loc}`, e.loc);
        continue;
      }
      if (u.protocol !== "https:" || u.host !== host) {
        add("SITEMAP_WRONG_ORIGIN", e.loc, `Sitemap lists ${e.loc}; expected ${origin}.`);
        continue;
      }
      if (seenLoc.has(e.loc)) {
        add("SITEMAP_DUPLICATE_URL", e.loc, "This URL appears more than once in the sitemap.");
        continue;
      }
      seenLoc.add(e.loc);
      if (e.lastmod && !isValidLastmod(e.lastmod)) add("SITEMAP_BAD_LASTMOD", e.loc, `lastmod "${e.lastmod}" is not a valid date.`);
      pageUrls.push(e.loc);
    }
  };
  await visitSitemap(sitemapUrl, 0);
  if (sitemapOk && pageUrls.length === 0) add("SITEMAP_EMPTY", sitemapUrl, "The sitemap contains no valid URLs.");

  // 3) non-www → www ─────────────────────────────────────────────────────────
  if (host.startsWith("www.")) {
    const bareUrl = `https://${host.slice(4)}/`;
    const r = await doFetch(bareUrl, { method: "GET", readBody: false });
    if (r.status > 0 && !r.error) {
      let target: string | null = null;
      try {
        target = r.location ? new URL(r.location, bareUrl).host : null;
      } catch {
        target = null;
      }
      if (!(r.status === 301 || r.status === 308) || target !== host) {
        add(
          "NON_WWW_NO_REDIRECT",
          bareUrl,
          r.status >= 300 && r.status < 400
            ? `Responds ${r.status} to ${target ?? "?"}; expected a permanent (301/308) redirect to ${host}.`
            : `Responds ${r.status} instead of redirecting to ${host}.`
        );
      }
    }
  }

  if (!sitemapOk && pageUrls.length === 0) {
    return {
      findings: [...findings.values()],
      urlsPlanned: 0,
      urlsChecked: 0,
      requests,
      completed: false,
      stoppedReason: stoppedReason ?? "SITEMAP_UNAVAILABLE",
    };
  }

  // 4) pages ─────────────────────────────────────────────────────────────────
  const titles = new Map<string, string[]>();
  const descs = new Map<string, string[]>();
  const linkSources = new Map<string, string[]>();
  const imageSources = new Map<string, string[]>(); // image URL -> pages
  const ogChecks = new Map<string, string[]>();
  const sitemapSet = new Set(pageUrls.map(normalizeForCompare));
  let urlsChecked = 0;

  await mapPool(pageUrls, limits.concurrency, stop, async (pageUrl) => {
    const r = await resolve(pageUrl, "GET", true);
    if (r.final.error === "BUDGET") return;
    urlsChecked++;

    if (r.final.status === 0) {
      add("PAGE_UNREACHABLE", pageUrl, `No response (${r.final.error ?? "unknown"}).`);
      return;
    }
    if (r.first.status >= 300 && r.first.status < 400) {
      add("SITEMAP_URL_REDIRECTS", pageUrl, `Sitemap URL responds ${r.first.status} → ${r.finalUrl}. Sitemaps should list final 200 URLs.`);
      if (r.hops.length > 2) add("REDIRECT_CHAIN", pageUrl, `${r.hops.length - 1} redirects before the final response.`);
    }
    if (r.loop) {
      add("REDIRECT_LOOP", pageUrl, "Redirects loop or exceed 5 hops.");
      return;
    }
    if (r.offSite) {
      add("SITEMAP_URL_REDIRECTS", pageUrl, "Redirects to a host outside this site (not followed).", "offsite");
      return;
    }
    if (r.final.status >= 400) {
      add("PAGE_ERROR", pageUrl, `Returns HTTP ${r.final.status}.`);
      return;
    }
    if (r.final.status !== 200) return;

    const xrt = (r.final.headers["x-robots-tag"] ?? "").toLowerCase();
    if (xrt.includes("noindex")) add("UNEXPECTED_NOINDEX", pageUrl, `X-Robots-Tag header contains "noindex" on a sitemap URL.`, "header");

    if (robots && !isAllowedByRobots(robots, "Googlebot", new URL(pageUrl).pathname)) {
      add("ROBOTS_BLOCKS_URL", pageUrl, "Googlebot is disallowed by robots.txt for this URL.");
    }

    const ct = (r.final.headers["content-type"] ?? "").toLowerCase();
    if (!ct.includes("html") || !r.final.body) return;
    const facts = extractPageFacts(r.final.body);
    const here = r.finalUrl;

    // Title / description
    if (!facts.title) add("TITLE_MISSING", pageUrl, "No <title> found.");
    else {
      if (facts.title.length < 20 || facts.title.length > 65) add("TITLE_LENGTH", pageUrl, `Title is ${facts.title.length} characters.`);
      titles.set(facts.title, [...(titles.get(facts.title) ?? []), pageUrl]);
    }
    const desc = facts.descriptions[0];
    if (!desc) add("DESCRIPTION_MISSING", pageUrl, "No meta description found.");
    else {
      if (desc.length < 70 || desc.length > 170) add("DESCRIPTION_LENGTH", pageUrl, `Description is ${desc.length} characters.`);
      descs.set(desc, [...(descs.get(desc) ?? []), pageUrl]);
    }

    // Canonical
    if (facts.canonicals.length === 0) add("CANONICAL_MISSING", pageUrl, "No canonical link found.");
    else {
      if (facts.canonicals.length > 1) add("CANONICAL_MULTIPLE", pageUrl, `${facts.canonicals.length} canonical tags found.`);
      let canon: string;
      try {
        canon = new URL(facts.canonicals[0], here).toString();
      } catch {
        canon = facts.canonicals[0];
      }
      if (normalizeForCompare(canon) !== normalizeForCompare(pageUrl)) {
        add("CANONICAL_MISMATCH", pageUrl, `Canonical is ${canon}; expected ${normalizeForCompare(pageUrl)}.`);
      }
    }

    // Robots meta
    if (facts.robotsMeta.some((v) => v.includes("noindex"))) {
      add("UNEXPECTED_NOINDEX", pageUrl, `Meta robots contains "noindex" on a sitemap URL.`, "meta");
    }

    // H1
    if (facts.h1Count === 0) add("H1_MISSING", pageUrl, "No <h1> found in the server-rendered HTML.");
    else if (facts.h1Count > 1) add("H1_MULTIPLE", pageUrl, `${facts.h1Count} <h1> elements found.`);

    // Structured data
    facts.jsonLd.forEach((raw, i) => {
      const j = checkJsonLd(raw);
      if (!j.valid) add("JSONLD_INVALID", pageUrl, `JSON-LD block ${i + 1}: ${j.error}`, String(i));
      else if (!j.hasTypes) add("JSONLD_MISSING_TYPE", pageUrl, `JSON-LD block ${i + 1} has a node without @type.`, String(i));
    });

    // OG image
    if (facts.ogImages.length === 0) add("OG_IMAGE_MISSING", pageUrl, "No og:image meta tag.");
    else {
      const og = facts.ogImages[0];
      let ou: URL | null = null;
      try {
        ou = new URL(og);
      } catch {
        ou = null;
      }
      if (!ou || ou.protocol !== "https:" || !/^https?:\/\//i.test(og)) {
        add("OG_IMAGE_INVALID", pageUrl, `og:image "${og.slice(0, 120)}" must be an absolute https URL.`);
      } else if (ou.host === host) {
        ogChecks.set(og, [...(ogChecks.get(og) ?? []), pageUrl]);
      }
    }

    // Links and images (collected, checked in later phases within caps)
    for (const href of facts.links) {
      if (/^(mailto:|tel:|javascript:|#|data:)/i.test(href)) continue;
      let u: URL;
      try {
        u = new URL(href, here);
      } catch {
        continue;
      }
      if (u.host !== host || !/^https?:$/.test(u.protocol)) continue;
      if (u.pathname.startsWith("/_next/") || u.pathname.startsWith("/api/")) continue;
      u.hash = "";
      const t = u.toString();
      linkSources.set(t, [...(linkSources.get(t) ?? []), pageUrl]);
    }
    for (const src of facts.images) {
      let u: URL;
      try {
        u = new URL(src, here);
      } catch {
        continue;
      }
      // Check the underlying file, not the optimiser endpoint, to avoid image-optimisation load.
      if (u.host === host && u.pathname === "/_next/image") {
        const inner = u.searchParams.get("url");
        if (!inner || !inner.startsWith("/")) continue; // remote CDN image: outside first-party scope
        u = new URL(inner, origin);
      }
      if (u.host !== host) continue;
      u.hash = "";
      const t = u.toString();
      imageSources.set(t, [...(imageSources.get(t) ?? []), pageUrl]);
    }
  });

  // 5) duplicates ────────────────────────────────────────────────────────────
  for (const [title, urls] of titles) {
    if (urls.length > 1) for (const u of urls) add("DUPLICATE_TITLE", u, `Same title as ${urls.length - 1} other page(s): "${title.slice(0, 80)}".`);
  }
  for (const [d, urls] of descs) {
    if (urls.length > 1) for (const u of urls) add("DUPLICATE_DESCRIPTION", u, `Same meta description as ${urls.length - 1} other page(s): "${d.slice(0, 80)}".`);
  }

  // 6) internal links ────────────────────────────────────────────────────────
  const linkTargets = [...linkSources.keys()].filter((t) => !sitemapSet.has(normalizeForCompare(t))).slice(0, limits.maxLinkChecks);
  await mapPool(linkTargets, limits.concurrency, stop, async (target) => {
    const r = await resolve(target, "HEAD", false);
    if (r.final.error === "BUDGET" || r.final.status === 405 || r.final.status === 501) return;
    const sources = linkSources.get(target) ?? [];
    const from = `linked from ${pathKey(sources[0])}${sources.length > 1 ? ` (+${sources.length - 1} more)` : ""}`;
    if (r.final.status >= 400) add("BROKEN_INTERNAL_LINK", target, `Returns HTTP ${r.final.status}; ${from}.`);
    else if (r.first.status >= 300 && r.first.status < 400 && !r.loop) add("INTERNAL_LINK_REDIRECTS", target, `Redirects to ${r.finalUrl}; ${from}. Link to the final URL.`);
    if (r.hops.length > 2) add("REDIRECT_CHAIN", target, `${r.hops.length - 1} redirects; ${from}.`, "link");
  });
  // Links to sitemap URLs that are broken are already reported as PAGE_ERROR.

  // 7) images ────────────────────────────────────────────────────────────────
  const imageTargets = [...new Set([...imageSources.keys(), ...ogChecks.keys()])].slice(0, limits.maxImageChecks);
  await mapPool(imageTargets, limits.concurrency, stop, async (img) => {
    const r = await resolve(img, "HEAD", false);
    if (r.final.error === "BUDGET" || r.final.status === 405 || r.final.status === 501) return;
    if (r.final.status >= 400 || r.final.status === 0) {
      const pages = [...new Set([...(imageSources.get(img) ?? []), ...(ogChecks.get(img) ?? [])])];
      const isOg = ogChecks.has(img);
      add("IMAGE_BROKEN", pages[0], `${isOg ? "og:image" : "Image"} ${pathKey(img)} returns ${r.final.status || r.final.error}${pages.length > 1 ? ` (used on ${pages.length} pages)` : ""}.`, pathKey(img));
    }
  });

  const planned = pageUrls.length;
  const completed = !stoppedReason && urlsChecked === planned;
  return {
    findings: [...findings.values()],
    urlsPlanned: planned,
    urlsChecked,
    requests,
    completed,
    ...(stoppedReason ? { stoppedReason } : {}),
  };
}
