# Sprint 10 — Notification Engine

**Phase:** 5 — Notifications & Community
**Weeks:** 19–20
**Goal:** The full notification system is live. Users receive real-time alerts categorised by type, can manage preferences granularly, and all previous platform events (content publish, subscription changes, referral payouts) now trigger real notifications.

---

## Spec References

| Document                             | Relevant Sections                                                     |
| ------------------------------------ | --------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4B Top Navigation Header — full notification bell spec               |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4H Notification Settings Page — categories, toggles, master switches |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4B Communication & Alerts — notification engine, in-app preferences  |
| `docs/specs/UI_SPECIFICATION.md`     | §2A Home Feed — notification bell dropdown detail                     |
| `docs/specs/UI_SPECIFICATION.md`     | §2E Notification Settings — categorised toggle list                   |
| `docs/specs/USER_JOURNEY.md`         | §4 Community & Notifications — alert filtering, preference management |

---

## Context & Fine Print

### Notification Architecture Fine Print

From `PROJECT_REQUIREMENTS.md §4B`:

> "Notification Engine: Real-time and persistent alerts categorized by content type."

Two layers:

1. **Persistent notifications** — stored in the `notifications` DB table. Visible in the bell dropdown on any device, any session. This is the primary layer.
2. **Real-time updates** — the unread badge updates without a full page reload. Implemented via Server-Sent Events (SSE) or polling.

**Why SSE over WebSockets?** SSE is simpler, works with Next.js serverless functions, supports one-way push (server → client), and is sufficient for notification badges. WebSockets are bidirectional — overkill for notifications. Polling every 30s is an acceptable fallback if SSE proves too complex in the serverless environment.

### Notification Data Model Fine Print

`notifications` Drizzle table:

```ts
{
  id: uuid,
  userId: uuid (FK users.id, indexed),
  type: enum('content', 'community', 'feed', 'account'),
  subtype: enum(
    // content
    'research', 'analysis',
    // community
    'message', 'mention', 'reply',
    // feed
    'market_direction', 'picks',
    // account
    'advertising', 'subscription', 'referral'
  ),
  title: varchar(255),
  body: text,
  link: varchar(500) (nullable — URL to navigate to on click),
  isRead: boolean (default: false, indexed with userId),
  actorId: uuid (nullable — userId of the person who triggered it, e.g., who mentioned you),
  actorAvatar: varchar (nullable — cached avatar URL for display),
  createdAt: timestamp (default: now(), indexed)
}
```

Indexes needed:

- `(userId, isRead)` — for unread count queries
- `(userId, createdAt DESC)` — for listing notifications
- `(userId, type, isRead)` — for tab-filtered unread counts

`notificationPreferences` Drizzle table:

```ts
{
  id: uuid,
  userId: uuid (FK users.id),
  type: enum (same as above),
  subtype: enum (same as above),
  inApp: boolean (default: true),
  email: boolean (default: true),
  UNIQUE(userId, type, subtype)
}
```

On user registration: seed all 9 subtypes as `{ inApp: true, email: true }` for the new user.

### Bell Dropdown Fine Print

From `PROJECT_REQUIREMENTS.md §4B`:

**Structure (fully spec'd):**

```
┌──────────────────────────────────────┐
│ Notifications              [⚙️ cog]  │
├──────────────────────────────────────┤
│ [All] [Content] [Community]          │
│ Mark all as read                     │
├──────────────────────────────────────┤
│ [CryptoEdy logo]                    │
│ CryptoEdy          3d               │
│ New research report available        │
│                               [✓]   │
├──────────────────────────────────────┤
│ [User avatar]                        │
│ @username mentioned you     17d      │
│ "Great analysis on ETH..."           │
│                               [✓]   │
└──────────────────────────────────────┘
```

Fine prints:

- **Cog wheel** (top right) → navigates to `/settings/notifications`.
- **Tabs:** "All", "Content", "Community". From spec — notably missing "Feed" and "Account" tabs in the dropdown. The dropdown only shows the 3 most relevant tabs. Full preference management is in Settings.
- **Active tab indicator:** Blue underline on the selected tab.
- **"Mark all as read":** Sets `isRead = true` for all unread notifications for the current user, filtered by the active tab (if on "Content" tab, only marks Content notifications as read).
- **Individual checkmark button:** Sets `isRead = true` for that specific notification.
- **Notification avatar:** Platform logo (`/logo-icon.svg`) for platform-triggered notifications (content, subscription). User avatar for community-triggered notifications (mentions, replies).
- **Timestamp format:** < 60 min → "45m"; < 24h → "6h"; < 7 days → "3d"; older → "Mar 15".
- **Click on notification item:** Navigate to `notification.link`. Mark as read.
- **Unread count badge:** Red badge on bell icon showing total unread count across all types. Max display: "99+" if over 99.
- **Dropdown closes on:** Click outside, Escape key, clicking a notification link.
- **Empty state:** Per-tab "You're all caught up 🎉" message.

### Notification Creation Service Fine Print

`lib/notifications/create.ts`:

```ts
async function createNotification(input: {
  userId: string
  type: NotificationType
  subtype: NotificationSubtype
  title: string
  body: string
  link?: string
  actorId?: string
}): Promise<void>
```

Before inserting: check `notificationPreferences` — if `inApp: false` for this `subtype`, skip insertion. If `email: true`, queue an email (see email fine print below).

Batch version for broadcasting to many users:

```ts
async function broadcastNotification(input: {
  userIds: string[]
  type: NotificationType
  subtype: NotificationSubtype
  title: string
  body: string
  link?: string
}): Promise<void>
```

Use a single `INSERT INTO notifications SELECT` with unnested user IDs — one DB call, not N individual inserts.

For content publish (potentially thousands of users): use batches of 500 users per insert to avoid DB overload.

### Wiring Previous Event Stubs Fine Print

From Sprint 3, 5, 6, and 9, notification event stubs were created (`console.log` only). In this sprint, wire them all up:

| Event                 | Trigger                      | Notification                                                                            |
| --------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| Post published        | Sprint 3 `afterChange` hook  | Pro users → `content/research` or `content/analysis`; Free users → same but teaser body |
| Payment confirmed     | Sprint 6 `verifyAndActivate` | `account/subscription` — "Welcome to Pro! Your membership is active."                   |
| Subscription expiring | Sprint 6 cron                | `account/subscription` — "Your membership expires in X days. Renew now."                |
| Subscription expired  | Sprint 6 cron                | `account/subscription` — "Your membership has expired."                                 |
| Referral converted    | Sprint 6 referral reward     | `account/referral` — "$10 USDC referral reward is pending. "                            |
| Airdrop published     | Sprint 9 `afterChange` hook  | Pro users → `feed/picks` — "New airdrop guide: {name}"                                  |

### Notification Settings Page Fine Print

From `PROJECT_REQUIREMENTS.md §4H` (very specific spec):

Full category and toggle structure:

```
Content
  └── All notifications (master toggle)
  └── Research — "Uncover hand-picked investment ideas."
  └── Analysis — "Watch us chart top assets & identify potential trading opportunities."

Community
  └── All notifications (master toggle)
  └── New messages — Direct messages from other members.
  └── New mentions — When you're mentioned in a forum/chat.
  └── New replies — Responses to your comments/posts.

Feed
  └── All notifications (master toggle)
  └── Market Direction — Alerts for macro and trend updates.
  └── Assets & Picks — Alerts for new high-conviction token selections.

Account
  └── All notifications (master toggle)
  └── Advertising — Promotional and platform updates.
```

**Master toggle logic:** Toggling "All notifications" for a category sets all subtypes within that category to the same state. Toggling an individual subtype doesn't change the master toggle — but the master toggle should show an "indeterminate" state (dash icon, not checkmark) if subtypes are mixed.

**Design:** From `PROJECT_REQUIREMENTS.md §4H`:

> "Clean white list items with blue toggle switches for an active state."
> Use Shadcn `Switch` component. Active: `#0052FF`. Each toggle has:

- Left: subtype label + description
- Right: toggle switch
- Separator between categories

### Real-time Badge Update Fine Print

Two approaches (choose based on complexity):

**Option A — SSE (preferred):**

- `GET /api/notifications/stream` — SSE endpoint.
- Server pushes `{ unreadCount }` whenever a new notification is created for the user.
- Client updates the bell badge in real time.
- Keep-alive via SSE comment (`:\n\n`) every 30s to prevent proxy timeouts.
- On reconnect: fetch current unread count via HTTP and re-establish SSE.

**Option B — Polling (fallback):**

- `GET /api/notifications/unread-count` — returns `{ count }`.
- Poll every 30 seconds using `setInterval` in the `Header` component.
- Less elegant but simpler and serverless-compatible.

Start with Option B. Switch to Option A if real-time feel becomes a priority.

### Email Notifications Fine Print

Not all notifications need email. The preference table controls this. For this sprint, implement email for:

- `account/subscription` events (payment, expiry, referral) — high priority, users must know.
- `content/research` and `content/analysis` — optional, respects preference.

Use Resend (already set up in Sprint 2). Create email templates matching notification subtypes.
**Rate limiting on email:** Never send more than 1 email per user per hour for the same subtype. Check the last sent timestamp in the `notifications` table before sending.

---

## Task Checklist

### Database

- [ ] Drizzle migration: `notifications` table with all indexes
- [ ] Drizzle migration: `notificationPreferences` table
- [ ] Update user registration flow (Sprint 2) to seed default preferences for new users

### Notification Service

- [ ] `lib/notifications/create.ts` — `createNotification` + `broadcastNotification`
- [ ] `lib/notifications/preferences.ts` — `getUserPreferences`, `updatePreference`
- [ ] Preference check in `createNotification` — skip if `inApp: false`
- [ ] Email queue in `createNotification` — call `sendNotificationEmail` if `email: true`
- [ ] `lib/email/templates/notification.tsx` — generic notification email template (title + body + CTA link)

### Wire Existing Event Stubs

- [ ] Update `lib/notifications/events.ts`:
  - `onPostPublished(post)` → `broadcastNotification` to all users (Pro: full, Free: teaser)
  - `onSubscriptionActivated(userId)` → `createNotification` welcome notification
  - `onSubscriptionExpiring(userId, days)` → `createNotification` expiry warning
  - `onSubscriptionExpired(userId)` → `createNotification` expired notification
  - `onReferralConverted(referrerId, referredUser)` → `createNotification` reward pending
  - `onAirdropPublished(airdrop)` → `broadcastNotification` to Pro users

### Bell Dropdown (Sprint 4 placeholder → real data)

- [ ] `components/common/NotificationBell.tsx` — full implementation
- [ ] `GET /api/notifications` — returns paginated notifications for the current user, supports `?type=` filter
- [ ] `GET /api/notifications/unread-count` — returns `{ count }` per type
- [ ] `PATCH /api/notifications/read-all` — marks all (or all of type) as read
- [ ] `PATCH /api/notifications/:id/read` — marks single notification as read
- [ ] Polling implementation in `NotificationBell` (30s interval, `useEffect`)
- [ ] Optimistic read: mark as read in UI immediately, then send PATCH

### Notification Settings Page

- [ ] `app/(dashboard)/settings/notifications/page.tsx`
- [ ] `components/settings/notifications/NotificationCategoryGroup.tsx` — category with master toggle + subtypes
- [ ] `components/settings/notifications/NotificationToggleRow.tsx` — label + description + Switch
- [ ] `PATCH /api/user/notification-preferences` — updates single preference `{ type, subtype, inApp, email }`
- [ ] Master toggle logic: updates all subtypes in category on change
- [ ] Indeterminate state for partial category toggle (Shadcn Switch doesn't support this natively — use a custom indicator)
- [ ] Save feedback: show toast "Preferences saved" on each toggle change (auto-saved, no save button)

---

## Acceptance Criteria / Definition of Done

- [ ] Publishing a post in Payload admin triggers notifications for all users
- [ ] Pro users receive full "New Research" notification; Free users receive teaser version
- [ ] Completing a Pro payment triggers "Welcome to Pro" notification
- [ ] Subscription expiry cron creates expiry warning notifications at 30/14/7/1 day thresholds
- [ ] Bell badge shows correct unread count
- [ ] Bell badge updates within 30 seconds of a new notification
- [ ] Bell dropdown shows notifications in All/Content/Community tabs
- [ ] "Mark all as read" clears the badge and updates all items in the active tab
- [ ] Individual checkmark marks a single notification as read
- [ ] Clicking a notification navigates to its link and marks it as read
- [ ] Cog wheel in dropdown navigates to `/settings/notifications`
- [ ] Notification settings page shows all 4 categories with toggles
- [ ] Master toggle disables/enables all subtypes in its category
- [ ] Toggling a preference auto-saves and shows a toast
- [ ] A user with `inApp: false` for `research` does NOT receive research notifications

---

## Dependencies

- Sprint 2 complete (user registration — preference seeding)
- Sprint 3 complete (Payload post publish hook stub)
- Sprint 6 complete (subscription events stubs)
- Sprint 9 complete (airdrop publish hook stub)
- Sprint 4 complete (notification bell placeholder in Header — now wired)

---

## Hands-off to Sprint 11

Sprint 11 builds Community (forum + DMs). Community events (mentions, replies, new messages) will trigger notifications using the `createNotification` service built in this sprint. Sprint 11 must import from `lib/notifications/events.ts` — do not duplicate notification creation logic.
