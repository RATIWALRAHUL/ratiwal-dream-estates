# Phase 4A — Security Audit (Wave 1)

Scope: the Search Console module and the technical scanner. GA4 and conversion work have not been built and are not audited here.

## 1. Test results (production build, `next start`, `NODE_ENV=production`)

Cookies were signed with the existing `ADMIN_SESSION_SECRET` inside a throwaway script (secret never printed). Dev auto-login cannot apply in production mode.

| # | Check | Expected | Result |
|---|---|---|---|
| 1 | `POST /api/dashboard/seo/sync`, no cookie | 401 | ✅ 401 |
| 2 | `GET …/keywords/export`, no cookie | 401 | ✅ 401 |
| 3 | `GET /dashboard/seo`, no cookie | redirect to login | ✅ 307 → `/dashboard/login` |
| 4 | Sync with tampered cookie signature | 401 | ✅ 401 |
| 5 | `EDITOR`: export / sync | 403 | ✅ 403 / 403 |
| 6 | `EDITOR`: overview page | permission-denied state | ✅ shown |
| 7 | `ADMIN`: sync | 403 | ✅ 403 |
| 8 | `ADMIN`: overview/keywords/pages/health | 200 | ✅ 200 ×4 |
| 9 | `SUPER_ADMIN`: cross-origin POST (`Origin: https://evil.example`) | 403 | ✅ 403 |
| 10 | Invalid export param (`preset=evil`) | 400 | ✅ 400 |
| 11 | Invalid sync body (`days: 9999`) | 400 | ✅ 400 |
| 12 | Bad custom range on a page (`from=zzz`) | graceful page, no 500 | ✅ 200 |
| 13 | Sync/verify with no credentials | safe error, no crash | ✅ `GSC_NOT_CONFIGURED` (503 / `ok:false`) |

**Technical scan route (`POST /api/dashboard/seo/technical/scan`)**, same harness:

| # | Check | Expected | Result |
|---|---|---|---|
| 14 | No cookie / tampered cookie | 401 | ✅ 401 / 401 |
| 15 | `EDITOR` / `ADMIN` | 403 | ✅ 403 / 403 |
| 16 | `SUPER_ADMIN` with foreign `Origin` | 403, nothing scanned | ✅ 403 |
| 17 | `GET` on the route | 405 | ✅ 405 |
| 18 | Technical page: no cookie / `EDITOR` / `ADMIN` / `SUPER_ADMIN` | redirect / denied / read-only + "Super Admin only" note / scan button | ✅ |
| 19 | Filter params `state=$ne`, `severity={"$gt":1}`, `page=-5` | ignored safely, 200 | ✅ 200 |

Not tested: rate-limit 429 responses (code path present: sync 6/10 min per user, export 5/min per user); behaviour under a real Google error.

## 2. Controls in place

| Area | Control |
|---|---|
| Credentials | Server env only; never stored in MongoDB, returned by any route, logged, or placed in `NEXT_PUBLIC_*`. Only `webmasters.readonly` scope. |
| AuthN/Z | Server-side checks on every page and route (middleware is only the first layer). Role gates as in the dashboard report. |
| CSRF | Sync is a cookie-authenticated POST: same-origin `Origin` check + JSON body. |
| Input validation | Zod on bodies/query params; date strings strictly validated; custom range ≤ 480 days; page size ≤ 100; search text ≤ 100 chars and applied in memory (no regex or Mongo operators built from user input). |
| Injection | Query text is attacker-influenced. CSV cells starting with `= + - @ tab CR` are prefixed with `'`; React escapes all HTML output. |
| Rate limiting | In-memory limiter (existing `checkRateLimit`). Per-instance, so on serverless it is best-effort, not a hard global limit. |
| Output bounds | Export capped at 5,000 rows (`X-Export-Truncated` header when cut); analysis capped at 20,000 queries. |
| Overlap/abuse | One sync at a time (DB-backed lock); stale-lock recovery; 40 s time budget. |
| Audit trail | New `AuditLog` actions: `SEO_SYNC_TRIGGERED/COMPLETED/FAILED`, `SEO_KEYWORDS_EXPORTED`, `SEO_TECH_SCAN_TRIGGERED/COMPLETED/FAILED`. |
| **Scanner SSRF** | The scan route accepts no input; the target is `siteConfig.url`. The only network function (`tech-fetcher.ts`) allow-lists the host (+ www/bare twin) on every request and redirect hop, refuses credentials-in-URL, non-http(s), non-default ports and IP/localhost hosts, and handles redirects manually so a redirect can never silently leave the site. 10 hostile URLs verified blocked without a network call (unit test). |
| **Scanner load** | 3 concurrent, 8 s timeout, ≤ 400 requests, 45 s budget, 2 MB body cap, 3 scans/hour/user, one at a time (DB lock). |
| **Stored-data rendering** | Issue URLs are only rendered as links when they start with `http(s)://`; all text is React-escaped. |
| PII | Search Console data contains no visitor identities. Nothing is sent to GA (not built). |

## 3. Findings / residual risks

| Severity | Finding | Action |
|---|---|---|
| Medium | Rate limits are per server instance. | Acceptable for 1–2 admins; move to a shared store if abuse becomes a concern. |
| Low | Search queries may occasionally contain personal text a user typed into Google. Google anonymises rare queries, but exported CSVs should be handled as internal. | Documented; export is ADMIN+, audited. |
| Medium | DNS-level SSRF (a first-party hostname resolving to a private IP) cannot be ruled out by hostname checks alone, because `fetch` cannot pin IPs. Acceptable for your own domain; would need an egress control or resolver pinning if the allow-list were ever widened. | Documented; do not widen the allow-list without that. |
| Low | `DEV_ADMIN_AUTO_AUTH=true` exists in `.env.local`; harmless in production (requires `NODE_ENV=development`) but **confirm it is absent from the Vercel production environment**. | Owner to confirm. |
| Info | Sync route allows non-browser clients with no `Origin` header, but they still need a valid signed admin token. | By design. |
| Info | The 3 audit-log writes use the existing fire-and-forget `logAuditEvent` (failures are logged, not surfaced). | Existing behaviour. |

## 4. Side effects of testing — disclosure

Running the authenticated page checks made Mongoose create the 6 new (approved) collections and their indexes in the database configured by `.env.local`, and the `SUPER_ADMIN` "verify" call wrote one `seo_integration_configs` document recording `status: NOT_CONFIGURED`. No existing collection or document was modified. No synthetic analytics rows were written anywhere.
