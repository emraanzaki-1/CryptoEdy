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

- [x] Provision PostgreSQL (Neon recommended) — get connection string
- [x] Add `DATABASE_URL` to `.env.local` and hosting environments
- [x] Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless` (or `pg`) _(using `pg`)_
- [x] Create `drizzle.config.ts` pointing to `lib/db/schema/`
- [x] Create `lib/db/index.ts` — Drizzle client singleton _(lazy singleton pattern)_
- [x] Create `lib/db/schema/users.ts` — full `users` table as specified above _(includes reset token fields + profile fields for Sprint 12)_
- [x] Create `lib/db/schema/sessions.ts` — NextAuth sessions, accounts, verification_tokens
- [x] Create `lib/db/schema/index.ts` — barrel export of all schema
- [x] Run `drizzle-kit generate` → produces SQL migration file
- [x] Run `drizzle-kit migrate` → applies migration to database
- [x] Commit migration files to git

### Payload CMS

- [x] Install `payload`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`
- [x] Create `payload.config.ts` at project root — Postgres adapter, `PAYLOAD_SECRET`, collections defined
- [x] Create `app/(payload)/admin/[[...segments]]/page.tsx` — Payload admin page handler
- [x] Create `app/(payload)/api/[...slug]/route.ts` — Payload API route handler
- [x] Create `app/(payload)/layout.tsx` — minimal layout with Payload's `RootLayout`
- [ ] Navigate to `/admin` and confirm Payload setup screen loads _(runtime check — needs live DB)_
- [ ] Create first admin user via Payload setup screen
- [ ] Confirm Payload admin panel is accessible and functional

### NextAuth Setup

- [x] Install `next-auth@5` (beta), `@auth/drizzle-adapter`
- [x] Create `lib/auth/config.ts` — NextAuth config with Drizzle adapter, Credentials provider, JWT strategy, `jwt` + `session` callbacks embedding `role`, `id`, `isEmailVerified`, `subscriptionExpiry`
- [x] Create `app/(app)/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- [ ] Confirm `getServerSession()` works in a test Server Component _(runtime check)_

### Authentication Pages

- [ ] Install Shadcn components: `Card`, `Alert`, `Badge` _(not installed — evaluate if needed given current custom components)_
- [x] Create `app/(app)/(auth)/layout.tsx` — centered split layout with brand
- [x] Create `app/(app)/(auth)/login/page.tsx` _(with RHF + Zod validation)_
- [x] Create `app/(app)/(auth)/register/page.tsx` _(with RHF + Zod validation)_
- [x] Create `app/(app)/(auth)/verify-email/page.tsx` — token + OTP flow
- [x] Create `app/(app)/(auth)/forgot-password/page.tsx` _(with RHF + Zod validation)_
- [x] Create `app/(app)/(auth)/reset-password/page.tsx` _(with RHF + Zod validation)_
- [x] Registration: hash password (bcrypt, 12 rounds), insert user, generate `referralCode`, send verification email
- [ ] Confirm end-to-end registration → verification → login flow _(runtime check)_

### Email Service

- [x] Install `resend`
- [x] Add `RESEND_API_KEY` to env
- [x] Create `lib/email/index.ts` — Resend client singleton with lazy init
- [x] `sendVerificationEmail(email, token)` — in `lib/email/send.ts` _(inline HTML template, no separate template file)_
- [x] `sendPasswordResetEmail(email, token)` — in `lib/email/send.ts`
- [x] Create `lib/email/templates/` — TypeScript HTML template functions (zero dependencies; `@react-email/components` was deprecated and removed). `layout.ts` provides shared brand tokens and primitives; `verify-email.ts` and `reset-password.ts` are the two transactional templates. `send.ts` updated to import and use them

### Role Middleware

- [x] Create `proxy.ts` at project root _(Next.js 16 uses `proxy.ts` instead of `middleware.ts`)_
- [x] Configure matcher: auth routes, landing, dashboard, Pro routes
- [x] Logic: unauthenticated → redirect `/login`; `subscriptionExpiry` re-validation for Pro routes; insufficient role → redirect `/upgrade` or 403
- [x] Create `lib/auth/withRole.ts` — reusable `checkRole()` utility for API routes
- [ ] Test: unauthenticated access to `/feed` → redirects to `/login` _(runtime check)_
- [ ] Test: `free` user access to Pro-only route → redirects to `/upgrade` _(runtime check)_

### Placeholder Pages

- [x] `app/(app)/(dashboard)/feed/page.tsx` — feed implemented (not placeholder)
- [x] `app/(app)/(dashboard)/upgrade/page.tsx` — upgrade page with Pro CTA

---

## Acceptance Criteria / Definition of Done

- [ ] User can register with email/password and receives a verification email _(runtime check)_
- [ ] Verification link confirms email and redirects to feed _(runtime check)_
- [ ] User can log in with verified credentials and gets a session _(runtime check)_
- [ ] Unverified user can log in but sees a persistent verification banner _(runtime check)_
- [ ] Invalid credentials show a clear error message (do not reveal which field is wrong) _(runtime check)_
- [ ] Accessing `/feed` unauthenticated redirects to `/login` _(runtime check)_
- [ ] Logged-in `free` user accessing a Pro route redirects to `/upgrade` _(runtime check)_
- [ ] Payload `/admin` is accessible and functional for admin users _(runtime check)_
- [x] `drizzle-kit migrate` runs without errors
- [x] Migration SQL files are committed to git
- [x] Password is stored as bcrypt hash — never plaintext

---

## Dependencies

- Sprint 1 complete (project scaffold, env config, folder structure)

---

## Hands-off to Sprint 3

Sprint 3 will define Payload CMS collections for content. The Payload instance set up here must be running and accessible. The `users` table and auth middleware must be stable — Sprint 3 adds no changes to auth.
