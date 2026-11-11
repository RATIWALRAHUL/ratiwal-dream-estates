# Phase 6 — SEO Release Governance (6E) — design only

**Date:** 2026-11-11 · **Not implemented** (approval gate). Everything below is a design; the checks have been **prototyped as throw-away read-only probe scripts during this audit** (they are not in the repository), so the pass/fail logic and thresholds are grounded in real runs against the local build.

## 1. Current state
No CI directory, no aggregate `test` script, no pre-deploy SEO gate. Existing assets worth reusing: `scripts/test-seo-metadata.ts` (28 checks on metadata helpers), `scripts/test-seo-analytics.ts` + `scripts/test-seo-technical.ts` (160 checks incl. the scanner engine and parsers, which can verify HTML/robots/sitemap/JSON-LD without a network), `test-agent-readiness.ts`, and the in-dashboard technical scanner (post-deploy, production-only).

## 2. Design: two layers, no new infrastructure
1. **Unit/contract layer (seconds, no server):** pure checks on helpers and data — metadata factory, schema builders, sitemap builder with injected data, robots output, entity/data validators.
2. **Build-output layer (1–3 minutes):** `next build` → `next start` on a local port → a verifier script crawls from `/` and from the sitemap and asserts the rules below against **real HTML**. Runs locally (`npm run seo:verify`) and optionally as a CI job. It needs the build's database access; use a read-only connection and never write.

Deliberately avoided: Playwright/Chrome (heavy), external SaaS, paid services. The heading audit that used headless Chrome in this session is optional; raw-HTML checks cover everything except post-hydration DOM.

## 3. Check catalogue
| # | Check | Pass criteria | Severity | Prototype status |
|---|---|---|---|---|
| G1 | HTTP status of every sitemap URL | all 200; none redirect | Blocker | ✅ run (39/39) |
| G2 | Sitemap hygiene | all `https://www`, no trailing slash, no duplicates, every URL self-canonical and indexable; no entry for unpublished/fallback records; `lastmod` is not "now" for static pages | Blocker (first four) / Warn | ✅ (found V4) |
| G3 | Sitemap ⊇ public pages | every internal link target that returns 200 and is indexable appears in the sitemap; no orphans | Blocker | ✅ (0 orphans / 0 unlisted) |
| G4 | Canonical | exactly one `rel=canonical`, absolute, equals the page's clean URL; params/case variants canonicalise | Blocker | ✅ |
| G5 | Robots meta + `X-Robots-Tag` | public pages `index, follow`; private/preview/login pages `noindex`; unknown slugs 404 + `noindex` | Blocker | ✅ |
| G6 | `robots.txt` | contains the private disallows; does **not** disallow `/_next/` or any public prefix; `Sitemap:` line correct | Blocker | ✅ (code-level; add fetch check) |
| G7 | Title/description | present; title ≤ 60 characters and description 70–170 after entity decoding; no duplicates across pages | Warn (Blocker for missing/duplicate) | ✅ (note: raw `&amp;` inflates length — decode first) |
| G8 | Open Graph / Twitter | `og:title`, `og:description`, `og:image` (absolute https, reachable), `twitter:card` | Blocker (missing) / Warn | ✅ 39/39 |
| G9 | JSON-LD | every block parses; every typed node has a valid `@type`; no node defined twice per page; no `aggregateRating`/`review`/`offers`/`availability` unless a flag allows it; schema URLs match canonical; org phone/hours match site constants | Blocker | ✅ prototype; extend with forbidden-type list |
| G10 | Heading hierarchy | exactly one `h1`; no level skips; footer/header headings never precede the `h1` in document order | Warn→Blocker after cleanup | ✅ (0 issues today) |
| G11 | Internal links | every internal `<a>` resolves 200 (HEAD with budget); no link to a redirect; inbound-link floor (≥ 2) for important pages | Blocker (404) / Warn (floor) | ✅ links graph; floor flags V7 |
| G12 | Image references | `og:image`, `img src` (via `/_next/image?url=` decode) return 200; images have `alt` | Blocker (404) / Warn (alt) | ✅ via scanner engine |
| G13 | Private route protection | `/dashboard`, `/portal`, `/partner` redirect when unauthenticated; `/preview/*`, `/kyc/*`, `/payments/*` are noindex + no-store; `/api/internal/*` return 401 without the secret | Blocker | ✅ HTTP matrix exists from Phase 4A |
| G14 | Public API safety | `/api/properties|projects|locations` return only published slugs (⊆ sitemap); no emails/phones of customers; `search` length enforced | Blocker | ✅ prototype; length rule pending P2 |
| G15 | Redirect rules | explicit redirects map to 200 targets in one hop; no chains | Blocker | ✅ |
| G16 | **Data/entity validation** | unique slugs and RERA numbers; no fallback-only slugs; coordinates verified flag; published project has published location | Blocker | not yet written |
| G17 | **Publish-flow smoke (staging only)** | after publishing a test project in a *staging* database: detail URL 200 within N seconds; present in sitemap; hub shows it; after unpublish: 404 and removed from sitemap | Blocker once V1 is fixed | design only (never run on production data) |
| G18 | Content negotiation | `Accept: text/markdown` returns the *page-specific* markdown and `Vary: Accept` | Warn | ✅ found V3 |
| G19 | Build resilience | build **fails** if the database is unreachable (no empty `generateStaticParams`) | Blocker | design only |
| G20 | Regression snapshot | compare each page's {title, description, canonical, robots, H1, JSON-LD type list, word count ±20 %} with a stored baseline file; changes must be acknowledged | Warn | design (baseline file to be committed) |

## 4. Packaging (proposed, not created)
- `scripts/seo-verify/` with `run.ts` (orchestrator), `checks/*.ts` (G1–G20), `baseline.json` (G20), reusing `src/lib/seo-analytics/html-checks.ts` and the scanner engine.
- `package.json`: `"seo:verify": "tsx --conditions=react-server scripts/seo-verify/run.ts"`, `"test:seo": "npm run test:seo-analytics && npm run test:seo-technical && tsx … test-seo-metadata.ts"`.
- Output: a table + non-zero exit on any Blocker; machine-readable JSON for CI annotations.
- **Where it runs:** (a) developers before deploy; (b) optionally a single GitHub Actions workflow (`build`, `start`, `seo:verify`, fail on blockers) **if the repository is hosted on GitHub and you want CI** — there is none today, so this is an owner decision; (c) after deploy, the existing dashboard technical scan covers production.
- Time budget: unit layer < 10 s; build layer dominated by `next build` (≈ 1–2 minutes here).

## 5. Rules for adding checks
Every production regression we fix should add a check (e.g., V1 → G17/G19; heading skips → G10; loading-wrapper regression → G10 + "no `hidden` content wrapper" assertion). Checks must be deterministic, read-only and avoid secrets.

## 6. Risks and limits
Needs database read access at build/verify time; headless-browser DOM checks are optional and slower; production-only issues (host redirects, CDN headers) require a post-deploy probe (G15 against the real domain). A green run proves rules were met on the sampled pages, not that Google indexes them.

## 7. Approval
Creating the suite adds files and npm scripts (no site change). Needs your go-ahead; recommended as the **first** implementation item because it protects every other change.
