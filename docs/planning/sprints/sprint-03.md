# Sprint 3 — CMS Collections & Content Model

**Phase:** 2 — Content System & Core UI
**Weeks:** 5–6
**Goal:** Analysts and editors can create, manage, and publish all content types through the Payload admin panel. Seed data is available so frontend development can begin in Sprint 4 without waiting on real content.

---

## Spec References

| Document                             | Relevant Sections                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4D Feed Item Cards — `isProOnly`, category labels, read time, badges        |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4J Article & Gated Content Page — content fields, breadcrumbs, risk ratings |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4E Footer Navigation — Research/Analysis/Education taxonomy                 |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4F Admin Dashboard — full CRUD, scheduling, content management              |
| `docs/specs/USER_JOURNEY.md`         | §6 Analyst Workflow — draft → review → publish pipeline                      |

---

## Context & Fine Print

### Content Taxonomy Fine Print

From `PROJECT_REQUIREMENTS.md §4E` (footer navigation), the full content taxonomy:

**Research:**

- Top Picks
- Deep Dives
- Passive Income
- Airdrop Reports
- Memecoins

**Analysis:**

- Market Updates
- Market Direction
- Market Pulse
- Livestreams

**Education (Crypto School):**

- Courses
- Resource Hub
- Glossary

This taxonomy drives: URL structure (`/research/top-picks/[slug]`), footer links, feed filter pills, article breadcrumbs, and notification subtypes. It must be consistent across the entire app. Define it as constants in `/lib/constants/taxonomy.ts` as well as in Payload CMS — both must stay in sync.

### Posts Collection Fine Print

The `Posts` collection is the primary content type. From `PROJECT_REQUIREMENTS.md §4D` and `§4J`:

**Required fields:**

```
title: text (required)
slug: text (auto-generated from title, unique, editable)
excerpt: textarea (required — shown on feed cards, max 200 chars)
content: richText (Lexical editor — required)
featuredImage: upload (relation to Media collection — required for published posts)
category: select (from taxonomy above — required)
subcategory: select (filtered by category — optional)
tags: hasMany relation to Tags collection
author: relation to Users (Payload users — required)
readTime: number (auto-calculated: ceil(wordCount / 200) minutes, stored for performance)
publishedAt: date (set automatically on publish, editable for scheduling)
isProOnly: checkbox (default: true — most content is Pro-gated)
status: select (draft | review | published — default: draft)
riskRating: select (low | medium | high | speculative — only relevant for picks/research, optional)
```

**Fine prints on specific fields:**

- `slug`: Generated from `title` on create. If title changes, slug does NOT auto-update (changing slugs breaks URLs). Editors must manually update slugs with care.
- `readTime`: Auto-calculated Payload `beforeChange` hook. Count words in Lexical content JSON, divide by 200 (average WPM), ceil. Store as integer. Never manually editable.
- `isProOnly: true` by default — analysts must explicitly uncheck to publish a free article. This prevents accidental leaking of Pro content.
- `publishedAt`: If set to a future date, the post is "scheduled" — it exists in the DB but the frontend query filters `publishedAt <= now()`. This enables scheduling without a background job.
- `status: 'published'` AND `publishedAt <= now()` = visible to end users. Both conditions must be true.
- `riskRating` is shown as a badge on pick cards. Only applies to `category: 'top-picks'` or `category: 'deep-dives'`. Leave blank for analysis/education content.

### Editorial Workflow Fine Print

From `USER_JOURNEY.md §6`:

> "Analyst saves as Draft. Editor reviews formatting and charts. Editor clicks Publish."

Payload access control matrix:

```
Posts collection:
  create:  analyst, admin
  read:
    - published posts: everyone (public API)
    - draft/review posts: analyst, admin only
  update:
    - own posts: analyst
    - any post: admin
  delete:  admin only

  Status transitions:
    draft → review: analyst (signals ready for editorial review)
    review → published: admin or senior analyst (approval gate)
    published → draft: admin only (unpublish/retract)
```

This means a regular analyst **cannot self-publish**. They submit to review, and an admin or senior analyst publishes. This prevents unreviewed content going live.

### Payload afterChange Hook for Notifications

From `PROJECT_REQUIREMENTS.md §4B`:

> "Notification Engine: Real-time and persistent alerts categorized by content type."

When a post transitions to `published`, fire a notification event. This hook is defined in Sprint 3 but the full notification engine is built in Sprint 10. For now, just log the event or push to a simple queue.

The hook must capture:

- `postId`, `title`, `category`, `isProOnly`, `authorId`, `publishedAt`
- Target audience: if `isProOnly: true` → notify Pro users fully + send teaser to Free users. If `isProOnly: false` → notify all users.

### Media Collection Fine Print

- Image uploads stored via Payload's storage adapter.
- For production: use Payload's `@payloadcms/storage-s3` or `@payloadcms/storage-vercel-blob`. For development: local filesystem.
- Enforce max file size: 5MB (avatars) / 10MB (feature images).
- Auto-generate multiple sizes on upload: `thumbnail` (300x200), `card` (800x533), `hero` (1600x900). Use these specific sizes in `next/image` `sizes` attribute for performance.
- Alt text field is required on upload — accessibility requirement.

### Categories Collection Fine Print

- This is a reference collection — not user-facing directly, used to power category pages and the filter pills.
- `type` field: `research | analysis | education` — maps to the three top-level nav categories.
- Slug must match the URL path exactly: e.g., category `Top Picks` → slug `top-picks` → URL `/research/top-picks`.
- Seed all categories before seeding posts.

### Tags Collection Fine Print

- Freeform tags added by analysts (e.g., "Ethereum", "DeFi", "Layer 2", "Airdrop").
- Auto-complete in Payload admin — analysts can select existing or create new.
- Tags are used for the search index (Sprint 13) and related content matching.
- No UI-visible tag pages initially — tags are metadata only.

### Seed Data Fine Print

The seed script (`/scripts/seed.ts`) must produce a **realistic, usable dataset** — not lorem ipsum. Content should represent actual platform content to properly test gating, layouts, and feed filtering.

Required seed data:

```
Categories: all 10 from the taxonomy above
Tags: Ethereum, Bitcoin, Solana, DeFi, Layer 2, Airdrop, Staking, Memecoins, Macro, On-chain

Users:
  admin@cryptonary.com     | role: admin     | emailVerified: true
  analyst@cryptonary.com   | role: analyst   | emailVerified: true
  pro@cryptonary.com       | role: pro       | subscriptionExpiry: +1 year
  free@cryptonary.com      | role: free      | emailVerified: true

Posts (10 total):
  3 × Research (Top Picks, isProOnly: true) — with risk ratings
  2 × Research (Deep Dives, isProOnly: true)
  2 × Analysis (Market Updates, isProOnly: false) — free content
  1 × Analysis (Market Direction, isProOnly: true)
  1 × Education (Crypto School, isProOnly: false)
  1 × Research (Airdrop Reports, isProOnly: true)
```

All posts must have: realistic title, excerpt, featuredImage (use placeholder images), at least 500 words of body content, correct category, and a `publishedAt` in the past.

---

## Task Checklist

### Payload Collections

- [ ] Create `collections/Posts.ts` with all fields as specified above
- [ ] Add `beforeChange` hook on `Posts` to auto-calculate `readTime`
- [ ] Add `afterChange` hook on `Posts` — fires when `status` changes to `published`, logs notification event
- [ ] Create `collections/Categories.ts` — `name`, `slug`, `type`, `description`
- [ ] Create `collections/Tags.ts` — `name`, `slug`
- [ ] Create `collections/Media.ts` — upload config with size variants, file size limits, alt text requirement
- [ ] Create `collections/Authors.ts` — extends Payload users: `displayName`, `bio`, `avatar`, `socialLinks`
- [ ] Register all collections in `payload.config.ts`

### Access Control

- [ ] Implement Payload access control on `Posts` collection per the matrix above
- [ ] Test: analyst can create/update own posts but cannot delete
- [ ] Test: analyst cannot change status from `review` to `published`
- [ ] Test: admin can change status to `published`
- [ ] Test: unauthenticated request to Payload API for a draft post returns 401

### Admin UI Enhancements

- [ ] Configure Payload admin `defaultColumns` for Posts list: title, category, status, isProOnly, publishedAt, author
- [ ] Add `description` to each field in Payload config (helps analysts understand each field)
- [ ] Configure `listSearchableFields: ['title', 'excerpt']` on Posts
- [ ] Add `admin.useAsTitle: 'title'` on Posts collection

### Taxonomy Constants

- [ ] Create `/lib/constants/taxonomy.ts` — export all categories, subcategories, and their slugs as TypeScript constants
- [ ] Ensure constants match Payload category seeds exactly (same slugs, same names)

### Seed Script

- [ ] Create `/scripts/seed.ts`
- [ ] Seed categories (all 10 from taxonomy)
- [ ] Seed tags (10 common crypto tags)
- [ ] Seed 4 test users (admin, analyst, pro, free) with bcrypt-hashed passwords
- [ ] Seed 10 sample posts with realistic content, correct categories, mixed `isProOnly`
- [ ] Add `npm run seed` script to `package.json`
- [ ] Add `npm run seed:reset` that drops all content and re-seeds (dev only — guarded by `NODE_ENV !== 'production'`)
- [ ] Confirm seed runs without errors on a fresh database

### Notification Event (Stub)

- [ ] Create `/lib/notifications/events.ts` — `onPostPublished(post)` function
- [ ] For now: `console.log` the event with post details (full implementation Sprint 10)
- [ ] Wire `onPostPublished` into the `Posts afterChange` hook

---

## Acceptance Criteria / Definition of Done

- [ ] Analyst can log into `/admin`, create a post with all fields, save as draft
- [ ] Analyst can move post to `review` status
- [ ] Admin can move post from `review` to `published`
- [ ] `readTime` is auto-calculated and not manually editable
- [ ] `isProOnly` defaults to `true` — analyst must uncheck for free content
- [ ] Publishing a post fires the `onPostPublished` event (confirmed via console log)
- [ ] `npm run seed` populates all categories, tags, users, and posts without errors
- [ ] `npm run seed:reset` clears and re-seeds cleanly
- [ ] All 10 taxonomy categories exist in Payload admin
- [ ] Image upload enforces max file size and requires alt text
- [ ] Payload API for a draft post returns 401 for unauthenticated requests
- [ ] `/lib/constants/taxonomy.ts` is committed and matches the seed categories

---

## Dependencies

- Sprint 2 complete (Payload CMS running, PostgreSQL connected)

---

## Hands-off to Sprint 4

Sprint 4 builds the frontend feed and article page. All content fetched in Sprint 4 comes from the Payload Local API querying the collections defined here. The seed data from this sprint is what Sprint 4 develops against. Content model must be stable — adding fields in Sprint 4 requires a Payload config change and a migration.
