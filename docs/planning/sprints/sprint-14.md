# Sprint 14 — Hardening & Go-Live

**Phase:** 7 — Launch
**Weeks:** 27–28
**Goal:** The platform is production-ready. All six user journeys verified end-to-end. Security audit complete. Monitoring live. Analysts onboarded. Public launch.

---

## Spec References

| Document                             | Relevant Sections                                              |
| ------------------------------------ | -------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §6 Non-Functional Requirements — security, scalability, mobile |
| `docs/specs/USER_JOURNEY.md`         | All 6 journeys — used as the QA test plan                      |

---

## Context & Fine Print

### Launch Readiness Checklist Philosophy

This sprint is not about building new features. It is about verifying that everything built in Sprints 1–13 works correctly **together**, is secure, and is monitored. Every item in this sprint is a gate — the platform does not go live until all high-priority items are checked.

Priority tiers:

- **P0 — Blocker:** Cannot go live without this. (Security, payment verification, data loss)
- **P1 — Critical:** Should be done before go-live; can delay by 24h if needed. (All user journey paths)
- **P2 — Important:** Do before go-live but won't delay by more than 48h. (Monitoring, analytics)
- **P3 — Nice to have:** Can go live without; fix in first week post-launch. (Minor UX issues, edge cases)

### End-to-End QA Fine Print

From `USER_JOURNEY.md` — all 6 journeys must be tested on the **production environment** (not just staging), by a human tester (not automated tests), using real wallets and real transactions (use testnets for payment testing, but real testnet coins).

**Journey 1 — Guest → Registered Conversion:**
From `USER_JOURNEY.md §1`:

1. Visit homepage without an account (incognito window).
2. Click a "Research Report" teaser on the homepage.
3. Confirm: first ~20% of article is visible, then blur transition appears.
4. Click "Create Free Account to Continue Reading".
5. Register with email + password.
6. Confirm: verification email arrives within 2 minutes.
7. Click verification link.
8. Confirm: redirected to feed, email verified banner is gone, Free tier access is active.
9. Attempt to access a Pro article — confirm: paywall is shown.

**Journey 2 — Go Pro (Crypto-Only):**
From `USER_JOURNEY.md §2`:

1. Logged in as a Free user. Click a locked pick.
2. Confirm: redirected to Plans page with Pro pricing card.
3. Select chain: Polygon (lowest fees for testing).
4. Select asset: USDC.
5. Connect MetaMask (ensure test wallet has Polygon USDC).
6. Confirm: payment address displayed, QR code visible.
7. Initiate transaction from MetaMask.
8. Confirm: pending state shows tx hash + Polygonscan link.
9. Wait for confirmation (typically <30s on Polygon).
10. Confirm: Pro role upgraded, "Welcome to Pro" notification received, all Pro content is unlocked.
11. Check `/settings/billing` — confirm: subscription shows Active, correct expiry, transaction in history.

**Journey 3 — Content Discovery & Tools:**
From `USER_JOURNEY.md §3`:

1. Logged in as Pro user. Navigate to feed.
2. Toggle to Grid view — confirm: preference persists after reload.
3. Click "Research" filter pill — confirm: only Research posts show.
4. Hover over "Tools" in sidebar — confirm: submenu slides out.
5. Click "Assets & Picks" — confirm: picks list loads with Pro content.
6. Click a pick with `relatedPost` — confirm: "View Analysis" links to the correct article.
7. Return to feed. Use the command palette (`⌘ /`) — confirm: opens.
8. Navigate to Airdrops tool. Click an active airdrop.
9. Check off "Step 1" — confirm: progress bar updates and checkbox persists after reload.

**Journey 4 — Community & Notifications:**
From `USER_JOURNEY.md §4`:

1. As admin: publish a new Research Report in Payload CMS.
2. As Pro user: confirm notification bell shows a new unread badge within 30 seconds.
3. Open bell dropdown → click "Content" tab → confirm: the new research notification is visible.
4. Click the notification → confirm: navigates to the article, notification marked as read.
5. Switch to "Community" tab in the bell — confirm: empty state shows.
6. Navigate to `/settings/notifications` via the cog wheel.
7. Toggle off "Research" notifications — confirm: saves immediately.
8. As admin: publish another Research Report.
9. Confirm: the user does NOT receive a Research notification (preference was disabled).
10. Re-enable Research notifications.

**Journey 5 — Referral & Growth:**
From `USER_JOURNEY.md §5`:

1. Logged in as User A. Open user dropdown → click "Referral".
2. Copy the unique referral link.
3. Open in a new incognito window. Confirm: redirects to `/register` with referral context.
4. Register as a new user (User B).
5. User B completes Pro payment.
6. As User A: navigate to `/referral` — confirm: 1 conversion, $10 USDC pending reward.
7. As admin: confirm: referral reward appears in admin pending payouts table.

**Journey 6 — Analyst Workflow:**
From `USER_JOURNEY.md §6`:

1. Analyst logs into `/admin`.
2. Creates a new "Research Report": sets `isProOnly: true`, sets `riskRating: high`, sets a `category`.
3. Saves as Draft.
4. Admin logs in and finds the draft in review queue.
5. Admin publishes.
6. Confirm: post appears on the feed with Gold PRO badge and correct category badge.
7. Confirm: Pro users receive a "New Research" notification.
8. Confirm: Free users receive a teaser/locked notification.

### Security Audit Fine Print

Security is P0 — no exceptions.

**Authentication:**

- [ ] Confirm: passwords are hashed with bcrypt (rounds ≥ 12). Verify by inspecting the `passwordHash` column in DB — should start with `$2b$12$`.
- [ ] Confirm: session tokens are rotated on login (no session fixation).
- [ ] Confirm: JWTs have an expiry (`exp` claim). Verify by decoding a token at `jwt.io`.
- [ ] Confirm: logout invalidates the session. After logout, the old session token returns 401.
- [ ] Confirm: auth endpoints are rate-limited. Try 10 rapid login attempts — should get 429.

**Payment Verification:**

- [ ] Verify: submitting the same `txHash` twice returns 409 on the second request.
- [ ] Verify: submitting a tx with the wrong recipient address returns 400.
- [ ] Verify: submitting a tx with the wrong token (e.g., ETH instead of USDC) returns 400.
- [ ] Verify: submitting a tx with `amount < 100` returns 400.
- [ ] Verify: Coinbase Commerce webhook with an invalid signature is rejected (return 400).
- [ ] Verify: admin subscription override is inaccessible to non-admin users (return 403).

**Input Validation & Injection:**

- [ ] Verify: all Drizzle queries use parameterised values (no template string interpolation of user input).
- [ ] Verify: article rich text (Lexical output) is sanitised before rendering. Test: paste `<script>alert('xss')</script>` in a reply body — confirm it does not execute.
- [ ] Verify: file uploads (avatar) validate MIME type server-side. Test: rename a `.exe` to `.jpg` and upload — should be rejected with "Invalid file type".
- [ ] Verify: all API routes that mutate data check the authenticated user's role. Use Postman to call `PATCH /api/admin/users/:id/role` without admin role — confirm 403.

**Webhook Security:**

- [ ] Verify: Coinbase Commerce webhook signature verification is active in production (HMAC-SHA256).
- [ ] Verify: Solana Pay callback validates the user identity from the memo field.
- [ ] Verify: cron endpoints reject requests without the `CRON_SECRET` header.

**Data Exposure:**

- [ ] Verify: `GET /api/notifications` only returns notifications for the currently authenticated user. Test: obtain User A's notification ID and try to read it as User B — should return 404 (not 403 — don't confirm existence).
- [ ] Verify: `GET /api/admin/*` endpoints return 403 for non-admin users.
- [ ] Verify: Payload CMS draft posts are not accessible via the public Payload REST API.

### Monitoring & Observability Fine Print

- **Sentry:** Install `@sentry/nextjs`. Must capture unhandled promise rejections in API routes. Sentry project must be configured with the production DSN in Vercel environment variables.
- **Health check endpoint:** `GET /api/health` — returns `{ status: 'ok', db: 'ok', timestamp }`. The DB check runs `SELECT 1` via Drizzle. Use this for uptime monitoring.
- **Uptime monitor:** Configure an external uptime monitor (Better Uptime, Checkly, or UptimeRobot) to ping `GET /api/health` every 60 seconds. Alert the team on 2 consecutive failures.
- **Payment event logging:** Every payment verification event (success or failure) must be logged with: `{ timestamp, userId, txHash, chain, asset, amount, result, failureReason? }`. Use `console.log` in structured JSON format (Vercel captures this in its log drain). Do NOT log wallet private keys, mnemonics, or full session tokens.

### Production Deployment Fine Print

**Pre-deployment checklist:**

- [ ] All environment variables set in Vercel Production environment.
- [ ] `DATABASE_URL` points to the production PostgreSQL instance (not staging).
- [ ] `PAYLOAD_SECRET` is a unique, securely-generated value (different from staging).
- [ ] `NEXTAUTH_SECRET` is unique to production.
- [ ] `NEXTAUTH_URL` is set to the production domain (e.g., `https://app.cryptonary.com`).
- [ ] Coinbase Commerce webhook URL updated to production URL in the Coinbase Commerce dashboard.
- [ ] Solana Pay receiving address is the platform's **mainnet** wallet (not testnet).
- [ ] USDC/USDT contract addresses used in payment verification are **mainnet** addresses.
- [ ] Platform's USDC/USDT receiving wallet has sufficient balance to receive payments (confirm wallet is accessible).

**Database:**

- [ ] Production PostgreSQL has daily backups configured (Neon/Supabase provides this automatically).
- [ ] Run `drizzle-kit migrate` against the production database before deploying.
- [ ] Verify migration succeeded by checking the `drizzle_migrations` table.
- [ ] Run the seed script for static reference data only (categories, tags). Do NOT run the full seed (no test users in production).

**Domain & SSL:**

- [ ] Production domain (`cryptonary.com` or subdomain) is configured in Vercel.
- [ ] SSL certificate is active (Vercel handles this automatically with Let's Encrypt).
- [ ] HTTP → HTTPS redirect is active.
- [ ] `www` redirects to the canonical domain (or vice versa).

**Smoke Tests on Production:**
After deployment, before announcing launch:

1. Visit homepage — loads correctly, no console errors.
2. Register a new account — verification email arrives.
3. Login — dashboard feed loads.
4. Visit a Pro article as Free user — paywall appears.
5. `/admin` — Payload admin loads.
6. `/api/health` — returns `{ status: 'ok', db: 'ok' }`.
7. No errors in Sentry dashboard for the smoke test session.

### Analyst/Editor Onboarding Fine Print

- [ ] Create all analyst and editor accounts manually in production (via Payload admin user creation).
- [ ] Send credentials securely (not via email in plaintext — use a secure credential sharing tool).
- [ ] Create a short onboarding document for the content team (`docs/CONTENT_TEAM_GUIDE.md`):
  - How to log into `/admin`.
  - How to create and publish a Research Report.
  - How to create a Pick.
  - How to publish an Airdrop entry.
  - How to add a Pro Lounge thread.
  - Escalation process for technical issues.
- [ ] Publish 3–5 real articles before go-live (so the platform doesn't launch with only seed data).
- [ ] Create 3–5 real Picks entries.
- [ ] Create 2–3 real Airdrop Hub entries for currently active airdrops.

---

## Task Checklist

### End-to-End QA

- [ ] Journey 1 (Guest → Registered) tested and passing
- [ ] Journey 2 (Go Pro) tested on testnet and passing
- [ ] Journey 3 (Content Discovery & Tools) tested and passing
- [ ] Journey 4 (Community & Notifications) tested and passing
- [ ] Journey 5 (Referral & Growth) tested and passing
- [ ] Journey 6 (Analyst Workflow) tested and passing
- [ ] All P0 QA findings resolved
- [ ] All P1 QA findings resolved

### Security

- [ ] All P0 security items in the checklist above verified
- [ ] Penetration test (manual): attempt the most likely attack vectors (IDOR on notifications, tx hash replay, role escalation via API)
- [ ] Ensure Sentry is active and capturing errors in staging before promoting to production
- [ ] Verify rate limiting is active on auth endpoints
- [ ] Verify webhook signature verification is active

### Monitoring

- [ ] Install `@sentry/nextjs` and configure DSN
- [ ] `GET /api/health` endpoint live and returning correctly
- [ ] Uptime monitoring configured (alerting the team on failure)
- [ ] Payment event logging verified in Vercel log output

### Production Deployment

- [ ] All pre-deployment env var checklist complete
- [ ] Production PostgreSQL backups enabled
- [ ] `drizzle-kit migrate` run on production DB
- [ ] DNS + custom domain configured
- [ ] SSL active + HTTPS redirect active
- [ ] Production smoke tests all passing
- [ ] No errors in Sentry for the smoke test session

### Content & Onboarding

- [ ] Analyst/editor accounts created in production
- [ ] `docs/CONTENT_TEAM_GUIDE.md` written and shared
- [ ] ≥ 3 real published articles before launch
- [ ] ≥ 3 real Picks entries before launch
- [ ] ≥ 2 real active Airdrop Hub entries before launch

---

## Acceptance Criteria / Definition of Done

- [ ] All 6 user journeys pass on the production environment
- [ ] No P0 or P1 security findings unresolved
- [ ] `GET /api/health` returns `{ status: 'ok', db: 'ok' }` on production
- [ ] Sentry is capturing errors (verify with an intentional test error that Sentry shows it)
- [ ] Uptime monitor is active and alert contact is configured
- [ ] Production database has daily backups enabled
- [ ] Payment flow tested end-to-end on testnet with real wallet confirmation
- [ ] Tx hash replay attack is blocked (idempotency confirmed)
- [ ] Webhook signature verification blocks unsigned requests
- [ ] Content team has created at least 3 real articles on production
- [ ] Public launch announcement can be made

---

## Post-Launch (Week 29+)

Items deferred from this sprint for post-launch:

- Automated referral payout (vs. current manual payout)
- Real-time messaging (WebSockets vs. current 15s polling)
- Full search backend (Algolia or PostgreSQL full-text search)
- Email newsletter digest (weekly summary of new content)
- Native mobile app (React Native or PWA)
- Multi-language support

---

## Dependencies

- All sprints 1–13 complete and stable
