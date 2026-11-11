/**
 * Pure parsers used by the technical SEO scanner. No I/O, so they are unit-testable.
 * HTML is read with targeted regexes (no DOM library is installed). That is adequate
 * for server-rendered Next.js output but is a documented limitation: content injected
 * by client-side JavaScript is not seen.
 */

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">" };
export function decodeEntities(s: string): string {
  return s.replace(/&(amp|quot|#x27|#39|lt|gt);/g, (m) => ENTITIES[m] ?? m);
}

function attr(tag: string, name: string): string | undefined {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  if (!m) return undefined;
  return decodeEntities((m[2] ?? m[3] ?? m[4] ?? "").trim());
}

export interface PageFacts {
  title: string | null;
  descriptions: string[];
  canonicals: string[];
  robotsMeta: string[];
  ogImages: string[];
  h1Count: number;
  jsonLd: string[];
  links: string[];
  images: string[];
}

export function extractPageFacts(html: string): PageFacts {
  const titleM = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = titleM ? decodeEntities(titleM[1].replace(/\s+/g, " ").trim()) : null;

  const descriptions: string[] = [];
  const robotsMeta: string[] = [];
  const ogImages: string[] = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const name = attr(tag, "name")?.toLowerCase();
    const prop = attr(tag, "property")?.toLowerCase();
    const content = attr(tag, "content");
    if (content === undefined) continue;
    if (name === "description") descriptions.push(content);
    else if (name === "robots" || name === "googlebot") robotsMeta.push(content.toLowerCase());
    else if (prop === "og:image" || prop === "og:image:url") ogImages.push(content);
  }

  const canonicals: string[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attr(m[0], "rel")?.toLowerCase().split(/\s+/);
    const href = attr(m[0], "href");
    if (rel?.includes("canonical") && href) canonicals.push(href);
  }

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;

  const jsonLd: string[] = [];
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    jsonLd.push(m[1].trim());
  }

  const links: string[] = [];
  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attr(m[0], "href");
    if (href) links.push(href);
  }

  const images: string[] = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const src = attr(m[0], "src");
    if (src && !src.startsWith("data:")) images.push(src);
  }

  return { title, descriptions, canonicals, robotsMeta, ogImages, h1Count, jsonLd, links, images };
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

export interface JsonLdResult {
  valid: boolean;
  error?: string;
  /** True when every top-level node (and every @graph node) has an @type. */
  hasTypes: boolean;
}

export function checkJsonLd(raw: string): JsonLdResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message.slice(0, 120) : "Invalid JSON", hasTypes: false };
  }
  const nodes: unknown[] = [];
  const push = (n: unknown) => {
    if (Array.isArray(n)) n.forEach(push);
    else if (n && typeof n === "object") {
      nodes.push(n);
      const graph = (n as Record<string, unknown>)["@graph"];
      if (Array.isArray(graph)) graph.forEach(push);
    }
  };
  push(parsed);
  const hasTypes = nodes.length > 0 && nodes.every((n) => {
    const o = n as Record<string, unknown>;
    return "@type" in o || "@graph" in o;
  });
  return { valid: true, hasTypes };
}

// ─── Sitemap ─────────────────────────────────────────────────────────────────

export interface SitemapParse {
  isIndex: boolean;
  entries: Array<{ loc: string; lastmod?: string }>;
  errors: string[];
}

export function parseSitemapXml(xml: string): SitemapParse {
  const errors: string[] = [];
  const trimmed = xml.trim();
  if (!/^<\?xml|^<urlset|^<sitemapindex/i.test(trimmed)) errors.push("Response is not XML");
  const isIndex = /<sitemapindex\b/i.test(trimmed);
  if (!isIndex && !/<urlset\b/i.test(trimmed)) errors.push("Missing <urlset> root element");
  const entries: SitemapParse["entries"] = [];
  const blockRe = isIndex ? /<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi : /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  for (const m of trimmed.matchAll(blockRe)) {
    const loc = /<loc>\s*([\s\S]*?)\s*<\/loc>/i.exec(m[1]);
    if (!loc || !loc[1]) {
      errors.push("An entry has no <loc>");
      continue;
    }
    const lastmod = /<lastmod>\s*([\s\S]*?)\s*<\/lastmod>/i.exec(m[1]);
    entries.push({ loc: decodeEntities(loc[1]), ...(lastmod ? { lastmod: lastmod[1] } : {}) });
  }
  const opens = (trimmed.match(/<loc>/gi) ?? []).length;
  const closes = (trimmed.match(/<\/loc>/gi) ?? []).length;
  if (opens !== closes) errors.push("Unbalanced <loc> tags");
  return { isIndex, entries, errors };
}

export function isValidLastmod(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(v) && !Number.isNaN(Date.parse(v));
}

// ─── robots.txt ──────────────────────────────────────────────────────────────

export interface RobotsRules {
  groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; pattern: string }> }>;
  sitemaps: string[];
}

export function parseRobots(txt: string): RobotsRules {
  const groups: RobotsRules["groups"] = [];
  const sitemaps: string[] = [];
  let cur: RobotsRules["groups"][number] | null = null;
  let lastWasAgent = false;
  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const val = line.slice(idx + 1).trim();
    if (key === "sitemap") {
      sitemaps.push(val);
    } else if (key === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
      continue;
    } else if ((key === "allow" || key === "disallow") && cur) {
      cur.rules.push({ allow: key === "allow", pattern: val });
    }
    lastWasAgent = false;
  }
  return { groups, sitemaps };
}

function patternToRegex(p: string): RegExp {
  const anchored = p.endsWith("$");
  const body = (anchored ? p.slice(0, -1) : p).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/** Google semantics: most specific (longest) matching rule wins; Allow wins ties. */
export function isAllowedByRobots(rules: RobotsRules, userAgent: string, path: string): boolean {
  const ua = userAgent.toLowerCase();
  const group =
    rules.groups.find((g) => g.agents.some((a) => a !== "*" && ua.includes(a))) ??
    rules.groups.find((g) => g.agents.includes("*"));
  if (!group) return true;
  let best: { len: number; allow: boolean } | null = null;
  for (const r of group.rules) {
    if (r.pattern === "") continue; // empty Disallow = allow all
    if (patternToRegex(r.pattern).test(path)) {
      const len = r.pattern.length;
      if (!best || len > best.len || (len === best.len && r.allow)) best = { len, allow: r.allow };
    }
  }
  return best ? best.allow : true;
}
