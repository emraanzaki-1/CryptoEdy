# Sprint 11 — Community Features

**Phase:** 5 — Notifications & Community
**Weeks:** 21–22
**Goal:** Users can post forum threads, reply, react, and exchange direct messages. All community actions trigger the notification engine from Sprint 10.

---

## Spec References

| Document                             | Relevant Sections                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4D User Management & Social — referral system, community features                     |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4B Community tab in notification dropdown                                             |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4H Notification Settings — Community toggles (messages, mentions, replies)            |
| `docs/specs/USER_JOURNEY.md`         | §4 Community & Notifications — switching to Community tab, reading analyst discussions |

---

## Context & Fine Print

### Community Access Fine Print

From `PROJECT_REQUIREMENTS.md §3`:

> "Registered (Free): Access to free newsletters, public watchlists, and basic community features."
> "Pro Member: Full access to... premium livestreams."

Community access tiers:

- **Guest (unauthenticated):** Can view the community page and read threads — read-only, no posting.
- **Free (registered):** Can create threads, post replies, react, send DMs.
- **Pro:** Same as Free + access to a Pro-only community section/channel (premium discussion).
- **Analyst/Admin:** Can pin threads, moderate (delete any post), create official discussion threads tied to research reports.

### Forum Data Model Fine Print

`threads` Drizzle table:

```ts
{
  id: uuid,
  authorId: uuid (FK users.id),
  title: varchar(255, required),
  body: text (required — plain text or markdown, NOT rich text — keeps it simple),
  category: enum('general', 'research', 'analysis', 'tools', 'pro-lounge'),
  isPinned: boolean (default: false),
  isLocked: boolean (default: false — locked threads can be read but not replied to),
  viewCount: integer (default: 0),
  replyCount: integer (default: 0 — denormalized counter, updated by trigger),
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp (nullable — soft delete)
}
```

`replies` Drizzle table:

```ts
{
  id: uuid,
  threadId: uuid (FK threads.id),
  authorId: uuid (FK users.id),
  body: text (required),
  parentReplyId: uuid (nullable — FK replies.id — for nested/quoted replies, max 1 level deep),
  reactionCounts: jsonb (default: {} — e.g., { "👍": 5, "🔥": 2 }),
  isEdited: boolean (default: false),
  createdAt: timestamp,
  deletedAt: timestamp (nullable — soft delete)
}
```

`userReactions` Drizzle table:

```ts
{
  id: uuid,
  userId: uuid (FK users.id),
  targetType: enum('thread', 'reply'),
  targetId: uuid,
  emoji: varchar(10),
  createdAt: timestamp,
  UNIQUE(userId, targetType, targetId, emoji)
}
```

**Fine prints:**

- **Soft deletes:** Never hard-delete threads or replies. Set `deletedAt`. Display as "[deleted]" with no content visible. This preserves thread structure and prevents notification links from breaking.
- **`replyCount`** is a denormalized counter on `threads`. Update it on insert/soft-delete of a reply (using a Drizzle transaction). This avoids a `COUNT(*)` query on every thread list render.
- **`reactionCounts`** on `replies` is a JSONB column updated atomically when a user adds/removes a reaction. Denormalized for performance — `userReactions` table is the source of truth for "did I react?"; `reactionCounts` is for display totals.
- **`pro-lounge` category:** Visible and accessible only to Pro + analyst + admin users. Free users see the category listed but threads inside are blurred. The Pro gate applies at the thread listing level for this category.
- **Body format:** Plain text with basic markdown support (bold, italic, code blocks, links). Use `react-markdown` with a whitelist of allowed tags. No raw HTML — XSS risk.

### Thread Detail & Reply Nesting Fine Print

- Max nesting depth: **1 level**. Replies can quote/reply to other replies, but the UI shows them as a flat list with a "Replying to @username" indicator. True tree nesting (Reddit-style) is too complex for V1.
- **Mention parsing:** Scan reply body for `@username` patterns on save. Validate that the mentioned username exists. Store mention events, trigger notification.
- **Pagination:** Thread list — 20 per page, chronological (pinned first). Replies — all loaded at once for threads with < 100 replies. For larger threads, paginate with "Load more replies".
- **Thread list:** Sorted by `updatedAt DESC` (most recently replied-to first). Pinned threads always at top regardless of sort.
- **View count:** Increment on thread detail page load. Use a background API call to avoid blocking render. Debounce: only count one view per user per thread per 24 hours.

### Direct Messaging Fine Print

From `PROJECT_REQUIREMENTS.md §4H`:

> "New messages: Direct messages from other members."

`conversations` Drizzle table:

```ts
{
  id: uuid,
  createdAt: timestamp,
  lastMessageAt: timestamp (updated on new message — for sorting inbox)
}
```

`conversationParticipants` table (separate from `conversations` to support future group DMs):

```ts
{
  conversationId: uuid (FK conversations.id),
  userId: uuid (FK users.id),
  joinedAt: timestamp,
  lastReadAt: timestamp (nullable — for unread count calculation),
  PRIMARY KEY (conversationId, userId)
}
```

`messages` Drizzle table:

```ts
{
  id: uuid,
  conversationId: uuid (FK conversations.id),
  senderId: uuid (FK users.id),
  body: text (required, max 2000 chars),
  createdAt: timestamp,
  deletedAt: timestamp (nullable)
}
```

**Unread DM count:** `SELECT COUNT(*) FROM messages WHERE conversationId IN (user's conversations) AND createdAt > lastReadAt`. Shown as a badge on the sidebar Community icon.

**Starting a new conversation:**

- From a user's profile page: "Send message" button.
- From community page: "Message" button on a post/reply author.
- If a conversation already exists between the two users → navigate to that conversation (no duplicates).
- `POST /api/conversations` — create or find existing conversation between two users.

**Message delivery:** In this sprint, messages are **not** real-time (no WebSockets). They are fetched via polling every 15 seconds when the messages page is open. A notification is triggered immediately via the existing `createNotification` service.

**Rate limiting:** Max 20 messages per user per minute (anti-spam). Return 429 with "You're sending messages too quickly."

### Mention System Fine Print

The `@mention` system works across forum replies and potentially DMs:

1. In the reply editor: typing `@` opens an autocomplete dropdown showing matching usernames.
2. On submit: server-side regex `/\@(\w+)/g` scans the body, validates each username against the DB.
3. For each valid mention: call `onUserMentioned(mentionedUserId, threadId, replyId, mentionerName)`.
4. `onUserMentioned` → `createNotification({ type: 'community', subtype: 'mention', ... })`.
5. Invalid mentions (username doesn't exist) are left as plain text — no error shown.
6. A user cannot spam-mention the same user more than 3 times in a single reply (server validation).

### Moderation Fine Print

- Admin and analyst can delete any thread or reply (soft delete).
- Admin can lock threads (prevents new replies, shows "This thread has been locked").
- Admin can pin threads (appears at top of listing).
- No automated content moderation in V1 — manual only.
- Reported content: add a "Report" button on each thread/reply → creates a record in an `adminReports` table for manual review. Out of scope for the admin dashboard in Sprint 12 (future work).

---

## Task Checklist

### Database

- [ ] Drizzle migration: `threads`, `replies`, `userReactions`, `conversations`, `conversationParticipants`, `messages` tables
- [ ] Add indexes: `threads(authorId)`, `threads(category)`, `threads(isPinned, updatedAt)`, `replies(threadId)`, `messages(conversationId, createdAt)`, `conversationParticipants(userId)`

### Forum

- [ ] `app/(dashboard)/community/page.tsx` — thread list (SSR for SEO)
- [ ] `components/community/forum/ThreadList.tsx` — pinned first, then by `updatedAt DESC`
- [ ] `components/community/forum/ThreadCard.tsx` — title, author avatar/name, category badge, reply count, time, view count
- [ ] `components/community/forum/CategoryFilter.tsx` — General | Research | Analysis | Tools | Pro Lounge
- [ ] `components/community/forum/CreateThreadModal.tsx` — title + body textarea (markdown), category select
- [ ] `app/(dashboard)/community/[threadId]/page.tsx` — thread detail
- [ ] `components/community/forum/ThreadDetail.tsx` — title, body, author, metadata
- [ ] `components/community/forum/ReplyList.tsx` — all replies, paginated
- [ ] `components/community/forum/ReplyItem.tsx` — body, author, timestamp, reactions, reply-to indicator, edit/delete (own posts)
- [ ] `components/community/forum/ReplyEditor.tsx` — textarea with `@mention` autocomplete
- [ ] `components/community/forum/ReactionBar.tsx` — emoji reaction buttons with counts
- [ ] `components/community/forum/MentionAutocomplete.tsx` — dropdown on `@` trigger, searches usernames
- [ ] `GET /api/community/threads` — paginated thread list, filter by category
- [ ] `POST /api/community/threads` — create thread (free+ required)
- [ ] `GET /api/community/threads/:id` — thread detail + replies
- [ ] `POST /api/community/threads/:id/replies` — post reply (free+ required), triggers mention detection
- [ ] `PATCH /api/community/threads/:id` — admin: lock/pin/unpin
- [ ] `DELETE /api/community/threads/:id` — soft delete (own thread) or admin
- [ ] `DELETE /api/community/replies/:id` — soft delete (own reply) or admin
- [ ] `POST /api/community/reactions` — add/toggle reaction
- [ ] `GET /api/users/search?q=` — username autocomplete for `@mention` and DMs (return: `[{ username, displayName, avatar }]`)

### Notification Triggers (Forum)

- [ ] `onThreadReplied(threadAuthorId, replierName, threadId)` → `community/reply` notification
- [ ] `onUserMentioned(userId, mentionerName, threadId, replyId)` → `community/mention` notification
- [ ] Mention detection in reply submit handler — call `onUserMentioned` for each valid mention

### Direct Messaging

- [ ] `app/(dashboard)/community/messages/page.tsx` — two-panel layout
- [ ] `components/community/messages/ConversationList.tsx` — sorted by `lastMessageAt DESC`, unread badge per conversation
- [ ] `components/community/messages/MessageThread.tsx` — messages in chronological order, infinite scroll upward
- [ ] `components/community/messages/MessageInput.tsx` — text input, send on Enter (Shift+Enter for newline), max 2000 chars
- [ ] `components/community/messages/StartConversationButton.tsx` — "Message" button shown on user profiles
- [ ] `POST /api/conversations` — create or return existing conversation
- [ ] `GET /api/conversations` — list user's conversations
- [ ] `GET /api/conversations/:id/messages` — paginated messages (newest at bottom)
- [ ] `POST /api/conversations/:id/messages` — send message, trigger DM notification
- [ ] `PATCH /api/conversations/:id/read` — update `lastReadAt` for current user
- [ ] Unread DM count badge on sidebar Community icon (poll every 30s)
- [ ] Rate limiting on `POST /api/conversations/:id/messages`: 20/min per user

### Notification Triggers (Messaging)

- [ ] `onDirectMessage(recipientId, senderName, conversationId)` → `community/message` notification

### Pro Lounge Gate

- [ ] Thread category filter shows "Pro Lounge 🔒" for non-Pro users
- [ ] Thread listing for `category: 'pro-lounge'` returns 403 for non-Pro API requests
- [ ] Thread cards in Pro Lounge are blurred with upgrade CTA for Free users

---

## Acceptance Criteria / Definition of Done

- [ ] Free user can create a thread and see it in the listing
- [ ] Any logged-in user can reply to a thread
- [ ] `@mention` autocomplete appears when typing `@` in the reply editor
- [ ] Mentioning a valid user sends them a `community/mention` notification
- [ ] Replying to a thread sends the thread author a `community/reply` notification
- [ ] Reactions can be toggled on/off; counts update correctly
- [ ] Deleted threads/replies show "[deleted]" placeholder
- [ ] Admin can lock and pin threads
- [ ] Pro Lounge threads are hidden/blurred for Free users
- [ ] User can start a new conversation from a user profile
- [ ] Starting a conversation with an existing conversation partner opens the existing thread
- [ ] Messages persist and appear after page reload
- [ ] Unread DM count badge appears on sidebar Community icon
- [ ] Sending a DM triggers a notification for the recipient
- [ ] Messages page polls for new messages every 15 seconds
- [ ] Rate limiting rejects more than 20 messages/min with a 429 response

---

## Dependencies

- Sprint 10 complete (notification engine — `createNotification` used heavily here)
- Sprint 2 complete (auth — all community actions require login)

---

## Hands-off to Sprint 12

Sprint 12 builds Settings pages and the Admin Dashboard. The community data (threads, messages) created here appears in the admin's moderation view. The Settings/Profile page (Sprint 12) includes the user's display name and avatar — which are shown in thread and message components.
