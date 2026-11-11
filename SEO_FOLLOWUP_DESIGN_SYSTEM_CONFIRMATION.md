# Follow-up Task 1 — Design-System Convention Confirmation

**Date:** 2026-11-11
**Resolves:** Decision **D1** in `MISSING_INDEXED_PAGE_RECONSTRUCTION_PLAN.md`

## Confirmation

**Confirmed.** The authoritative design system is the one already in the repo:

1. Tailwind CSS **v4**, configured CSS-first.
2. Hand-written vanilla CSS in `src/app/globals.css`.
3. The design tokens declared in that same file.
4. The reusable components under `src/components/`.

No styling migration or rewrite is proposed or performed. The earlier brief line "do not use Tailwind CSS" is interpreted as **"do not introduce a second styling system or theme"**. It cannot mean "stop using Tailwind", because the entire site is built on it.

## Evidence

| Check | Result |
|---|---|
| Tailwind version and wiring | `package.json` has `tailwindcss ^4` and `@tailwindcss/postcss ^4`. `postcss.config.mjs` registers only `@tailwindcss/postcss`. |
| Config style | No `tailwind.config.*` exists. `globals.css` line 1 is `@import "tailwindcss"` and tokens live in an `@theme { … }` block (v4 CSS-first). |
| Vanilla CSS layer | `src/app/globals.css` is 1,950 lines and the **only** CSS file under `src/`. It has about 300 hand-written class selectors (`.button-primary`, `.button-ghost`, `.eyebrow`, `.editorial-grid`, `.hero-*`, `.about-*`, `.advisor-*` …) alongside `:root` variables. |
| Token layer 1 (`@theme`) | Brand colours (`--color-primary-blue #1B84C4`, `-dark`, `-light`, `--color-neutral-bg`, text, border, status), six font tokens (heading Fraunces, Playfair, signature Alex Brush, Instrument Serif, body Plus Jakarta Sans, mono JetBrains Mono), and `--max-width-container: 75rem`. |
| Token layer 2 (`:root`) | `--alabaster`, `--ivory`, `--midnight`, `--navy`, `--ratiwal-blue #087fc3`, `--gold #c9a15a`, shadows `xs`–`lg` plus glow, radii `sm`–`xl`, easing curves, `--whatsapp`. |
| Adoption | 543 `.tsx` files use `className`. 121 of those usages directly reference the `@theme` tokens (a floor, since my pattern only caught a subset). |
| Shared components | `ui/` (Badge, Button, Card, Input, Modal, Select, Textarea, LogoLoader), `layout/` (Header, Footer, MobileNavigation, FloatingWhatsAppButton), `shared/` (Container, Breadcrumbs, SectionHeader, EmptyState), plus domain folders (`property`, `locations`, `insights`, `testimonials`, `forms`, `sections`, `home`, `legal`, `seo`). |
| Documented in project guides | `CLAUDE.md` §1: "Tailwind CSS + Vanilla CSS (`globals.css`)". `DEVELOPER_GUIDE.md`: "Tailwind CSS v4 with `@theme` token definitions". |

## Rules for any future page (unchanged from the plan)

- Reuse `Header`, `Footer`, `MobileNavigation`, `Container`, `Breadcrumbs`, `SectionHeader` and the `ui/` primitives.
- Use existing tokens and existing global classes. Do not add a new palette, font or icon set (`lucide-react` is the icon set).
- Inner pages keep the navbar clearance `pt-28 sm:pt-32 md:pt-36` (CLAUDE.md §5).
- Add new vanilla CSS only to `globals.css`, in the existing naming style.

## Observations (informational, no action taken)

1. **Two overlapping token layers.** `@theme` blue is `#1B84C4`; `:root` blue is `#087fc3`. Both are live in the codebase. Do not "normalise" them as part of unrelated work, because that would shift colours site-wide.
2. **Hard-coded colours in the dashboard** (for example `text-[#071a28]` in `SeoConnectionPanel.tsx`). The dashboard is internal and out of scope here.
3. **CLAUDE.md §5 vs the default surface.** CLAUDE.md §5 describes a dark-luxury glass language, while `:root` defaults to white/alabaster surfaces. I did not audit visually which applies to which page. If a page is ever built, the Phase C visual audit should settle that per page type.
