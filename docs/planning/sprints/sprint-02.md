# Sprint 2 — Data Layer & Auth Foundation

**Phase:** 1 — Foundation & Infrastructure
**Weeks:** 3–4
**Goal:** PostgreSQL connected, Drizzle schema defined, Payload CMS admin live, and users can register/verify/login with role-based redirects working.

---

## Spec References

| Document                             | Relevant Sections                                                     |
| ------------------------------------ | --------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §2 Technical Architecture — DB, auth stack decisions                  |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §3 User Roles and Permissions — all 5 role definitions                |
| `docs/specs/USER_JOURNEY.md`         | §1 Guest → Registered Conversion — registration and verification flow |

---

## Context & Fine Print

### Database Fine Print

From `PROJECT_REQUIREMENTS.md §2`:

> "PostgreSQL with Drizzle ORM for type-safe and efficient data handling."

- Use **Drizzle ORM** — not Prisma, not raw SQL. All schema definitions are in TypeScript, colocated in `/lib/db/schema/`.
- Split schema into multiple files by domain (e.g. `users.ts`, `sessions.ts`) — don't put everything in one file.
- The **same PostgreSQL database** is shared between Drizzle (application queries) and Payload CMS (its own collections). They coexist in separate tables — never cross-query between the two directly. Drizzle owns user/subscription/payment tables; Payload owns content tables.
- Always use `drizzle-kit` for migrations. Never alter the database schema manually. Migration files must be committed to git.
- Database providers in order of preference: **Neon** (serverless Postgres, free tier, Vercel-native) → Supabase → Railway.

### User Role Schema Fine Print

From `PROJECT_REQUIREMENTS.md §3`, the five roles and their access:

| Role      | Access                                                                                     |
| --------- | ------------------------------------------------------------------------------------------ |
| `guest`   | Homepage, marketing, limited teaser articles (first ~20%)                                  |
| `free`    | Free newsletters, public watchlists, basic community                                       |
| `pro`     | Full platform access: picks, deep research, airdrops, livestreams, all tools               |
| `analyst` | Everything Pro has + create/edit/publish content in Payload admin                          |
| `admin`   | Full platform oversight: user role management, subscription overrides, financial analytics |

Role hierarchy for middleware: `admin > analyst > pro > free > guest`

The `role` field on the `users` table is an enum. When a user registers, they default to `free`. `guest` is an unauthenticated state — there is no `guest` row in the database. The middleware treats any unauthenticated request as guest-level access.

### Users Table Fine Print

```ts
users {
  id: uuid (primary key, default: gen_random_uuid())
  email: varchar(255) (unique, not null)
  passwordHash: text (nullable — null if wallet-only auth)
  role: enum('free', 'pro', 'analyst', 'admin') (default: 'free')
  subscriptionExpiry: timestamp (nullable — null for non-pro users)
  emailVerified: boolean (default: false)
  verificationToken: text (nullable — cleared after verification)
  referralCode: varchar(16) (unique — generated on registration)
  referredBy: uuid (nullable — FK to users.id)
  createdAt: timestamp (default: now())
  updatedAt: timestamp (auto-updated)
}
```

**Fine prints:**

- `passwordHash` is nullable to support users who register via wallet only (Sprint 5).
- `referralCode` is generated on every registration — it's needed for the referral system in Sprint 6, so create it now.
- `emailVerified: false` users can log in but see a persistent "verify your email" banner. They are NOT locked out — locking out unverified users causes too much friction.
- `subscriptionExpiry` is checked on every Pro-gated request. Expired Pro users are downgraded to `free` access (not kicked out, just access-restricted).

### Sessions & Accounts Tables Fine Print

These are required by NextAuth.js Drizzle adapter (Sprint 5 will add wallet auth on top):

```ts
sessions {
  id: uuid, sessionToken: varchar (unique), userId: uuid (FK), expires: timestamp
}
accounts {
  id: uuid, userId: uuid (FK), type: varchar, provider: varchar,
  providerAccountId: varchar, access_token: text, expires_at: integer,
  token_type: varchar, scope: varchar, id_token: text, session_state: varchar
}
verification_tokens {
  identifier: varchar, token: varchar (unique), expires: timestamp
}
```

These are standard NextAuth schema — implement them exactly as the Drizzle adapter expects. Don't rename columns.

### Payload CMS Integration Fine Print

From `PROJECT_REQUIREMENTS.md §2`:

> "Payload CMS (3.0+) — Integrated directly into the Next.js application for a unified codebase and high-performance content fetching via its Local API."

Key architectural points:

- Payload is mounted at `app/(payload)/admin/[[...segments]]/route.ts` — this is the App Router handler pattern for Payload 3.x.
- Payload uses the **same PostgreSQL connection** as Drizzle. Configure it with `@payloadcms/db-postgres` adapter pointing to `DATABASE_URL`.
- `payload.config.ts` lives at the project root.
- The **Payload Local API** is used server-side for content fetching (e.g., in `generateStaticParams`, Server Components). This is faster than HTTP — it queries the DB directly without going through the network.
- Payload has its own user collection (`payload-users`) which is separate from the app's `users` table. Payload users are for CMS editors only (analyst, admin). Do NOT use Payload auth for end users — that's Payload Native Auth + NextAuth's domain.

### Email/Password Auth Fine Print

From `USER_JOURNEY.md §1`:

> "User provides Email and Password (handled by Payload Native Auth). System sends a verification email."

Wait — re-reading the spec more carefully: Payload Native Auth handles email/password for the CMS admin (`/admin`). For the **end-user app**, we use **NextAuth.js with a credentials provider** backed by the Drizzle `users` table. These are two separate auth systems:

1. **Payload Auth** → Only for `/admin` panel (analysts, editors, admins logging into the CMS)
2. **NextAuth Credentials** → For end users (free, pro members) logging into the main app

This is the correct interpretation based on `PROJECT_REQUIREMENTS.md §2`:

> "Payload Native Auth: For traditional Email/Password login. NextAuth.js: Integrated for Web3 Wallet authentication."

So the split is: Payload Native Auth covers email/password for CMS users; NextAuth covers all app-level auth (credentials + wallet in Sprint 5).

**For this sprint:** Implement NextAuth Credentials provider against the `users` Drizzle table for app-level login. Payload admin uses its own auth — just confirm it works out of the box.

### Role Middleware Fine Print

The `withRole` middleware utility:

- Reads the NextAuth session to get the user's current role.
- Re-validates `subscriptionExpiry` on every Pro-gated request — a Pro user whose subscription expired yesterday must be treated as `free`, even if their session still says `pro`. Do not rely solely on the session role for gating decisions.
- Returns HTTP 403 for API routes when role is insufficient.
- Redirects to `/upgrade` for page routes when Pro is required but user is `free`.
- Redirects to `/login` for page routes when authentication is required but user is unauthenticated.

Middleware file: `middleware.ts` at project root (Next.js convention). Uses `matcher` config to only run on `/(dashboard)` and `/api` routes.

### Email Verification Fine Print

- On registration: generate a `verificationToken` (crypto random, 32 bytes, hex-encoded), store on user, send email with link `https://app.com/verify-email?token={token}`.
- Token expires in 24 hours.
- On verify: find user by token, check expiry, set `emailVerified: true`, clear `verificationToken`.
- If token expired: show "resend verification email" option.
- Use **Resend** (`resend.com`) for transactional email — simpler than Nodemailer, works well with Vercel.

---

## Task Checklist

### Database

- [ ] Provision PostgreSQL (Neon recommended) — get connection string
- [ ] Add `DATABASE_URL` to `.env.local` and Vercel environments
- [ ] Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless` (or `pg`)
- [ ] Create `drizzle.config.ts` pointing to `lib/db/schema/`
- [ ] Create `lib/db/index.ts` — Drizzle client singleton
- [ ] Create `lib/db/schema/users.ts` — full `users` table as specified above
- [ ] Create `lib/db/schema/sessions.ts` — NextAuth sessions, accounts, verification_tokens
- [ ] Create `lib/db/schema/index.ts` — barrel export of all schema
- [ ] Run `drizzle-kit generate` → produces SQL migration file
- [ ] Run `drizzle-kit migrate` → applies migration to database
- [ ] Commit migration files to git

### Payload CMS

- [ ] Install `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
- [ ] Create `payload.config.ts` at project root — Postgres adapter, `PAYLOAD_SECRET`, empty collections array for now
- [ ] Create `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin page handler
- [ ] Create `app/(payload)/admin/[[...segments]]/route.ts` — Payload API route handler
- [ ] Create `app/(payload)/layout.tsx` — minimal layout (no app chrome)
- [ ] Navigate to `/admin` and confirm Payload setup screen loads
- [ ] Create first admin user via Payload setup screen
- [ ] Confirm Payload admin panel is accessible and functional

### NextAuth Setup

- [ ] Install `next-auth@5` (beta), `@auth/drizzle-adapter`
- [ ] Create `lib/auth/config.ts` — NextAuth config with:
  - Drizzle adapter pointing to `lib/db/index.ts`
  - Credentials provider (email + password against `users` table)
  - Session strategy: `jwt` (not database sessions — simpler for now)
  - Callbacks: `jwt` (embed `role` and `id` into token), `session` (expose `role` and `id` on client session)
- [ ] Create `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- [ ] Confirm `getServerSession()` works in a test Server Component

### Authentication Pages

- [ ] Install Shadcn components: `Card`, `Alert`, `Badge` (in addition to Sprint 1 components)
- [ ] Create `app/(auth)/layout.tsx` — centered card layout, brand logo
- [ ] Create `app/(auth)/login/page.tsx`:
  - Email + Password fields
  - "Sign in" button
  - Link to `/register`
  - Link to `/forgot-password`
  - Error state for invalid credentials
- [ ] Create `app/(auth)/register/page.tsx`:
  - First Name, Last Name, Email, Password, Confirm Password
  - Terms acceptance checkbox (links to `/legal/terms`)
  - "Create account" button
  - Link to `/login`
  - On submit: hash password (bcrypt, 12 rounds), insert user, generate `referralCode`, send verification email
- [ ] Create `app/(auth)/verify-email/page.tsx`:
  - Reads `?token=` from URL
  - Verifies token, sets `emailVerified: true`
  - Success → redirect to `/(dashboard)/feed`
  - Expired → show "Resend email" button
- [ ] Create `app/(auth)/forgot-password/page.tsx` — email input, send reset link
- [ ] Create `app/(auth)/reset-password/page.tsx` — new password + confirm, reads `?token=` from URL

### Email Service

- [ ] Install `resend`
- [ ] Add `RESEND_API_KEY` to env
- [ ] Create `lib/email/index.ts` — Resend client singleton
- [ ] Create `lib/email/templates/verify-email.tsx` — HTML email template
- [ ] Create `lib/email/templates/reset-password.tsx` — HTML email template
- [ ] `sendVerificationEmail(email, token)` utility function
- [ ] `sendPasswordResetEmail(email, token)` utility function

### Role Middleware

- [ ] Create `middleware.ts` at project root
- [ ] Configure `matcher`: `['/(dashboard)(.*)', '/api/((?!auth).*)']`
- [ ] Logic: unauthenticated → redirect `/login`; check `subscriptionExpiry` for Pro routes; insufficient role → redirect `/upgrade` or return 403
- [ ] Create `lib/auth/withRole.ts` — reusable role check for API routes
- [ ] Test: unauthenticated access to `/dashboard/feed` → redirects to `/login`
- [ ] Test: `free` user access to Pro-only route → redirects to `/upgrade`

### Placeholder Pages

- [ ] `app/(dashboard)/feed/page.tsx` — placeholder "Feed coming in Sprint 4"
- [ ] `app/(dashboard)/upgrade/page.tsx` — placeholder "Upgrade to Pro"

---

## Acceptance Criteria / Definition of Done

- [ ] User can register with email/password and receives a verification email
- [ ] Verification link confirms email and redirects to feed
- [ ] User can log in with verified credentials and gets a session
- [ ] Unverified user can log in but sees a persistent verification banner
- [ ] Invalid credentials show a clear error message (do not reveal which field is wrong)
- [ ] Accessing `/dashboard/feed` unauthenticated redirects to `/login`
- [ ] Logged-in `free` user accessing a Pro route redirects to `/upgrade`
- [ ] Payload `/admin` is accessible and functional for admin users
- [ ] `drizzle-kit migrate` runs without errors
- [ ] Migration SQL files are committed to git
- [ ] Password is stored as bcrypt hash — never plaintext

---

## Dependencies

- Sprint 1 complete (project scaffold, env config, folder structure)

---

## Hands-off to Sprint 3

Sprint 3 will define Payload CMS collections for content. The Payload instance set up here must be running and accessible. The `users` table and auth middleware must be stable — Sprint 3 adds no changes to auth.
