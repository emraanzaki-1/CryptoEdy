# Sprint 1 — Project Scaffolding

**Phase:** 1 — Foundation & Infrastructure
**Weeks:** 1–2
**Goal:** A clean, enforced, deployable shell. No features — just the foundation every future sprint builds on.

---

## Spec References

| Document                             | Relevant Sections                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §2 Technical Architecture — framework, styling, tooling decisions                 |
| `docs/specs/UI_SPECIFICATION.md`     | §1 Visual Identity & Design System — design tokens, typography, component library |

---

## Context & Fine Print

### Why This Sprint Matters

Every architectural decision made here (folder structure, alias paths, token names, commit conventions) will be inherited by all 13 sprints that follow. Cutting corners here means paying the debt in every subsequent sprint. This sprint has no user-facing output — its output is enforced quality.

### Tech Decisions Already Made (from spec)

- **Framework:** Next.js 14, TypeScript `strict: true`, App Router (not Pages Router). This is non-negotiable — Payload CMS 3.0 requires App Router.
- **Styling:** Tailwind CSS v3 + Shadcn UI. Shadcn components are copied into the repo (not a black-box dependency), which means we own the component code and can modify it freely.
- **Font:** Inter or Geist via `next/font`. Must use `next/font` — not a CDN link — to avoid layout shift and external font request.
- **No Material UI.** The spec explicitly calls for a custom fintech aesthetic. MUI's Material Design language would require fighting the library to achieve the design system defined in `UI_SPECIFICATION.md §1`.

### Design Token Fine Print

From `UI_SPECIFICATION.md §1`:

- `#0052FF` — Primary (Deep Blue). Used for: primary buttons, active nav states, link accents, toggle switches.
- `#00FF41` — Secondary (Neon Green). Used for: save/confirm actions, positive growth numbers, data highlights. **Not** for primary CTAs.
- `#FFD700` — Accent (Gold). Reserved exclusively for: PRO badges, urgency/promotional banners. Never use as a general accent.
- `#FFFFFF` — Default background for content areas.
- `#F8F9FA` — Light Grey. Used for: sidebar backgrounds, card backgrounds, input fields.
- Typography scale must support both bold display headings (research article titles) and long-form body text (18 min read articles). Inter or Geist handles both.

All tokens must be defined in `tailwind.config.ts` under `theme.extend.colors` so they're available as Tailwind utilities (`text-primary`, `bg-accent`, etc.) throughout the entire codebase.

### Shadcn UI Fine Print

- Run `npx shadcn@latest init` and select the custom theme option.
- Set CSS variables in `globals.css` to match the design tokens above.
- The Shadcn `--primary` variable must map to `#0052FF`.
- Install only the components needed in Sprint 1: `Button`, `Input`, `Form` (needed in Sprint 2 for auth forms). Do not bulk-install all components.
- Components live in `/components/ui/` — never modify Shadcn source files directly. Extend by wrapping.

### Folder Structure Fine Print

```
/app                          # Next.js App Router only
  /(auth)                     # Route group — login, register, verify-email
  /(dashboard)                # Route group — all protected user-facing pages
  /(payload)                  # Route group — Payload CMS admin handler (Sprint 2)
  /api                        # API route handlers
  /layout.tsx                 # Root layout (fonts, providers)
/components
  /ui                         # Shadcn base components (owned copies)
  /common                     # Shared app-level: Header, Footer, Sidebar
  /feed                       # Feed-specific components
  /tools                      # Tools suite components
  /auth                       # Auth forms and flows
/lib
  /db                         # Drizzle schema + client singleton
  /auth                       # NextAuth + Payload auth config
  /web3                       # Wallet connection + payment logic
  /api                        # External API wrappers (CoinGecko, DefiLlama)
  /notifications              # Notification service
/types                        # Shared TypeScript type definitions
/scripts                      # Seed scripts, migration helpers
/public                       # Static assets (logos, OG images)
```

Path aliases in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"],
    "@/types/*": ["./types/*"]
  }
}
```

### Environment Variables Fine Print

Every key must be documented in `.env.example` with a comment explaining what it's for and where to get it. Structure:

```bash
# Database
DATABASE_URL=                  # PostgreSQL connection string (Supabase/Neon/Railway)

# Payload CMS
PAYLOAD_SECRET=                # Random 32-char string — used to sign Payload sessions

# Authentication
NEXTAUTH_SECRET=               # Random 32-char string — used to sign NextAuth JWTs
NEXTAUTH_URL=                  # Full URL of the app (http://localhost:3000 in dev)

# Payments
COINBASE_COMMERCE_API_KEY=     # From Coinbase Commerce dashboard
COINBASE_COMMERCE_WEBHOOK_SECRET= # Webhook signing secret from Coinbase Commerce

# Market Data APIs
COINGECKO_API_KEY=             # CoinGecko Pro API key (free tier has rate limits)
DEFILLAMA_BASE_URL=https://api.llama.fi  # No key required — public API

# Email (for auth verification emails)
RESEND_API_KEY=                # From resend.com dashboard
```

**Rule:** If a key is missing at runtime, the app must fail loudly on startup — not silently produce broken behaviour. Use a startup validation check (`/lib/config/env.ts`) that throws if required vars are undefined.

### CI/CD Fine Print

- **PR check:** Runs `tsc --noEmit` + `eslint` + `prettier --check`. Must pass before merge.
- **Main deploy:** Runs full `next build`. Fails the deploy if build breaks.
- **Branch strategy:** `main` = staging auto-deploy. `production` branch = production deploy. Feature branches merge into `main` via PR only.
- Deploy target TBD — not Vercel. CI/CD pipeline connects to whichever hosting platform is chosen.

### Commit Convention Fine Print

Using `commitlint` with conventional commits:

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — tooling, deps, config
- `docs:` — documentation only
- `style:` — formatting (no logic change)
- `refactor:` — code restructuring
- `test:` — adding or updating tests

Husky pre-commit: runs lint-staged (eslint + prettier on staged files only).
Husky commit-msg: runs commitlint.

---

## Task Checklist

### Repo & Tooling

- [x] `npx create-next-app@latest` — TypeScript, App Router, no `src/` dir, `@` alias
- [x] Set `strict: true` in `tsconfig.json`
- [x] Configure path aliases (`@/components`, `@/lib`, `@/types`, `@/scripts`)
- [x] Install Tailwind CSS v3 + `tailwindcss-animate` plugin _(shipped as Tailwind v4 + `tw-animate-css`; same capability, CSS-first config)_
- [x] Run `npx shadcn@latest init` — custom theme, CSS variables mode _(shadcn v4.2.0, base-nova style)_
- [x] Define all design tokens in `tailwind.config.ts` under `theme.extend` _(Tailwind v4: tokens live in `globals.css` via `@theme inline` — no `tailwind.config.ts`)_
- [x] Set Shadcn CSS variables in `app/globals.css` to match spec tokens _(M3 tonal palette wired to `--m3-primary: #0052ff` etc.)_
- [x] Install Inter via `next/font/google` in root layout
- [x] Install and configure ESLint with `eslint-config-next` + `@typescript-eslint`
- [x] Install Prettier + `prettier-plugin-tailwindcss`
- [x] Create `.prettierrc` and `.eslintrc.json` _(`.prettierrc` ✓; ESLint uses flat config `eslint.config.mjs` — ESLint v9 equivalent of `.eslintrc.json`)_
- [x] Install Husky: `npx husky init`
- [x] Install lint-staged — configure in `package.json`
- [x] Install `@commitlint/cli` + `@commitlint/config-conventional`
- [x] Add `commitlint.config.ts`
- [x] Install Shadcn components needed immediately: `Button`, `Input`, `Label`, `Separator` _(Form component deferred — using `react-hook-form` + `zod` directly; see decision below)_

### Environment & Secrets

- [x] Create `.env.local` with all keys (use placeholder values locally)
- [x] Create `.env.example` with all keys + comments explaining each
- [x] Confirm `.env.local` is in `.gitignore`
- [x] Create `/lib/config/env.ts` — validates all required env vars on startup, throws with a descriptive message if any are missing

### CI/CD

- [x] Create `.github/workflows/ci.yml` — runs on PR: `tsc --noEmit`, `eslint`, `prettier --check`
- [x] Create `.github/workflows/build.yml` — runs on push to `main`: `next build`
- [ ] Choose hosting platform and connect repo — enable preview deployments on PRs
- [ ] Set `main` → Staging environment
- [ ] Create `production` branch → connect to Production environment
- [ ] Add all env vars to hosting environments (staging + production)

### Baseline Pages

- [x] `app/layout.tsx` — root layout with font, `<html lang="en">`, metadata baseline
- [x] `app/page.tsx` — homepage _(full landing page built, not placeholder)_
- [x] `app/not-found.tsx` — 404 page with brand styling
- [x] Confirm `npm run dev` starts without errors
- [x] Confirm `npm run build` completes without errors
- [ ] Confirm CI passes on a test PR

---

## Acceptance Criteria / Definition of Done

- [x] `npm run dev` starts with zero errors or warnings
- [x] `npm run build` produces a clean production build
- [x] `tsc --noEmit` passes with `strict: true`
- [x] ESLint passes with zero errors _(and zero warnings)_
- [x] A commit with an invalid message (e.g. "stuff") is rejected by Husky
- [ ] A PR to `main` triggers the CI workflow and shows pass/fail
- [ ] Preview URL is generated for a test PR
- [x] Design tokens (`text-primary`, `bg-accent`, `text-secondary`) render correctly in a test component
- [x] `.env.local` is not committed to git
- [x] `.env.example` is committed and documents every key

---

## Dependencies

None. This is Sprint 1.

---

## Hands-off to Sprint 2

Sprint 2 will install Payload CMS, Drizzle ORM, and build authentication on top of this scaffold. The folder structure, aliases, and env config established here must not change in Sprint 2 — extend, don't reorganise.

---

## Decisions Made During Sprint

### Form Validation: `react-hook-form` + `zod` (not shadcn `Form`)

**Decision:** Skip the shadcn `Form` component. Use `react-hook-form` + `zod` + `@hookform/resolvers` directly.

**Rationale:** The shadcn `Form` component wraps Radix `Slot` internally, which conflicts with the project's `@base-ui/react` setup. Wiring `react-hook-form` directly to the existing `Input`, `Label`, and custom input elements via `{...register(...)}` gives the same validation/a11y benefit without compatibility issues.

**Implementation:**

- Shared Zod schemas in `lib/auth/schemas.ts` (`loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`)
- All 4 auth forms (login, register, forgot-password, reset-password) migrated from `useState` + manual validation to `useForm` + `zodResolver`
- Inline field error messages via `errors.<field>.message`
- `isSubmitting` from RHF replaces manual `loading` state
- Server-side errors (API failures) kept as `serverError` state alongside RHF — RHF handles client validation, `serverError` handles API responses
