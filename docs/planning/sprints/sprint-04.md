# Sprint 4 — Home Feed & Article Page

**Phase:** 2 — Content System & Core UI
**Weeks:** 7–8
**Goal:** The full content browsing experience is live. Users can navigate the feed, read articles, and hit the paywall. Public pages are SSR-rendered for SEO.

---

## Spec References

| Document                             | Relevant Sections                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4A General Visual Identity                                                     |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4B Top Navigation Header — search, notification bell, user dropdown            |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4C Left Sidebar Navigation                                                     |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4D Home Feed Components — PRO badge, category labels, metadata, portfolio card |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4J Article & Gated Content Page — paywall, trust blocks, conversion flow       |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §6 Non-Functional Requirements — SSR, page load <2s                             |
| `docs/specs/UI_SPECIFICATION.md`     | §2A Home Feed — layout, filters, sidebar, search                                |
| `docs/specs/UI_SPECIFICATION.md`     | §2B Article & Gated Content Page — breadcrumbs, content flow, trust blocks      |
| `docs/specs/UI_SPECIFICATION.md`     | §4 Key UI Interactions — content blurring, responsive nav, tool hover           |
| `docs/specs/USER_JOURNEY.md`         | §1 Guest → Registered Conversion — content blur, registration CTA               |
| `docs/specs/USER_JOURNEY.md`         | §3 Content Discovery & Tools Usage — feed filtering, article reading            |

---

## Context & Fine Print

### Layout Architecture Fine Print

The app has three distinct layout layers:

1. **Root Layout** (`app/layout.tsx`) — HTML shell, fonts, global providers (theme, toast, auth session)
2. **Dashboard Layout** (`app/(dashboard)/layout.tsx`) — Header + Sidebar + main content. Wraps all authenticated pages.
3. **Auth Layout** (`app/(auth)/layout.tsx`) — Minimal centered card. No header/sidebar.

The dashboard layout must be a **Server Component** that fetches the current user session server-side. The Header and Sidebar receive the user as props — they should not independently fetch session data.

### Top Navigation Header Fine Print

From `PROJECT_REQUIREMENTS.md §4B`:

**Search bar:**

- Centered, wide input with placeholder text and `⌘ /` keyboard shortcut hint.
- Shortcut `⌘ /` (Mac) / `Ctrl /` (Windows) opens a **command palette modal** (Shadcn `CommandDialog`).
- In this sprint: UI only — the command palette opens but search results are a static placeholder ("Search coming soon"). Real search is wired in Sprint 13.
- On mobile: search bar collapses to a search icon. Tapping opens a full-screen search overlay.

**Notification Bell:**

- Bell icon with a red badge showing unread count.
- In this sprint: badge shows "0" (static placeholder). Bell dropdown is a placeholder panel.
- Full notification wiring happens in Sprint 10 — do not block Sprint 4 on this.
- The dropdown panel structure (tabs: All / Content / Community, "Mark all as read", notification item layout) must be built now so Sprint 10 only needs to wire data.

**User Avatar Dropdown:**
From `PROJECT_REQUIREMENTS.md §4B`:

- Account Settings → `/settings/profile`
- Referral → `/referral`
- Support → external link or `/support`
- Log out → calls NextAuth `signOut()`, redirects to `/`
- Must show user's display name or email (truncated) in the dropdown trigger.

### Sidebar Fine Print

From `PROJECT_REQUIREMENTS.md §4C` and `UI_SPECIFICATION.md §2A`:

- **Slim sidebar** — icon-only on default, label visible on hover or always-visible depending on breakpoint.
- Icons: Home (`/feed`), Community (`/community`), Tools (hover submenu).
- **Active state:** Blue icon + text for the current section (from `UI_SPECIFICATION.md §1`: Primary `#0052FF`).
- **Tools hover submenu:** On desktop, hovering Tools in the sidebar reveals a slide-out panel with links to: Market Direction, Assets & Picks, Portfolio Tracker, Airdrops. From `UI_SPECIFICATION.md §4`: "Tool Hover Logic: Tools in the sidebar reveal a slide-out menu on hover for instant navigation."
- **Mobile:** Sidebar collapses entirely. Bottom navigation bar with icons: Home, Community, Tools, Profile. From `UI_SPECIFICATION.md §4`: "Mobile: Sidebar collapses into a hamburger menu."

### Home Feed Page Fine Print

From `PROJECT_REQUIREMENTS.md §4D`:

**Personalized header:**

> "User's feed" title (e.g., `ansari.rahman's feed`)
> Uses the user's `username` or `displayName`. If not set, fall back to the part of the email before `@`.

**Layout toggle:**

- Grid view: 3-column on desktop, 2 on tablet. Card with featured image, badges, title, excerpt.
- List view: Single column. Horizontal card with image on left, content on right.
- Preference persisted to `localStorage` under key `feed-layout-preference`.
- Default: Grid view.

**Filter pills:**

- All | Research | Analysis (from `UI_SPECIFICATION.md §2A`)
- Client-side filter — do not re-fetch from server on filter change. Fetch all posts once on load (max 24), filter in memory.
- Active pill: blue background + white text. Inactive: grey background.

**Feed item card — fine prints:**

- **Gold PRO badge**: `isProOnly: true` → show gold badge with text "PRO". From `UI_SPECIFICATION.md §1`: Gold = `#FFD700`. Badge sits in the top-left corner of the featured image.
- **Category badge**: Grey secondary badge showing the category name (e.g., "Research Report", "Market Direction").
- **Read time**: Formatted as "18 min read" — uses the `readTime` field from Sprint 3.
- **Published date**: Relative for recent (< 7 days: "3 days ago") then absolute ("Mar 15, 2025").
- **Hover state**: Subtle shadow elevation + cursor pointer. No color change on title.
- **Clicking a card**: Navigates to the article page. The full URL is `/{category-type}/{category-slug}/{post-slug}`.

**Portfolio Summary Card:**
From `PROJECT_REQUIREMENTS.md §4D`:

> "Portfolio Summary Card (Sticky/Pinned): Header 'Your portfolios'. Metrics: Total Balance (USD) and Total Profit/Loss. Design: Blue gradient background with subtle wave pattern."

- In this sprint: static placeholder values (e.g., "$0.00" / "+0%"). Real data wired in Sprint 8.
- Must be pinned/sticky at the top of the right column (on desktop) or top of feed (on mobile, collapsed by default).
- The blue gradient background: `from-[#0052FF] to-[#003ACC]` with a subtle SVG wave pattern overlay.

**Pagination:**

- Fetch 12 posts per page via Payload Local API.
- "Load more" button at the bottom (not infinite scroll — avoid complexity for now).
- SSR for initial 12. Client-side fetch for subsequent pages.

### Article Page Fine Print

From `PROJECT_REQUIREMENTS.md §4J` and `UI_SPECIFICATION.md §2B`:

**URL structure:** `/{category-type}/{category-slug}/{post-slug}`
Examples:

- `/research/top-picks/ethereum-the-everything-exchange`
- `/analysis/market-updates/crypto-outlook-q1`

**Breadcrumbs:**

> "Breadcrumbs: e.g., CryptoEdy > Research > 'The Everything Exchange'"
> Use the format: `Home > {Category Type} > {Post Title}` — each crumb is a link.

**Metadata bar:**

- Published date (absolute format: "March 15, 2025")
- Read time ("18 min read")
- Comment count placeholder (Community integration in Sprint 11)
- Social share icons: Copy Link (clipboard API), X (Twitter intent URL), Facebook share URL

**Content Gating Logic — Critical Fine Print:**
From `USER_JOURNEY.md §1`:

> "User reads the first 20% of the article. The content then 'blurs' or shows a 'Create Free Account to Continue Reading' CTA."

More precisely:

- `isProOnly: false` → Full content rendered for everyone (including guests).
- `isProOnly: true` + user role is `pro | analyst | admin` → Full content rendered.
- `isProOnly: true` + user role is `free` → Show first 20% of content + blur transition + conversion wall ("Join Pro to continue").
- `isProOnly: true` + unauthenticated (guest) → Show first 20% of content + blur transition + conversion wall ("Create free account" OR "Join Pro").

The "first 20%" is calculated by rendering the Lexical content to a node tree and taking the first N nodes that constitute ~20% of the total word count. Do not truncate mid-sentence. Do not truncate mid-paragraph. Find the nearest paragraph break at or before the 20% mark.

The blur transition: CSS `mask-image: linear-gradient(to bottom, black 50%, transparent 100%)` applied to the last visible content block. Not a hard cut. From `UI_SPECIFICATION.md §4`: "Content Blurring: Non-Pro users see a smooth CSS blur or fade transition before the conversion wall."

**Conversion wall block** (shown immediately after the blurred content):

- Heading: "Continue reading by joining CryptoEdy Pro"
- Inline `$100/year` pricing card with "Upgrade" CTA → links to `/settings/plans`
- "What's included in Pro" feature checklist (static in this sprint, wired in Sprint 5)
- If user is `guest` (not logged in): show "Create free account" as secondary CTA below the pricing card

**Trust blocks (below the conversion wall):**
From `PROJECT_REQUIREMENTS.md §4J`:

1. **3X Value Guarantee Section:** "Refund policy if cumulative upside doesn't reach target." Static text + "Get started" CTA + "Trusted by 300,000+ Investors" trust signal.
2. **Track Record Showcase:** Horizontal scroll grid of winning picks. Each card: token name, entry/exit price, percentage gain. E.g., ETH +6,082%, BTC +1,204%. In this sprint: hardcoded static data. Dynamic data from Picks in Sprint 8.
3. **FAQ Accordion:** 5–7 questions. Shadcn `Accordion` component. Sample questions: "Is the platform for beginners?", "What is the 3X Value Guarantee?", "How do I cancel?", "What assets do you cover?"

**Recommended Content:**

> "'Recommended from CryptoEdy': A 'Related Content' footer grid (similar to the Home Feed) with navigation arrows."

- 3 posts from the same category.
- Fetched server-side via Payload Local API: `where: { category: { equals: post.category }, id: { not_equals: post.id }, status: { equals: 'published' } }`, limit 3.

**SSG + ISR Fine Print:**
From `PROJECT_REQUIREMENTS.md §6`:

> "Server-Side Rendering (SSR) for all public research to ensure high visibility. Page load speeds under 2 seconds."

Implementation:

- Use `generateStaticParams` to pre-render all published posts at build time (SSG).
- Use `revalidate: 3600` (1 hour) for ISR — newly published posts become available within 1 hour without a full redeploy.
- The feed page itself uses SSR (`dynamic = 'force-dynamic'` or no cache) to show personalised content.

### Public Listing Pages Fine Print

- `/research`, `/analysis`, `/education` — listing pages filtered by `category.type`.
- These are public (no auth required) — they must be SSR for SEO.
- Use the same feed card component as the home feed.
- Include `generateMetadata` for each listing page (SEO title/description).

### Homepage Fine Print

- Publicly accessible at `/`.
- Sections: hero (platform value prop), 3 featured articles (teaser, SSR), CTA section ("Join 300,000+ investors"), footer.
- The hero CTA: "Get Started Free" → `/register`. Secondary CTA: "See Pro Plans" → `/settings/plans`.
- This is a marketing page — not the same as the dashboard feed. Different layout (no sidebar).

---

## Task Checklist

### Layout Shell

- [ ] `app/layout.tsx` — root layout: Inter font, `ThemeProvider` (next-themes), `Toaster` (Shadcn), `SessionProvider` (NextAuth)
- [ ] `app/(dashboard)/layout.tsx` — server component: fetches session, renders `<Header>`, `<Sidebar>`, `<main>`
- [ ] `components/common/Header.tsx` — logo, search bar, notification bell, user dropdown
- [ ] `components/common/Sidebar.tsx` — Home, Community, Tools with hover submenu
- [ ] `components/common/Footer.tsx` — blue background, 4 link columns, social icons, legal disclaimer
- [ ] `components/common/CommandPalette.tsx` — Shadcn `CommandDialog`, `⌘/` shortcut binding, placeholder results

### Home Feed

- [x] `app/(app)/(dashboard)/feed/page.tsx` — fetches posts via Payload Local API, delegates to `<FeedClient>` for view toggle + filter interactivity
- [ ] `components/feed/FeedHeader.tsx` — personalized username display
- [x] `components/feed/view-toggle.tsx` — Grid/List toggle (filename differs from spec)
- [ ] `components/feed/FilterPills.tsx` — All/Research/Analysis tabs, client-side filter logic
- [ ] `components/feed/FeedGrid.tsx` — renders cards in grid layout
- [ ] `components/feed/FeedList.tsx` — renders cards in list layout
- [x] `components/feed/article-card.tsx` + `article-card-list.tsx` — grid and list variants (filenames differ from spec)
- [ ] `components/feed/PortfolioCard.tsx` — static placeholder, blue gradient, wave pattern SVG
- [ ] `components/feed/LoadMore.tsx` — client component for pagination

### Article Page

- [x] `app/(app)/(dashboard)/articles/[slug]/page.tsx` — Payload Local API fetch, role-based gating with `ROLE_HIERARCHY`, subscription expiry downgrade, `PaywallGate` with `isAuthenticated` prop _(URL simplified to `/articles/[slug]`; SSG/ISR and `generateMetadata` deferred to Sprint 13)_
- [ ] `components/article/Breadcrumbs.tsx`
- [ ] `components/article/MetadataBar.tsx` — date, read time, share buttons
- [ ] `components/article/ArticleBadges.tsx` — PRO badge + category badge
- [ ] `components/article/RichTextRenderer.tsx` — Lexical JSON → React (use `@payloadcms/richtext-lexical/react`)
- [x] `components/article/paywall-gate.tsx` — content gating + conversion wall combined (filename differs from spec)
- [x] `components/article/ConversionWall.tsx` — included in `paywall-gate.tsx`
- [ ] `components/article/TrustBlocks.tsx` — 3X guarantee, track record grid, FAQ accordion
- [ ] `components/article/RecommendedPosts.tsx` — 3 related posts from same category

### Public Pages

- [ ] `app/page.tsx` — marketing homepage: hero, featured articles, CTA, footer
- [ ] `app/research/page.tsx` — listing page filtered by type: research
- [ ] `app/analysis/page.tsx` — listing page filtered by type: analysis
- [ ] `app/education/page.tsx` — listing page filtered by type: education
- [ ] `generateMetadata` on all listing pages and article pages

### Mobile Responsive

- [ ] Sidebar → bottom navigation bar on mobile (below `md` breakpoint)
- [ ] Header search → icon-only on mobile, expands to full-screen overlay on tap
- [ ] Feed grid → 1 column on mobile (`grid-cols-1`), 2 on tablet (`md:grid-cols-2`), 3 on desktop (`lg:grid-cols-3`)
- [ ] Article conversion wall → stacked single column on mobile
- [ ] Sidebar Tools hover submenu → tap-to-open on mobile (no hover on touch)

---

## Acceptance Criteria / Definition of Done

- [ ] Home feed loads with seed data posts in grid view
- [ ] Layout toggle switches between Grid and List, preference persists on page reload
- [ ] Filter pills filter feed cards client-side by Research / Analysis
- [x] Feed cards display PRO badge only on `isProOnly: true` posts
- [ ] Clicking a feed card navigates to the correct article URL
- [x] Article page displays full content for Pro users
- [x] Article page shows 20% + blur + conversion wall for Free users
- [x] Article page shows 20% + blur + conversion wall with "Create account" CTA for guests
- [ ] Breadcrumbs display the correct path and are all clickable links
- [ ] Social share "Copy Link" copies the URL to clipboard
- [ ] `generateMetadata` produces correct OG title and description for an article
- [ ] `curl` on a public article URL returns rendered HTML (not empty shell) — confirms SSR
- [ ] Recommended posts show 3 articles from the same category
- [ ] `/research`, `/analysis`, `/education` listing pages load and show filtered content
- [ ] Homepage loads without auth (marketing page)
- [ ] Sidebar Tools hover reveals submenu on desktop
- [ ] Bottom nav bar appears on mobile (< 768px)
- [ ] Portfolio card renders with static placeholder data

---

## Dependencies

- Sprint 2 complete (auth, sessions)
- Sprint 3 complete (Payload collections, seed data available)

---

## Hands-off to Sprint 5

Sprint 5 wires the Plans page and payment flow. The conversion wall's "Upgrade" CTA currently points to `/settings/plans` as a placeholder. Sprint 5 builds that page and the payment steps. The article page content gating logic must be stable — Sprint 5 does not touch it.
