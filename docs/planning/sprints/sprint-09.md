# Sprint 9 — Airdrop Hub

**Phase:** 4 — Tools Suite
**Weeks:** 17–18
**Goal:** Pro members can discover upcoming and active airdrops, follow step-by-step task guides, and track their personal completion progress per airdrop.

---

## Spec References

| Document                             | Relevant Sections                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4C Tools & Market Insights — Airdrops: task-based progress tracking                   |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4E Footer — "Airdrop Reports" under Research column                                   |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §3 User Roles — Pro members get access to curated airdrop guides                       |
| `docs/specs/USER_JOURNEY.md`         | §3 Content Discovery & Tools Usage — "User checks Airdrops tool to mark step complete" |

---

## Context & Fine Print

### Airdrop Hub vs Airdrop Reports Fine Print

There are two distinct airdrop features in the platform:

1. **Airdrop Reports** (Content) — Long-form research articles published via Payload CMS `Posts` collection with `category: 'airdrop-reports'`. These are editorial pieces (e.g., "The Complete Guide to the Arbitrum Airdrop"). Managed in Sprint 3 (CMS).

2. **Airdrop Hub** (Tool) — An interactive tracking tool. Each airdrop has a checklist of tasks. Users mark tasks complete and see their progress. This is what Sprint 9 builds.

Both features are linked: an Airdrop Hub entry can reference its corresponding Airdrop Report article. On the airdrop detail page, there's a "Read full analysis →" link to the article.

### Airdrop Data Model Fine Print

`Airdrops` Payload collection:

```
name: text (required — e.g., "zkSync Era")
slug: text (auto-generated, unique)
logo: upload (relation to Media — required)
chain: select (Ethereum | Solana | Polygon | Arbitrum | zkSync | Base | Other)
status: select (upcoming | active | ended) — default: upcoming
estimatedValue: text (nullable — e.g., "$500–$5,000" — intentionally a text range, not a number)
deadline: date (nullable — last date to complete tasks)
description: richText (Lexical — overview of the airdrop)
officialLink: url (nullable — link to the project's official page)
isProOnly: checkbox (default: true)
tasks: array (blocks/repeater field):
  - taskId: text (auto-generated UUID)
  - title: text (required — e.g., "Bridge ETH to zkSync Era")
  - description: richText (step-by-step instructions)
  - link: url (nullable — e.g., bridge URL)
  - difficulty: select (easy | medium | hard)
  - order: number (for manual reordering)
relatedReport: relation to Posts collection (nullable)
```

**Fine prints:**

- `estimatedValue` is a **text field**, not a number. Airdrop values are speculative ranges, not fixed amounts. Display it as-is: "Est. value: $500–$5,000". Never present it as a guaranteed amount.
- `deadline` shows a countdown on the airdrop card: "23 days left" or "Ends March 15". If `null`, show "No deadline set".
- `tasks[].taskId` must be a stable UUID generated once on creation — not the array index. This is the key used in `userAirdropProgress.completedTaskIds[]`. If tasks are reordered, the `taskId` must not change.
- `status: 'ended'` → tasks are still visible (read-only) but the "Mark complete" checkboxes are disabled. Users can see what they completed historically.

### User Progress Tracking Fine Print

`userAirdropProgress` Drizzle table:

```ts
{
  id: uuid,
  userId: uuid (FK users.id),
  airdropId: varchar (the Payload Airdrop document ID),
  completedTaskIds: text[] (PostgreSQL array — list of taskIds),
  updatedAt: timestamp,
  UNIQUE(userId, airdropId)
}
```

**Fine prints:**

- PostgreSQL array type (`text[]`) is used for `completedTaskIds`. Drizzle supports this.
- Adding a task: `UPDATE ... SET completedTaskIds = array_append(completedTaskIds, $taskId)`.
- Removing a task: `UPDATE ... SET completedTaskIds = array_remove(completedTaskIds, $taskId)`.
- Progress percentage: `(completedTaskIds.length / totalTasks) * 100`.
- Progress is stored per airdrop, not globally. Each airdrop has its own completion record per user.

**Optimistic UI:** When a user checks/unchecks a task, update the UI immediately (optimistic update) and then persist to the server. If the server fails, revert the checkbox. This avoids latency feeling on each checkbox click.

### Access Control Fine Print

From `PROJECT_REQUIREMENTS.md §3`:

> "Pro Member: Full access to... airdrop guides."

- `isProOnly: true` airdrops: Pro users see full detail + task checkboxes. Free users see the airdrop card with a blur overlay and "Upgrade to unlock" CTA.
- `isProOnly: false` airdrops (if any): visible to all logged-in users (Free + Pro). Free users can see tasks but cannot mark them complete → upgrade CTA on the checkbox.
- Guests (unauthenticated): see the airdrop listing page with blurred task sections.

**The airdrop listing page itself is public** (for SEO) but task details and progress tracking require a login.

### Deadline Countdown Fine Print

- A live countdown timer on each airdrop card showing time until the deadline.
- Format: `X days` (if > 24h remaining), `Xh Xm` (if < 24h remaining).
- Colour: green if > 14 days, yellow if 7–14 days, red if < 7 days, grey if ended.
- The timer is a client component (needs live updates). Use `useEffect` with `setInterval`.
- Server-rendered HTML shows the deadline date as fallback (for SEO/no-JS).

### Airdrop Cards Grid Fine Print

Filter bar at the top:

- **All** | **Upcoming** | **Active** | **Ended**
- Default: "Active" filter selected (most actionable for users).
- Show count badge on each filter: "Active (3)".
- Sort: Active → Upcoming → Ended (within each group: by deadline ascending — most urgent first).

Airdrop card:

- Logo (rounded, 48x48)
- Name + chain badge
- Status badge: "Active" (green), "Upcoming" (blue), "Ended" (grey)
- Estimated value: "Est. $500–$5,000" in gold text
- Deadline countdown
- Progress bar: only shown for logged-in users. Shows `X/Y tasks completed`.
- For Pro users: "Start guide →" button
- For Free users: "Unlock with Pro →" button (on `isProOnly: true` airdrops)

### Airdrop Detail Page Fine Print

URL: `/tools/airdrops/[slug]`

Layout:

- Header: logo, name, chain badge, status badge, estimated value, deadline, official link.
- Tabs (if `relatedReport` exists): "Task Guide" | "Full Analysis".
- Description: rich text overview.
- Task list: numbered steps. Each step:
  - Step number + title (bold)
  - Difficulty badge (Easy/Medium/Hard)
  - Description (expandable rich text)
  - External link button (opens in new tab)
  - Checkbox: "Mark as complete" — only for Pro users, disabled for ended airdrops.
- Progress bar at the top of the task list: "3 of 7 steps completed — 43%"
- Share button: "Share this airdrop" → copies URL to clipboard.
- "Back to Airdrops" breadcrumb.

---

## Task Checklist

### Payload: Airdrops Collection

- [ ] Create `collections/Airdrops.ts` with all fields above
- [ ] Configure tasks as a repeater/blocks field
- [ ] Auto-generate `taskId` (UUID) on task creation via `beforeChange` hook
- [ ] Access control: create/update/delete → admin only; read → pro + analyst + admin (+ public for listing)
- [ ] Add to `payload.config.ts`
- [ ] Seed 8 sample airdrops: 2 active, 3 upcoming, 3 ended; mix of isProOnly
- [ ] Each seeded airdrop has 4–8 tasks with realistic titles (e.g., "Bridge 0.01 ETH to Base", "Swap on the DEX")

### Drizzle Migration

- [ ] Create `lib/db/schema/airdrops.ts` — `userAirdropProgress` table
- [ ] Run migration

### Airdrop Hub Page

- [ ] `app/(dashboard)/tools/airdrops/page.tsx` — SSR, fetches all airdrops from Payload Local API
- [ ] `components/tools/airdrops/AirdropFilter.tsx` — All/Upcoming/Active/Ended filter pills with counts
- [ ] `components/tools/airdrops/AirdropGrid.tsx` — responsive card grid
- [ ] `components/tools/airdrops/AirdropCard.tsx` — logo, name, chain, status, value, countdown, progress bar, CTA
- [ ] `components/tools/airdrops/DeadlineCountdown.tsx` — live countdown timer (client component, colour-coded)

### Airdrop Detail Page

- [ ] `app/(dashboard)/tools/airdrops/[slug]/page.tsx` — SSG + ISR for the page shell; user progress fetched client-side
- [ ] `generateStaticParams` for all published airdrops
- [ ] `generateMetadata` for SEO (title, description)
- [ ] `components/tools/airdrops/AirdropHeader.tsx` — logo, name, badges, value, deadline, official link
- [ ] `components/tools/airdrops/TaskList.tsx` — numbered tasks with checkboxes, difficulty badges, links
- [ ] `components/tools/airdrops/TaskItem.tsx` — individual task with optimistic checkbox toggle
- [ ] `components/tools/airdrops/ProgressBar.tsx` — "X of Y steps completed — XX%"

### Progress API

- [ ] `GET /api/airdrops/[id]/progress` — returns user's `completedTaskIds` for this airdrop
- [ ] `POST /api/airdrops/[id]/progress` — body: `{ taskId, completed: boolean }` — add/remove from `completedTaskIds`
- [ ] Auth required on both routes (redirect to login for guests)
- [ ] Pro check on POST: Free users cannot mark tasks complete on `isProOnly: true` airdrops

### Gating for Free Users

- [ ] Airdrop card for non-Pro: show blur overlay + "Unlock with Pro →" CTA on `isProOnly: true` cards
- [ ] Airdrop detail for non-Pro: show first task fully, remaining tasks blurred + upgrade wall (consistent with article gating in Sprint 4)

---

## Acceptance Criteria / Definition of Done

- [ ] Airdrop listing page loads with seeded airdrops, filtered to "Active" by default
- [ ] Filter pills show correct counts and filter correctly
- [ ] Active airdrops show countdown in correct colour (green/yellow/red)
- [ ] Progress bar shows on airdrop cards for logged-in users (0% if not started)
- [ ] Pro user can open airdrop detail and see all tasks
- [ ] Checking a task updates the checkbox immediately (optimistic) and persists to DB
- [ ] Unchecking a task removes it from `completedTaskIds`
- [ ] Progress bar on detail page reflects correct completion %
- [ ] Ended airdrops show tasks as read-only (checkboxes disabled)
- [ ] Free user sees blur overlay + upgrade CTA on `isProOnly: true` airdrop tasks
- [ ] Guest sees listing page (public SEO) but task details require login
- [ ] `generateMetadata` produces correct title/description for airdrop detail pages
- [ ] "Read full analysis →" link on detail page correctly links to the related Airdrop Report article

---

## Dependencies

- Sprint 3 complete (Payload CMS running — new collection added here)
- Sprint 2 complete (Pro gate middleware)
- Sprint 4 complete (article page — linked from airdrop "Read full analysis" link)

---

## Hands-off to Sprint 10

Sprint 10 builds the notification engine. No direct dependency on Sprint 9, but the notification system will eventually send alerts for new airdrops added to the Hub. The Payload `afterChange` hook stub from Sprint 3 pattern applies here too — add an `onAirdropPublished` event stub in the Airdrops collection.
