# Sprint 6 — On-Chain Verification & Subscription Management

**Phase:** 3 — Web3 Payments & Subscriptions
**Weeks:** 11–12
**Goal:** Complete the payment loop. Verify transactions on-chain, upgrade users to Pro instantly, manage subscription lifecycle, and build the referral reward system.

---

## Spec References

| Document                             | Relevant Sections                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §5 Web3 Payment & Subscription Logic — verification, renewal alerts, on-chain settlement |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4D User Management & Social — referral system, crypto rewards                           |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4F Admin Dashboard — financial reporting, subscription analytics                        |
| `docs/specs/USER_JOURNEY.md`         | §2 Go Pro Subscription — steps 6–7: verification and access unlock                       |
| `docs/specs/USER_JOURNEY.md`         | §5 Referral & Growth — link sharing, conversion detection, USDC/USDT reward              |

---

## Context & Fine Print

### On-Chain Verification Architecture Fine Print

From `PROJECT_REQUIREMENTS.md §5`:

> "On-chain Verification: Automated verification of transaction hashes via webhooks or indexers to instantly unlock member access."

Three verification paths (in order of reliability):

**Path 1 — Coinbase Commerce Webhook (preferred for EVM):**

- Coinbase Commerce calls our webhook when a charge is confirmed.
- Webhook URL: `POST /api/payments/webhook/coinbase`
- Verify the webhook signature using `HMAC-SHA256` against `COINBASE_COMMERCE_WEBHOOK_SECRET`.
- Parse the event type — only process `charge:confirmed`. Ignore `charge:created`, `charge:pending`.
- Extract: `chargeId`, `userId` (stored in charge metadata when creating the charge in Sprint 5), `payments[0].transaction.hash`, `payments[0].value.amount`, `payments[0].value.currency`.

**Path 2 — Solana Transaction Polling (for Solana):**

- Solana doesn't have a webhook equivalent. Use polling.
- When a Solana tx hash is submitted (from Sprint 5), call `POST /api/payments/verify-tx` immediately.
- The verification route polls `connection.getSignatureStatus(txHash)` every 5s for up to 5 minutes.
- Extract the `userId` from the `memo` field of the transaction (set in Sprint 5's Solana Pay URL).

**Path 3 — Manual tx hash verification (fallback):**

- If webhooks fail or user closes the browser during pending state, they can submit their tx hash manually.
- UI: A "Having trouble? Submit your tx hash manually" link shown after 10 minutes of pending state.
- `POST /api/payments/verify-tx` accepts `{ txHash, chain, userId }`.
- Server-side: fetch tx from the chain's RPC, verify recipient address + token + amount.

**Idempotency (critical):**
A tx hash can only be used once. If a tx hash is submitted twice:

- Check the `payments` table for `txHash` — if exists and `status = 'confirmed'`, reject with 409.
- This prevents a user sharing their tx hash to give Pro access to multiple accounts.

### Transaction Validation Rules Fine Print

When verifying a transaction (any path), all conditions must pass:

| Check             | Rule                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| Recipient address | Must match the platform's designated receiving address for that chain            |
| Token             | Must be USDC or USDT contract address for that chain                             |
| Amount            | Must be exactly 100 (in token decimals: USDC = 6 decimals, so 100_000_000 units) |
| Status            | Transaction must be confirmed (not pending, not failed)                          |
| Unique hash       | Must not already exist in the `payments` table                                   |
| Age               | Transaction must be less than 30 minutes old (prevent old tx replay)             |

**Amount tolerance:** Accept 99.99–100.01 USD equivalent (gas fee edge cases on some chains may result in micro-differences). But stablecoins are exact — there's no tolerance needed. Reject anything < 100.

### On Verification Success — Fine Print

From `USER_JOURNEY.md §2`:

> "Once confirmed, the system updates the user's role to Pro Member and sets subscriptionExpiry to +365 days."

The upgrade must be atomic:

```ts
await db.transaction(async (tx) => {
  await tx
    .insert(payments)
    .values({
      userId,
      txHash,
      chain,
      asset,
      amount: 100,
      status: 'confirmed',
      confirmedAt: new Date(),
    })
  await tx
    .update(users)
    .set({
      role: 'pro',
      subscriptionExpiry: addDays(new Date(), 365),
    })
    .where(eq(users.id, userId))
})
```

If the DB transaction fails, the payment record is not saved and the role is not upgraded. The user can retry — the tx hash verification is idempotent (second attempt will see the tx is valid but no payment record exists, so it will retry the upgrade).

After success:

1. Update user role + expiry (above).
2. Fire `onSubscriptionActivated(userId)` notification event (Sprint 10 wires the full notification).
3. Check if user was referred → if `users.referredBy` is not null → queue referral reward (see below).
4. Clear `pending-payment` from the user's localStorage (via response flag).
5. Return `{ success: true, newRole: 'pro', expiresAt }` to the frontend.
6. Frontend: redirect to `/dashboard/feed` with a "Welcome to Pro" toast notification.

### Subscription Lifecycle Fine Print

From `PROJECT_REQUIREMENTS.md §5`:

> "Renewal Alerts: Automated notifications for subscription expiry, as crypto payments lack traditional 'auto-renew' capabilities."

Cron job logic (Vercel Cron, runs daily at 09:00 UTC):

```
/api/cron/subscription-check  (protected by CRON_SECRET header)

Query: SELECT * FROM users WHERE role = 'pro' AND subscriptionExpiry IS NOT NULL

For each user:
  daysUntilExpiry = diff(subscriptionExpiry, now())
  if daysUntilExpiry <= 0:
    UPDATE users SET role = 'free' WHERE id = user.id
    trigger onSubscriptionExpired(userId) notification
  elif daysUntilExpiry in [1, 7, 14, 30]:
    trigger onSubscriptionExpiring(userId, daysUntilExpiry) notification
```

Fine prints:

- A user whose subscription just expired is downgraded to `free` immediately — they lose Pro access on their next page load (middleware re-checks `subscriptionExpiry` on every request).
- Do not delete the payment history. The `payments` table is permanent — it's the financial record.
- The expiry check in middleware is: `user.role === 'pro' && user.subscriptionExpiry && user.subscriptionExpiry > new Date()`. If either condition fails, treat as `free`.

### Billing Page Fine Print

From `PROJECT_REQUIREMENTS.md §4G` (implied):

The Billing page (`/settings/billing`) shows:

- Current plan: "Pro Member" (active, green badge) or "Free" (grey badge).
- Expiry date: "Your Pro membership expires on March 27, 2027".
- For expired users: "Your membership expired on [date]. Renew now →" with a link to `/settings/plans`.
- Transaction history table: columns = Date, Chain, Asset, Amount, Status, Tx Hash.
- Each tx hash is a clickable link to the appropriate block explorer.
- Connected wallet addresses: list all linked wallets from the `accounts` table (type = 'wallet').

### Referral System Fine Print

From `USER_JOURNEY.md §5`:

> "A friend uses the link to sign up and pays $100 for the annual Pro plan. The system detects the referred payment and automatically logs a referral credit ($10 in USDC/USDT) to the user's account dashboard."

**Referral code generation:** Created in Sprint 2 (`referralCode` column on `users`). 8-character alphanumeric, URL-safe, unique.

**Referral link format:** `https://app.cryptonary.com/ref/{referralCode}`

- `/ref/[code]/page.tsx` → sets a `referral_code` cookie (HttpOnly, 30-day expiry) → redirects to `/register`.
- On registration: if `referral_code` cookie exists, set `users.referredBy = referrerId` (the user whose code it was).

**Reward calculation:**

- Reward: $10 USDC or USDT (10% of the $100 subscription).
- Asset: same as what the referred user paid in. If they paid USDC → referrer gets USDC.
- Chain: referrer's preferred chain (or same chain as payment).

**Reward disbursement:**
This is real money moving on-chain. The platform must hold a wallet balance of USDC/USDT to pay referral rewards. Two approaches:

1. **Manual disbursement (Sprint 6):** Log the pending reward in the `referrals` table. Admin manually initiates the transfer. The admin financial dashboard (Sprint 12) shows pending referral payouts.
2. **Automated (future):** Platform's wallet automatically sends USDC/USDT using a hot wallet. Out of scope for this sprint.

For Sprint 6: implement the manual approach. Store reward in `referrals` table, show in the user's Referral page as "Pending" until admin confirms payout, then "Paid" with the reward `txHash`.

```ts
referrals {
  id: uuid
  referrerId: uuid (FK users.id — the one who referred)
  referredUserId: uuid (FK users.id — the new Pro member)
  status: enum('pending', 'paid')
  rewardAmount: decimal(10, 2) (default: 10.00)
  rewardAsset: enum('USDC', 'USDT')
  rewardChain: varchar
  rewardTxHash: varchar (nullable — set when admin pays out)
  createdAt: timestamp
  paidAt: timestamp (nullable)
}
```

**Referral page (`/referral`):**

- Unique referral link with copy button + share buttons (X, WhatsApp).
- Stats: Total referrals sent, Total converted, Total earned (sum of paid rewards).
- Reward history table: referred user (display name only, not email), date, amount, status (Pending / Paid).

---

## Task Checklist

### On-Chain Verification

- [ ] `POST /api/payments/webhook/coinbase` — webhook handler
  - HMAC-SHA256 signature verification
  - Process `charge:confirmed` events only
  - Extract `userId` from charge metadata
  - Call internal `verifyAndActivate(txHash, chain, asset, userId)`
- [ ] `POST /api/payments/verify-tx` — manual / Solana verification
  - Input: `{ txHash, chain, asset, userId }`
  - EVM: fetch tx via `viem publicClient.getTransaction` + `getTransactionReceipt`
  - Solana: `connection.getParsedTransaction(txHash)`
  - Validate all 5 conditions (recipient, token, amount, status, uniqueness)
  - Call internal `verifyAndActivate` on success
- [ ] `lib/payments/verify-and-activate.ts` — atomic DB transaction: insert payment + upgrade user role
- [ ] `lib/payments/rpc-clients.ts` — RPC client setup for each chain (use public RPCs with fallback to Alchemy/Infura)
- [ ] Idempotency check: query `payments` table for existing `txHash` before processing

### Cron Job — Subscription Expiry

- [ ] `app/api/cron/subscription-check/route.ts` — protected route (check `Authorization: Bearer {CRON_SECRET}`)
- [ ] Query all Pro users, calculate `daysUntilExpiry`
- [ ] Batch downgrade expired users (role → `free`)
- [ ] Trigger notification stubs for expiring users at 30/14/7/1 day thresholds
- [ ] Configure Vercel Cron in `vercel.json`: `{ "crons": [{ "path": "/api/cron/subscription-check", "schedule": "0 9 * * *" }] }`
- [ ] Add `CRON_SECRET` to env vars

### Billing Page

- [ ] `app/(dashboard)/settings/billing/page.tsx`
- [ ] Subscription status card (active/expired with correct dates)
- [ ] Renewal CTA for expired users
- [ ] Transaction history table with block explorer links
- [ ] Connected wallets section (reads from `accounts` table)

### Referral System

- [ ] Drizzle migration: `referrals` table
- [ ] `app/ref/[code]/page.tsx` — sets referral cookie, redirects to `/register`
- [ ] Update registration flow: read referral cookie, set `users.referredBy`
- [ ] `lib/referrals/create-reward.ts` — inserts `referrals` row on Pro subscription confirmed
- [ ] Wire referral reward creation into `verifyAndActivate` (after user upgrade)
- [ ] `app/(dashboard)/referral/page.tsx` — referral link, stats, reward history table
- [ ] `GET /api/user/referrals` — returns referrer's referral stats and history

### Admin: Manual Referral Payout

- [ ] Admin dashboard table: pending referral payouts (referrerId, referredUser, amount, asset, createdAt)
- [ ] `PATCH /api/admin/referrals/:id/mark-paid` — admin confirms payout, sets `status = 'paid'`, `rewardTxHash`, `paidAt`

---

## Acceptance Criteria / Definition of Done

- [ ] Coinbase Commerce webhook processes `charge:confirmed` and upgrades the user to Pro
- [ ] Webhook rejects events with invalid signatures (return 400)
- [ ] `POST /api/payments/verify-tx` upgrades user to Pro on valid transaction
- [ ] `POST /api/payments/verify-tx` returns 409 if tx hash already used
- [ ] `POST /api/payments/verify-tx` returns 400 if amount is wrong, token is wrong, or recipient is wrong
- [ ] User role is `pro` and `subscriptionExpiry` is set to +365 days after verified payment
- [ ] Role upgrade and payment record are atomic (both fail or both succeed)
- [ ] Billing page shows Active/Expired status with correct expiry date
- [ ] Transaction history shows the payment with correct block explorer link
- [ ] Cron job runs and downgrades expired Pro users to `free`
- [ ] Expired Pro user loses access to Pro content on next page load
- [ ] Referral link sets a cookie and redirects to register
- [ ] New user registered via referral link has `referredBy` set correctly
- [ ] Pro upgrade creates a pending referral reward in the `referrals` table
- [ ] Referral page shows the correct referral link, stats, and reward history

---

## Dependencies

- Sprint 5 complete (wallet connection, payment submission, `txHash` available)
- Sprint 2 complete (user `role` and `subscriptionExpiry` fields exist)

---

## Hands-off to Sprint 7

The full payment loop is now complete. Starting Sprint 7, the platform has its monetisation foundation. All Tool suite features (Sprints 7–9) are Pro-gated — the role middleware from Sprint 2 and the Pro upgrade from this sprint ensure only paying users can access them.
