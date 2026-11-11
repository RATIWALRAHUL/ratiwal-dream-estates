# Phase 7 (7B) — Inquiry Funnel Audit

**Date:** 2026-11-11 · audit only; **no form, endpoint or data was changed.** Evidence: code review of the forms, `/api/enquiries`, `/api/site-visits/requests`, `src/lib/validations/lead.ts`; and live requests to a **local build** using **invalid or non-persisting payloads only**. **No valid lead was submitted anywhere, so successful persistence, notification delivery and duplicate-merge were verified from code, not by test.**

## 1. Channel inventory
| Channel | Component → endpoint | Server validation | Spam controls | Dedupe |
|---|---|---|---|---|
| Inquiry | `EnquiryForm` → `POST /api/enquiries` (alias `/api/inquiries`) | Zod `publicInquirySchema`; phone normalised to E.164 | honeypot (rejected by schema with 400 "Spam detected"); IP limit 10/15 min, phone 3/h, email 5/h (in-memory); body ≤ 32 KB; JSON only | fingerprint = phone + property + location within **30 minutes** → returns the existing reference |
| Site visit | `SiteVisitForm`, `EmbeddedSiteVisit`, `ContactFormHub` tab → `POST /api/site-visits/requests` | Zod `publicSiteVisitRequestSchema`; server rejects dates not in the future (with a grace window); **email required** | honeypot, same rate limits, timing check (4 s) | fingerprint; reuses a `Lead` found by `normalizedPhone` |
| WhatsApp / phone | links only | none | none | none (nothing stored) |

## 2. Form-by-form evaluation (brief §4)
| Criterion | Inquiry form | Site-visit form |
|---|---|---|
| Fields | name, phone, **email (required)**, preferred location, property type, budget, message, honeypot | name, phone, **email (required)**, date, time select, visitors, message, honeypot |
| Minimum information | 🟡 email is mandatory ("for instant acknowledgement") — extra friction; budget/type optional | 🟡 email also mandatory |
| Consent & privacy notice | ❌ **no consent control or privacy notice in either form**; the server **defaults `consentGranted` to `true`** when absent, and `SiteVisitForm` hard-codes `true` | same |
| Server-side validation | ✅ strict (name charset, phone regex, email, operator-injection payload rejected with 400) | ✅ |
| Clear validation messages | ✅ field errors returned and shown | ✅ |
| Duplicate-submission prevention | ✅ button loading state + 30-minute fingerprint | ✅ fingerprint |
| Loading states | ✅ `isLoading` button | ✅ |
| Success confirmation | ✅ shown only when `response.ok && data.success`; shows reference number | ✅ |
| Error recovery / values preserved | ✅ react-hook-form keeps values on error; server field errors mapped | ✅ |
| Accessibility | labels present; `tel`/`email`/`date` input types; honeypot hidden | `min` on date |
| Mobile controls | native types used; real-device test not done | — |
| Reliable persistence | ✅ Lead created before success is returned; notification failure is non-blocking (lead remains) | ✅ |

## 3. Verified defects and risks
| ID | Severity | Finding | Evidence |
|---|---|---|---|
| F1 | **High (privacy/compliance)** | **Consent is assumed, not collected.** No checkbox or notice; `consentGranted` defaults to `true` server-side and is hard-coded `true` in `SiteVisitForm`; the stored record then states a consent purpose/version/timestamp that the visitor never actively gave | E-code (route lines 121–123, schema default, form body) — needs legal review against Indian data-protection law |
| F2 | **High (data integrity)** | **`SiteVisitForm` ignores the visitor's chosen time:** `preferredStartAt` is always `<date>T11:00:00+05:30`; the `preferredTime` select is never sent. **Side effect:** choosing *today* after 11:00 IST is rejected by the server ("Must be in the future") even if the visitor picked a later time | E-code (`SiteVisitForm.tsx` lines 67–69, request body) |
| F3 | Medium | The site-visit endpoint's **4-second timing check returns a fake success (with a reference that does not exist) and stores nothing** when `_formStartedAt` is under 4 s. `EmbeddedSiteVisit` sends that timestamp, so a fast human (autofill) could be told "success" while no lead is stored. The inquiry endpoint's 5-second check is inert because `EnquiryForm` never sends the timestamp | E-code; **not reproduced** (would need a valid submission) |
| F4 | Medium | The dashboard setting "duplicate detection window (30 days)" is **not wired**: the public endpoints use a fixed 30-minute constant | E-code (setting appears only in the settings UI/model) |
| F5 | Medium | **Notification reliability:** after the lead is saved, the endpoint enqueues customer + internal messages and **awaits an inline delivery attempt** (adds latency to the response). Failures are logged and swallowed; retries depend on `/api/internal/notifications/process`, which **nothing schedules** (no cron/`vercel.json`) | E-code, Phase 4A finding F8. Also `COMMUNICATIONS_MODE=live` locally: real emails would be sent on valid submissions |
| F6 | Low | Client falls back to a hard-coded reference `"RDE-ENQ-CONFIRMED"` if the server omits one | E-code |
| F7 | Low | Invalid/oversized requests are rejected before the rate limiter, so malformed floods are cheap to send and unthrottled (bounded by body-size cap) | E-probe (12 rapid invalid posts → 12 × 400, no 429) |
| F8 | Low | A non-empty honeypot is rejected with 400 "Spam detected" rather than a silent fake success (the silent branch is unreachable) — acceptable; it just tells bots they were detected | E-probe |
| F9 | Info | Reference numbers are cryptographically random (not enumerable) | E-code (`randomBytes`) |
| F10 | Info | `/api/enquiries` and `/api/inquiries` are the same handler; three *site-visit* UI variants exist (`SiteVisitForm`, `EmbeddedSiteVisit`, contact tab) with slightly different payload construction | E-code |

## 4. Test evidence (local production build; nothing persisted)
| Test | Expected | Result |
|---|---|---|
| `GET /api/enquiries` | 405 | ✅ 405 |
| `Content-Type: text/plain` | 415 | ✅ 415 |
| Invalid JSON | 400 | ✅ 400 |
| `{}` | 400 + per-field errors | ✅ |
| Bad name/phone/email | 400 + field errors | ✅ |
| Operator injection in `fullName` (`{"$ne":1}`) | rejected | ✅ 400 ("expected string, received object") |
| Honeypot filled | no lead | ✅ 400 "Spam detected" (nothing stored) |
| `GET /api/site-visits/requests` | 405 | ✅ 405 |
| Site visit: `{}` and past date + bad phone | 400 | ✅ 400 |
| Oversized body (> 32 KB) | 413 | ⛔ **not tested** (my test tooling failed on the large argument; code path read only) |
| **Valid submission persists a lead; success only after persistence** | — | ⛔ not tested (would create real data and send real email) |
| Duplicate valid submission within 30 min returns the same reference | — | ⛔ not tested |
| Notification delivery | — | ⛔ not tested |

## 5. Recommended standard (for approval)
1. **Consent:** add an unticked consent checkbox + short privacy notice linking `/privacy-policy`; server rejects `consentGranted !== true` (no default); store the consent text version actually displayed. Legal review of wording.
2. **Minimum fields:** inquiry = name + phone (+ optional email); keep email optional and test the effect (experiment E3); property context is auto-attached.
3. **Site visit:** send the real preferred date **and time** (or a time window); show the confirmation process ("we will confirm by phone/WhatsApp within X hours" — only if the team can honour it).
4. **Timing/bot checks:** never fake success for a possible human — return a soft error asking to resubmit, or just accept and flag for review.
5. **Idempotency:** add a client-generated submission key (UUID per form mount) stored on the lead so retries after a network drop never create duplicates and never lose the lead; wire the duplicate window to the real setting.
6. **Notifications:** respond to the visitor immediately after persistence and process the outbox asynchronously; schedule the processor (needs the cron decision) and alert if messages stay unsent; keep the lead as the source of truth.
7. **Single site-visit component** and one shared payload builder.
8. Add Turnstile-style bot protection only if abuse appears (external service — needs approval).
