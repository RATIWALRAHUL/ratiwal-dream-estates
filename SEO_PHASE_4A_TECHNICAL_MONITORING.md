# Phase 4A — Technical SEO Monitoring (Wave 2)

**Status:** ✅ implemented · 🧪 engine + parsers + diff logic tested against an in-memory fake site · ⛔ **no real scan of the live site has been run** (see §6).

## 1. What it does

A Super Admin presses **Run technical scan** on `/dashboard/seo/technical`. The server reads the live site's `sitemap.xml`, `robots.txt`, each sitemap page, and (within caps) the internal links and images on those pages, then records **findings with history**. It never edits the site, never auto-fixes anything, and never crawls login-protected areas.

## 2. Checks (PRD §8)

| PRD category | Issue types |
|---|---|
| HTTP 404 / 5xx | `PAGE_ERROR` (HIGH), `PAGE_UNREACHABLE` (MEDIUM, timeouts/network) |
| Broken internal links | `BROKEN_INTERNAL_LINK` (names the target and where it is linked from) |
| Redirect chains | `REDIRECT_CHAIN`, `REDIRECT_LOOP`, `SITEMAP_URL_REDIRECTS`, `INTERNAL_LINK_REDIRECTS`, `NON_WWW_NO_REDIRECT` |
| Canonical mismatches | `CANONICAL_MISMATCH` (HIGH), `CANONICAL_MISSING`, `CANONICAL_MULTIPLE` (trailing slash and query are normalised, not flagged) |
| Missing title/description | `TITLE_MISSING` (HIGH), `DESCRIPTION_MISSING`, plus length checks `TITLE_LENGTH`, `DESCRIPTION_LENGTH` (LOW) |
| Duplicate metadata | `DUPLICATE_TITLE`, `DUPLICATE_DESCRIPTION` (reported on every page involved) |
| Robots directives | `ROBOTS_TXT_UNREACHABLE`, `ROBOTS_BLOCKS_URL`, `ROBOTS_BLOCKS_ASSETS` (`/_next/`), `ROBOTS_NO_SITEMAP` |
| Sitemap validity | `SITEMAP_UNREACHABLE`, `SITEMAP_INVALID`, `SITEMAP_EMPTY`, `SITEMAP_WRONG_ORIGIN`, `SITEMAP_DUPLICATE_URL`, `SITEMAP_BAD_LASTMOD` |
| Missing image references | `IMAGE_BROKEN` (img files and og:image on the site's own host) |
| Structured data syntax | `JSONLD_INVALID` (HIGH), `JSONLD_MISSING_TYPE` |
| Incorrect OG image references | `OG_IMAGE_MISSING`, `OG_IMAGE_INVALID` (relative, non-https), `IMAGE_BROKEN` |
| Unexpected noindex | `UNEXPECTED_NOINDEX` (meta robots **and** `X-Robots-Tag`) on a sitemap URL |
| (extra, from the project's SEO rules) | `H1_MISSING`, `H1_MULTIPLE` |

## 3. Safety controls (PRD §8 "Safety requirements")

| Requirement | Control | Tested |
|---|---|---|
| Approved first-party domains only | Target is `siteConfig.url`; the scan route takes **no parameters**. Allow-list = that host + its www/bare twin, enforced in the fetcher on every request and every redirect hop. | 🧪 10 blocked-URL cases (cloud metadata IP, 127.0.0.1, localhost, other host, look-alike host, credentials in URL, `ftp:`, `file:`, garbage, non-default port) all refused with no network call |
| No arbitrary user-supplied URLs / SSRF | No request field influences any URL. IP-literal/localhost refused unless the base itself is one (never true in production). Off-site redirects are flagged, not followed. | 🧪 |
| Strict timeouts | 8 s per request; 45 s total scan budget | 🧪 deadline path |
| Concurrency limit | 3 in flight | 🧪 measured max ≤ 3 |
| Bounded load | ≤ 400 requests per scan, ≤ 150 link checks, ≤ 100 image checks, bodies ≤ 2 MB, HEAD for links/images, **never requests the `/_next/image` optimiser** (checks the underlying file) | 🧪 |
| No authenticated URLs | Only sitemap URLs and links found on them; `/api/` and `/_next/` links skipped; robots-disallowed areas such as `/dashboard` are not in the sitemap | 🧪 |
| Don't create production load | Manual trigger only, 3 scans/hour/user, one at a time (DB lock + stale-lock recovery) | 🧪 auth/rate-limit wiring; lock path exercised only by design |
| Don't auto-fix | Read-only; it only writes to our own findings collections | — |

## 4. History: new, ongoing, resolved

Each finding has a stable key (`type | path | detail`). After a scan:

- **NEW** — not previously open (includes a resolved issue that reappears).
- **ONGOING** — open in an earlier scan and still present (history and first-seen date kept, `timesSeen` incremented).
- **RESOLVED** — was open, absent from a later scan. **Only a completed scan can resolve anything.** A scan stopped by the time or request budget keeps all existing issues open and says so on the page.
- When our own limit stops a scan, it records **no** "unreachable" findings (an early bug where that could happen was found by the tests and fixed).

Collections: `seo_audit_runs` (365-day TTL), `seo_technical_issues` (resolved issues expire 12 months after `resolvedAt`; open issues never expire). Both are among the 8 collections approved in D4.

## 5. Limits you should know

- HTML is read with targeted patterns, not a browser. Content created by client-side JavaScript is not seen; this is a **server-rendered HTML** check.
- It cannot tell you whether Google has indexed a page (needs URL Inspection, not connected), whether a page is eligible for rich results, or anything about external sites/CDNs (e.g. ImageKit images are not fetched).
- Pages that are neither in the sitemap nor linked from a sitemap page are not checked.
- Title/description length checks use fixed ranges (20–65 / 70–170 characters) as guidance, not Google rules; they are LOW severity.
- The `www` canonical comes from `siteConfig.url`. In local development that value still points at production (localhost is deliberately ignored), so a scan started from a dev machine would scan production.

## 6. Not verified — and what I need

- **No live scan has been run.** Running one means ~100–150 GET/HEAD requests to your production site and writing findings to your database. I held off because that touches production; say "run it" and I will do it once, then compare any findings by hand against the site before trusting them (false positives are possible, especially from the regex HTML reader).
- Not scheduled: the weekly scan from PRD §13 needs the D6 answer (no cron route or `vercel.json` exists).
- Responsive layout of the new page has not been viewed in a browser.
