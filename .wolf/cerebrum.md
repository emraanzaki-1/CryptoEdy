# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-17

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

## Key Learnings

- **Project:** cryptoedy
- **Description:** This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
- **Tailwind v4:** CSS-first config via `@theme inline` in globals.css. No `tailwind.config.js`. Color tokens registered as `--color-*`.
- **shadcn/ui v4.2.0:** Uses `base-nova` style with `@base-ui/react` (headless). NOT Radix — no `asChild` prop on Button.
- **M3 Tonal Palette:** 35+ color tokens mapped to Tailwind v4 via `@theme inline`. Shadcn bridge maps `--background`, `--foreground`, etc. to M3 equivalents.
- **Design System:** No 1px borders (use tonal layering), ghost borders at 15% opacity max, gradient CTAs, glass navigation, no pure black, Inter font with -0.04em tracking.
- **Icons:** Lucide React replaces Material Symbols from HTML templates.
- **Route groups:** `(app)` for main, `(auth)` for auth, `(dashboard)` for protected, `(payload)` for CMS.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->

- [2026-04-18] Registration API expected firstName/lastName but form sends username. Always check form payload matches API destructuring.
- [2026-04-18] Next.js 16 uses `proxy.ts` NOT `middleware.ts` — middleware.ts is deprecated and renamed to proxy.ts.
- [2026-04-17] Do NOT use `@apply border-border` in Tailwind v4 without registering `--color-border` in `@theme inline`.
- [2026-04-17] Do NOT use `<Button asChild>` with @base-ui/react — Radix-only prop. Use plain `<Link>` with button classes.
- [2026-04-18] Do NOT suggest Vercel — this project does not use Vercel. Hosting platform is TBD.
- [2026-04-19] Do NOT implement OTP code verification without a real backend endpoint — the verify-email page previously had a fake `handleVerify()` that `setTimeout`'d to success without any server call. Always verify against real API.

## Decision Log

- [2026-04-17] Chose shadcn/ui (base-nova) over other frameworks for familiarity + headless flexibility.
- [2026-04-17] M3 tonal palette for surface hierarchy without borders.
- [2026-04-18] Settings pages use reusable components (SettingsFormField, ToggleSwitch, ThemeCard, etc.) for consistency across 5 pages.
- [2026-04-18] Form validation: use `react-hook-form` + `zod` + `@hookform/resolvers` directly. Do NOT use the shadcn `Form` component — it wraps Radix `Slot` which conflicts with `@base-ui/react`. Wire `{...register('field')}` directly onto native inputs or custom input components.
  - Shared Zod schemas live in `lib/auth/schemas.ts` (loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema).
  - Pattern: RHF owns client-side validation; a separate `serverError` useState handles API-level errors.
  - All 4 auth forms (login, register, forgot-password, reset-password) already migrated to this pattern.
- [2026-04-19] Rate limiting: in-memory IP-based rate limiter at `lib/auth/rate-limit.ts`. Applied to all auth API routes. Limits: register 5/60s, forgot-password 5/300s, reset-password 5/300s, verify-email GET 10/60s, verify-email POST (resend) 3/300s.
- [2026-04-19] Email verification uses link-only flow (no OTP). OTPInput component kept in `components/auth/otp-input.tsx` for future use but not wired to verify-email page.
- [2026-04-19] Reset-password page pre-validates token via GET `/api/auth/reset-password?token=` on mount. Shows skeleton while checking, error state if invalid/expired, form only when valid.
