# Sprint 12 — Settings & Admin Dashboard

**Phase:** 6 — Settings, Admin & Polish
**Weeks:** 23–24
**Goal:** All user-facing settings pages are complete (Profile, Plans, Billing, Notifications, Appearance). Admins have a full dashboard for user management, subscription analytics, and financial reporting.

---

## Spec References

| Document                             | Relevant Sections                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4F Settings & Profile Page — full field list, privacy toggles, danger zone           |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4G Plans & Subscription Page — pricing card (already built in Sprint 5, linked here) |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4H Notification Settings — (already built in Sprint 10, linked here)                 |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4I Appearance Settings Page — theme previews, radio selectors                        |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4F Admin Dashboard — user management, subscription analytics, financial reporting    |
| `docs/specs/UI_SPECIFICATION.md`     | §2C Profile & Settings — two-column layout, sub-navigation                            |

---

## Context & Fine Print

### Settings Layout Fine Print

From `PROJECT_REQUIREMENTS.md §4F` and `UI_SPECIFICATION.md §2C`:

> "Two-column layout with a left-hand navigation sidebar and a main 'Profile' content area."

**Left settings navigation structure:**

```
My Account
  Profile        ← active on /settings/profile
  Plans          ← /settings/plans (Sprint 5)
  Billing        ← /settings/billing (Sprint 6)

Application
  Notifications  ← /settings/notifications (Sprint 10)
  Appearance     ← /settings/appearance
```

This navigation is shared across all settings pages. Implement as a `SettingsSidebar` component used in the settings section layout (`app/(dashboard)/settings/layout.tsx`).

On mobile: the settings sidebar becomes a horizontal scrollable tab row at the top of the page. The two-column layout stacks to single column.

### Profile Page Fine Print

From `PROJECT_REQUIREMENTS.md §4F`:

**Avatar upload:**

- Accepted formats: WEBP, SVG, PNG, JPG.
- Max size: 5MB.
- On upload: show a cropping UI (use `react-image-crop` library) before saving.
- After crop: upload the cropped image to storage (Payload Media or Vercel Blob), save the URL to the user's `avatarUrl` column in the `users` table.
- Display current avatar or a placeholder initials avatar (`{firstName[0]}{lastName[0]}`).
- The placeholder avatar should use a deterministic background colour based on the user's ID (so avatars are consistently coloured without an image).

**Personal Information fields:**
From `PROJECT_REQUIREMENTS.md §4F`:

- First Name, Last Name (both required)
- Email address — shows current email with a pencil (edit) icon. Clicking the edit icon opens an inline email change flow: enter new email → send verification to new email → old email still active until verified.
- Username — must be unique, 3–20 characters, alphanumeric + underscore only. Validate uniqueness on blur (debounced API call). Show a green tick or red error inline.
- Display Name — shown publicly (can differ from username). Max 50 characters.
- Phone number — with country code selector (use `react-phone-number-input`).
- Company Name (optional)
- Full Address (single textarea, optional)

**Bio:**

> "'Complete your bio' text area ('Tell us more about yourself')" — max 500 characters. Show live character count.

**Privacy section:**

- Profile Visibility: `Public` / `Private` dropdown. Private = only the user can see their full profile. Public = visible to all logged-in users.
- Crypto Portfolio Visibility: `Public` / `Private`. Controls visibility of the portfolio tracker to other users (Profile page > Portfolio tab).
- Hide Currency Amounts: Toggle. When on, shows `****` instead of actual USD amounts in the portfolio and anywhere else balances are displayed. This is a client-side preference — the actual data is not hidden in the DB.

**Actions:**

- "Save changes" button (light green — `#00FF41` from design system) — triggers `PATCH /api/user/profile`.
- "Cancel" button (blue ghost) — reverts unsaved changes to last saved state.
- Form uses `react-hook-form` + `zod` validation. Show inline field errors.

**Danger Zone:**

> "'Delete account' option (Red text) with a brief warning about permanent data deletion."

- Button: "Delete account" in red (`text-red-500`).
- Opens a confirmation modal: "This action is permanent and cannot be undone. All your data, subscriptions, and community posts will be deleted."
- Requires the user to type their email to confirm.
- On confirm: `POST /api/user/delete-account`.
- Server: soft delete the user (`deletedAt = now()`), sign them out, redirect to homepage.
- **Important:** Do NOT delete payment records (`payments` table). These are financial records and must be retained.
- Community content (threads, replies): soft-deleted or anonymised to "[deleted user]".

### Appearance Settings Fine Print

From `PROJECT_REQUIREMENTS.md §4I`:

> "Interface Theme section with side-by-side visual theme previews. Theme options: Light, Dark, System."

Three cards side by side:

- Each card: a small stylised UI preview screenshot (static image assets showing how the app looks in each theme).
- Below the card: radio button + theme label.
- Active selection: blue dot indicator (Shadcn `RadioGroup`).

Theme implementation:

- Uses `next-themes` (`ThemeProvider` already in root layout from Sprint 4).
- On selection: call `setTheme('light' | 'dark' | 'system')`.
- Persist: `next-themes` handles persistence via `localStorage` automatically.
- Also save to `users.themePreference` in the DB (for restoring preference on new devices).
- On login: read `themePreference` from DB and apply on the server render (prevents flash of wrong theme).

### Admin Dashboard Fine Print

From `PROJECT_REQUIREMENTS.md §4F`:

> "Admin Dashboard (Backend): Full CRUD, User Management, Subscription Analytics, Financial Reporting."

**Route:** `/admin-dashboard` (separate from Payload `/admin`). Admin-role only. Uses the same visual design as the user-facing app (same Header, Shadcn components) but with an "Admin" badge in the header.

**Tab 1 — User Management:**

- Data table (Shadcn `DataTable` with `@tanstack/react-table`).
- Columns: Avatar, Name, Email, Role, Subscription Status (Active/Expired/None), Joined Date, Actions.
- Search: debounced text search across name + email.
- Filter: by role, by subscription status.
- Row actions (dropdown per row):
  - "Edit role" → opens a modal with a role dropdown selector.
  - "Override subscription" → opens a modal: set role to Pro, set custom expiry date.
  - "View payment history" → opens a slide-over panel showing the user's `payments` table entries.
  - "View referral stats" → total referrals, conversions, earned.
- Pagination: 50 users per page.

**Tab 2 — Subscription Analytics:**
From `PROJECT_REQUIREMENTS.md §4F`:

> "Tracking of active memberships, churn rates, and on-chain revenue."

Metrics cards (top of page):

- Total Active Pro Members (count of `users WHERE role = 'pro' AND subscriptionExpiry > now()`)
- New Subscribers this month
- Churned this month (role changed from `pro` to `free` due to expiry)
- Monthly Revenue Equivalent (active Pro count × ($100 / 12) for MRR approximation)

Charts:

- Line chart: Pro member count over time (last 12 months). Data from `payments.confirmedAt`.
- Bar chart: New subscriptions by month (last 12 months).
- Pie chart: Chain breakdown (Ethereum vs Polygon vs Arbitrum vs Solana).
- Bar chart: Asset breakdown (USDC vs USDT).

All charts: Recharts `LineChart`, `BarChart`, `PieChart`. Consistent styling with the rest of the app.

**Tab 3 — Financial Reporting:**
From `PROJECT_REQUIREMENTS.md §4F`:

> "Monitoring of transaction hashes, wallet addresses, and payment confirmation status."

- Full payment ledger table.
- Columns: Date, User (name + email), Chain, Asset, Amount (USD), Status, Tx Hash.
- Tx Hash: truncated (`0x1234...5678`), clickable → opens block explorer in new tab.
- Status: "Confirmed" (green badge), "Pending" (yellow badge), "Failed" (red badge).
- Filter by: date range, chain, asset, status.
- **Export to CSV:** Button that calls `GET /api/admin/payments/export?format=csv` and downloads a CSV file. Include all columns.

**Tab 4 — Pending Referral Payouts:**

- Table of `referrals WHERE status = 'pending'`.
- Columns: Referrer, Referred User, Reward Amount, Asset, Date.
- Action per row: "Mark as Paid" → opens a modal to enter the `rewardTxHash`, updates the record.

**Tab 5 — Content Overview:**

- Quick stats: Total published posts, Published this week, Draft queue count, Total picks.
- Table: Recent posts (last 10 published) with title, category, author, date, isProOnly.
- Link: "Manage all content →" → `/admin` (Payload CMS panel).

---

## Task Checklist

### Settings Layout

- [ ] `app/(dashboard)/settings/layout.tsx` — two-column: `<SettingsSidebar>` + `<main>`
- [ ] `components/settings/SettingsSidebar.tsx` — nav items as defined above, active state highlighted
- [ ] Mobile: stacked layout, horizontal tab row at top

### Profile Page

- [ ] `app/(dashboard)/settings/profile/page.tsx`
- [ ] Install `react-image-crop`, `react-phone-number-input`, `react-hook-form`, `zod`
- [ ] `components/settings/profile/AvatarUpload.tsx` — file picker + crop UI + upload
- [ ] `components/settings/profile/ProfileForm.tsx` — all personal info fields + privacy toggles
- [ ] Username uniqueness check: `GET /api/user/check-username?username=` (debounced, returns `{ available: boolean }`)
- [ ] Email change flow: `POST /api/user/change-email` → sends verification to new email
- [ ] `PATCH /api/user/profile` — updates all profile fields
- [ ] `POST /api/user/delete-account` — soft delete (guarded by email confirmation)
- [ ] Delete account modal with email-to-confirm pattern

### Appearance Settings

- [ ] `app/(dashboard)/settings/appearance/page.tsx`
- [ ] `components/settings/appearance/ThemeSelector.tsx` — three preview cards with radio buttons
- [ ] Three static preview images (design assets for Light/Dark/System)
- [ ] Theme selection wires to `next-themes` `setTheme`
- [ ] Save theme preference to `users.themePreference` via `PATCH /api/user/profile`

### Admin Dashboard

- [ ] `app/(admin-dashboard)/layout.tsx` — admin-only guard, same Header with "Admin" badge
- [ ] `app/(admin-dashboard)/page.tsx` — dashboard with 5 tabs
- [ ] Install `@tanstack/react-table` for data tables
- [ ] `components/admin/users/UsersTable.tsx` — paginated table with search, filter, row actions
- [ ] `components/admin/users/EditRoleModal.tsx`
- [ ] `components/admin/users/OverrideSubscriptionModal.tsx`
- [ ] `components/admin/analytics/SubscriptionMetrics.tsx` — 4 metric cards
- [ ] `components/admin/analytics/SubscriptionCharts.tsx` — 4 Recharts charts
- [ ] `components/admin/financial/PaymentsTable.tsx` — full ledger with export
- [ ] `components/admin/financial/ReferralPayoutsTable.tsx` — pending payouts + mark paid action
- [ ] `components/admin/content/ContentOverview.tsx` — stats + recent posts table
- [ ] `GET /api/admin/users` — paginated user list with search/filter
- [ ] `PATCH /api/admin/users/:id/role` — update role
- [ ] `PATCH /api/admin/users/:id/subscription` — override subscription
- [ ] `GET /api/admin/payments` — full payment ledger
- [ ] `GET /api/admin/payments/export` — CSV export
- [ ] `PATCH /api/admin/referrals/:id/mark-paid` — (moved from Sprint 6 stub)
- [ ] `GET /api/admin/analytics/subscriptions` — metrics + chart data

---

## Acceptance Criteria / Definition of Done

- [ ] Settings sidebar navigation is active-state-aware and links to all settings pages
- [ ] Profile form saves correctly and shows success toast
- [ ] Avatar can be uploaded, cropped, and saved; displays in the header
- [ ] Username uniqueness check shows inline feedback on blur
- [ ] Email change sends a verification email to the new address
- [ ] Hide Currency Amounts toggle hides/shows amounts immediately
- [ ] Appearance page switches theme correctly via `next-themes`
- [ ] Theme preference persists across page reloads and new sessions
- [ ] Delete account modal requires email confirmation before proceeding
- [ ] Deleted user is soft-deleted; their session is invalidated
- [ ] Admin dashboard `/admin-dashboard` is inaccessible to non-admin users (returns 403)
- [ ] User management table loads, searches, and filters correctly
- [ ] Edit role modal saves the new role to the DB
- [ ] Override subscription sets correct `role` and `subscriptionExpiry`
- [ ] Subscription analytics charts render with real data
- [ ] Payment ledger shows all transactions with correct block explorer links
- [ ] CSV export downloads correctly and contains all expected columns
- [ ] Pending referral payouts appear in the admin table and can be marked as paid

---

## Dependencies

- Sprint 5 (Plans page — linked from settings sidebar)
- Sprint 6 (Billing page — linked from settings sidebar)
- Sprint 10 (Notification settings — linked from settings sidebar)
- Sprint 2 (users table — profile fields added here)

---

## Hands-off to Sprint 13

Sprint 13 does the full performance, SEO, and mobile pass. The settings and admin pages must be complete before Sprint 13 to include them in the mobile responsive pass and Lighthouse audit.
