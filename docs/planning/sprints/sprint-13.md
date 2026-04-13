# Sprint 13 — Performance, SEO & Mobile Polish

**Phase:** 6 — Settings, Admin & Polish
**Weeks:** 25–26
**Goal:** Every public page scores ≥90 on Lighthouse. All pages are fully responsive. SEO metadata is complete. Legal pages are live. The platform is production-ready from a quality standpoint.

---

## Spec References

| Document                             | Relevant Sections                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §6 Non-Functional Requirements — SSR, <2s load time, mobile-optimized, scalability |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4E Footer — financial disclaimer, legal links                                     |
| `docs/specs/UI_SPECIFICATION.md`     | §4 Key UI Interactions & Behaviors — responsive nav, mobile sidebar, tool hover    |
| `docs/specs/UI_SPECIFICATION.md`     | §3 Global Footer — disclaimer text requirement                                     |

---

## Context & Fine Print

### Performance Budget Fine Print

From `PROJECT_REQUIREMENTS.md §6`:

> "Page load speeds under 2 seconds."

The 2-second target applies to **Time to Interactive (TTI)** on a simulated mid-range mobile device (Lighthouse Mobile preset). It does not apply to the first byte (TTFB) of a cold CDN miss.

Lighthouse score targets:

- **Performance:** ≥ 90 (public pages), ≥ 80 (authenticated dashboard pages)
- **Accessibility:** ≥ 90
- **Best Practices:** ≥ 90
- **SEO:** 100 (public pages)

The authenticated dashboard pages (feed, tools) are harder to score because they load more JS (Web3 providers, charts). Target ≥ 80 for these.

### SSR / Caching Strategy Fine Print

From `PROJECT_REQUIREMENTS.md §6`:

> "Server-Side Rendering (SSR) for all public research to ensure high visibility."

Full caching strategy:

| Page Type                           | Strategy              | Revalidate  |
| ----------------------------------- | --------------------- | ----------- |
| Public article pages                | SSG + ISR             | 3600s (1h)  |
| Research/Analysis listing pages     | SSR with `revalidate` | 60s         |
| Homepage                            | ISR                   | 300s (5min) |
| Dashboard feed                      | SSR (`force-dynamic`) | Per request |
| Tool pages (Market Direction, etc.) | SSR + API caching     | Per request |
| API: CoinGecko market data          | `fetch` cache         | 300s        |
| API: DefiLlama TVL                  | `fetch` cache         | 600s        |
| API: Fear & Greed Index             | `fetch` cache         | 3600s       |

**ISR revalidation on publish:** When a post is published via Payload, call `revalidatePath('/research/top-picks/[slug]')` and `revalidateTag('posts')` using Next.js On-Demand Revalidation from the Payload `afterChange` hook. This ensures the static page updates immediately on publish, not just on the ISR timer.

### Image Optimisation Fine Print

All images must use `next/image` with correct `sizes` attribute:

| Image Context    | `sizes`                                                    |
| ---------------- | ---------------------------------------------------------- |
| Feed card (grid) | `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` |
| Feed card (list) | `(max-width: 768px) 80px, 160px`                           |
| Article hero     | `100vw`                                                    |
| Avatar (header)  | `32px`                                                     |
| Airdrop logo     | `48px`                                                     |
| Pick token logo  | `40px`                                                     |

Use `placeholder="blur"` with `blurDataURL` for all content images. Generate blur placeholders during the build using the `plaiceholder` library.

Format: all uploaded images served as WebP via Payload's image optimization.

### Bundle Optimisation Fine Print

Heavy libraries that must be code-split:

- `lightweight-charts` (~200KB) — only loaded on Market Direction page. Already using `dynamic(() => import(...), { ssr: false })`.
- `@rainbow-me/rainbowkit` + `wagmi` + `viem` (~300KB) — only loaded in `Web3Providers`, which is only in the dashboard layout. Ensure it's not accidentally imported in the public marketing pages.
- `@solana/wallet-adapter-react` (~150KB) — same as above.
- `recharts` (~170KB) — only loaded on tool pages. Use `dynamic` import.
- `react-image-crop` — only loaded on the profile settings page.

Run `@next/bundle-analyzer` to verify these are correctly split:

```bash
ANALYZE=true npm run build
```

Target: no single JS chunk over 150KB (gzipped).

### SEO Fine Print

From `PROJECT_REQUIREMENTS.md §6`:

> "Server-Side Rendering (SSR) for all public research to ensure high visibility."

**`generateMetadata` requirements per page type:**

_Article pages:_

```ts
title: `${post.title} | CryptoEdy`
description: post.excerpt (max 160 chars)
openGraph: {
  title: post.title,
  description: post.excerpt,
  images: [{ url: post.featuredImage.url, width: 1200, height: 630 }],
  type: 'article',
  publishedTime: post.publishedAt,
  authors: [post.author.displayName]
}
twitter: {
  card: 'summary_large_image',
  title: post.title,
  description: post.excerpt,
  images: [post.featuredImage.url]
}
```

_Listing pages (/research, /analysis, etc.):_

```ts
title: `${categoryName} | CryptoEdy`
description: `Latest ${categoryName} reports and analysis from CryptoEdy's research team.`
```

_Homepage:_

```ts
title: 'CryptoEdy — Premium Crypto Research & Analysis'
description: 'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.'
```

**Structured Data (JSON-LD):**
Add `<script type="application/ld+json">` on article pages:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "post.title",
  "description": "post.excerpt",
  "image": "post.featuredImage.url",
  "datePublished": "post.publishedAt",
  "author": { "@type": "Person", "name": "post.author.displayName" },
  "publisher": { "@type": "Organization", "name": "CryptoEdy" }
}
```

**`sitemap.ts`:**
Include: all published posts, all categories, all airdrops. Exclude: `/dashboard/*`, `/settings/*`, `/admin/*`, `/api/*`.

**`robots.ts`:**

```
User-agent: *
Allow: /
Allow: /research/*
Allow: /analysis/*
Allow: /education/*
Disallow: /dashboard/*
Disallow: /settings/*
Disallow: /admin/*
Disallow: /api/*
```

**Canonical URLs:** Every public page must have a `<link rel="canonical">` tag. Use the absolute URL with HTTPS and the production domain.

### Mobile Responsive Fine Print

From `UI_SPECIFICATION.md §4`:

> "Mobile: Sidebar collapses into a hamburger menu; Header search becomes a compact icon."
> "Tablets: Sidebar stays slim; Feed switches to single/double-column grid."

Complete responsive audit — every page at these breakpoints:

- **Mobile:** 375px (iPhone SE), 390px (iPhone 15)
- **Tablet:** 768px (iPad)
- **Desktop:** 1280px, 1440px

Known required changes (non-exhaustive):

- `Sidebar` → `BottomNavBar` on mobile (already flagged in Sprint 4 — confirm it's correct)
- `Header` search → icon-only on mobile
- `NotificationBell` dropdown → full-screen drawer on mobile (use Shadcn `Drawer`)
- `FeedGrid` → 1 col mobile, 2 col tablet, 3 col desktop
- `PaymentModal` → full-screen on mobile (not a floating modal)
- `Settings` → stacked layout on mobile
- `DataTable` (admin) → horizontal scroll on mobile
- `ConversionWall` → vertical stack on mobile
- Portfolio `HoldingsTable` → horizontal scroll on mobile
- `PickCard` → full width single column on mobile
- `AirdropCard` → full width single column on mobile
- Tools charts → reduced height on mobile, touch-enabled scrolling

### Accessibility Fine Print

From `PROJECT_REQUIREMENTS.md §6` (implied by non-functional requirements):

WCAG AA compliance:

- **Colour contrast:** All text must meet 4.5:1 ratio. Check: neon green `#00FF41` on white `#FFFFFF` — **fails** (2.3:1). Fix: use `#00B32D` (darker green) for text where colour conveys meaning. Reserve `#00FF41` for backgrounds only (PRO badge, toggle switches).
- **Focus indicators:** All interactive elements show a visible focus ring. Use Tailwind `focus-visible:ring-2 focus-visible:ring-primary`.
- **ARIA labels:** All icon-only buttons must have `aria-label`. Check:
  - Bell icon: `aria-label="Notifications"`
  - Search icon: `aria-label="Open search"`
  - Sidebar home icon: `aria-label="Home"`
  - "Mark as read" checkmark: `aria-label="Mark notification as read"`
- **Skip link:** Add a "Skip to main content" link as the first focusable element in the layout.
- **Form labels:** Every form input has an associated `<label>` (not just a placeholder).
- **Image alt text:** All `next/image` components have `alt` props. Content images use the CMS `altText` field.

### Legal Pages Fine Print

From `PROJECT_REQUIREMENTS.md §4E` (footer links):

> "Privacy Policy, Terms & Conditions, Contact Us"

And footer disclaimer:

> "Comprehensive Financial Disclaimer text in the footer base (acknowledging the platform is for educational/informational purposes and not financial advice)."

Required pages:

- `/legal/privacy` — Privacy Policy (full text — get from legal counsel or use a generator for the platform structure)
- `/legal/terms` — Terms & Conditions
- `/legal/disclaimer` — Full financial disclaimer (not just footer text)
- Footer disclaimer text: **permanent, appears on every page**, in the Footer component. From `UI_SPECIFICATION.md §3`. Text must include: educational/informational intent, no financial advice claim, risk acknowledgment.

Both pages are static content — use Payload CMS to manage them (so legal team can update without a code deploy). Create a `LegalPages` Payload collection with `slug` and `content` (rich text) fields.

---

## Task Checklist

### On-Demand Revalidation

- [ ] Update Payload `Posts afterChange` hook: call `revalidatePath` + `revalidateTag('posts')` on publish
- [ ] Update Payload `Airdrops afterChange` hook: call `revalidatePath` on publish
- [ ] Add `REVALIDATION_SECRET` env var for external revalidation requests
- [ ] `POST /api/revalidate` — accepts `{ secret, path }` for manual cache busting (admin use)

### Image Optimisation

- [ ] Audit all `<img>` tags — convert to `next/image` with correct `sizes`
- [ ] Install `plaiceholder` — generate `blurDataURL` for feed card images
- [ ] Verify Payload Media adapter serves WebP format
- [ ] Add `placeholder="blur"` to all content images

### Bundle Analysis

- [ ] `ANALYZE=true npm run build` — review bundle report
- [ ] Verify `lightweight-charts` only appears in Market Direction page bundle
- [ ] Verify `@rainbow-me/rainbowkit` + `wagmi` only appear in dashboard bundle (not public pages)
- [ ] Verify `recharts` is code-split per tool page
- [ ] Fix any unexpected large imports

### SEO

- [ ] `generateMetadata` on all article pages (with full OG + Twitter card)
- [ ] `generateMetadata` on all listing pages (`/research`, `/analysis`, `/education`)
- [ ] `generateMetadata` on homepage
- [ ] `generateMetadata` on airdrop detail pages
- [ ] `generateMetadata` on pick detail pages
- [ ] JSON-LD structured data on article pages
- [ ] `app/sitemap.ts` — includes all published posts, categories, airdrops
- [ ] `app/robots.ts` — configured as above
- [ ] Canonical URL meta tag on all public pages
- [ ] Verify `curl {article_url}` returns populated HTML (title, meta tags present)

### Mobile Responsive Pass

- [ ] Full audit at 375px, 768px, 1280px for every page
- [ ] `NotificationBell` dropdown → Shadcn `Drawer` on mobile
- [ ] `PaymentModal` → full-screen on mobile (`h-screen` + no border radius)
- [ ] `DataTable` → `overflow-x-auto` wrapper on mobile
- [ ] `HoldingsTable` → horizontal scroll on mobile
- [ ] `PicksGrid` → 1 column on mobile
- [ ] `AirdropGrid` → 1 column on mobile
- [ ] Tools charts → reduced height + touch scroll on mobile
- [ ] Settings → single column on mobile
- [ ] Admin dashboard → simplified mobile view (tables with horizontal scroll)

### Accessibility

- [ ] Colour contrast audit — fix `#00FF41` on white text usage
- [ ] Add `focus-visible:ring` to all interactive components
- [ ] Add `aria-label` to all icon-only buttons (full audit)
- [ ] Add skip-to-main-content link in root layout
- [ ] All form inputs have associated `<label>` elements
- [ ] Screen reader test: register flow, article read, payment flow

### Legal & Compliance

- [ ] Create `LegalPages` Payload collection: `title`, `slug`, `content` (rich text), `updatedAt`
- [ ] Seed: Privacy Policy, Terms & Conditions, Financial Disclaimer
- [ ] `app/legal/[slug]/page.tsx` — renders legal page from Payload
- [ ] Update Footer: all legal links point to `/legal/*` pages
- [ ] Footer financial disclaimer text: permanently rendered in `<Footer>` component
- [ ] Cookie consent banner (`react-cookie-consent` or custom) if targeting EU users

### Database Indexes

- [ ] Confirm all required indexes are in place (from Sprint 11 and others):
  - `users(role)`, `users(subscriptionExpiry)`, `users(email)` UNIQUE
  - `posts(isProOnly)`, `posts(publishedAt)`, `posts(status)`
  - `notifications(userId, isRead)`, `notifications(userId, createdAt DESC)`
  - `threads(category)`, `threads(isPinned, updatedAt)`
  - `messages(conversationId, createdAt)`
- [ ] Run `EXPLAIN ANALYZE` on the most common queries; ensure no sequential scans on large tables

### Lighthouse Audit

- [ ] Run Lighthouse on: `/` (homepage), `/research/top-picks/[slug]` (article), `/dashboard/feed` (authenticated feed)
- [ ] Fix all issues blocking ≥90 score on public pages
- [ ] Document final scores in a `docs/planning/LIGHTHOUSE_SCORES.md`

---

## Acceptance Criteria / Definition of Done

- [ ] Lighthouse Performance ≥ 90 on all public pages
- [ ] Lighthouse Accessibility ≥ 90 on all pages
- [ ] Lighthouse SEO = 100 on all public pages
- [ ] `curl {article_url}` returns fully rendered HTML with correct meta tags
- [ ] Sitemap is accessible at `/sitemap.xml` and includes all published posts
- [ ] Robots.txt correctly disallows dashboard and API routes
- [ ] All images use `next/image` with correct `sizes`
- [ ] No single JS chunk exceeds 150KB (gzipped) — confirmed via bundle analyser
- [ ] All pages render correctly at 375px mobile width
- [ ] All tables have horizontal scroll on mobile (no content overflow)
- [ ] Notification dropdown renders as a full-screen drawer on mobile
- [ ] Skip-to-main-content link is the first focusable element
- [ ] All icon-only buttons have `aria-label`
- [ ] Neon green `#00FF41` is not used for body text (contrast issue fixed)
- [ ] `/legal/privacy`, `/legal/terms`, `/legal/disclaimer` all load correctly
- [ ] Footer financial disclaimer text appears on every page

---

## Dependencies

- All previous sprints (1–12) — this sprint polishes the complete feature set

---

## Hands-off to Sprint 14

Sprint 14 is the final QA and launch sprint. All features must be complete and stable before Sprint 13 starts — Sprint 13 fixes quality issues, it does not add features. If a feature is not done by the end of Sprint 12, it either gets cut or delayed to post-launch.
