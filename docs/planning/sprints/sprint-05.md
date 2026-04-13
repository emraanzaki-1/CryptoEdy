# Sprint 5 — Wallet Connection & Payment Flow

**Phase:** 3 — Web3 Payments & Subscriptions
**Weeks:** 9–10
**Goal:** Users can connect a crypto wallet, navigate the Plans page, select their chain and stablecoin, and initiate a $100 payment. The UI shows a pending state while the transaction is being confirmed. On-chain verification is Sprint 6.

---

## Spec References

| Document                             | Relevant Sections                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §2 Technical Architecture — payment stack (Coinbase Commerce, Solana Pay, stablecoins only) |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4G Plans & Subscription Page — pricing card, checklist, urgency banner                     |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §5 Web3 Payment & Subscription Logic — tiers, pricing, settlement                           |
| `docs/specs/UI_SPECIFICATION.md`     | §2D Plans & Subscription Page — annually toggle, pricing card, urgency banner               |
| `docs/specs/USER_JOURNEY.md`         | §2 Go Pro Subscription — full 7-step payment flow                                           |

---

## Context & Fine Print

### Payment Philosophy Fine Print

From `PROJECT_REQUIREMENTS.md §5` and §2:

> "Payments: Web3 Native (Stablecoins Only). Supported Assets: USDC and USDT exclusively. No fiat or Stripe integration."

This is a hard constraint — not a preference. There is no monthly billing option, no credit card, no PayPal. The entire payment system is crypto-native. Fine prints:

- **Annual only:** `$100 / Year`. No monthly tier. No trial period.
- **Stablecoins only:** USDC or USDT. No ETH, BTC, SOL, or other volatile assets.
- **Multi-chain:** Ethereum mainnet, Polygon, Arbitrum, Solana. The user selects their preferred chain.
- **Why stablecoins only?** Eliminates price volatility risk for both the platform and users. $100 USDC = $100 USD always.

### Plans Page Fine Print

From `PROJECT_REQUIREMENTS.md §4G` and `UI_SPECIFICATION.md §2D`:

**Pricing Card:**

- Header: "Annually" toggle — this is fixed/non-interactive. There is no monthly option. The toggle is shown for visual consistency with pricing pages but it only has one state.
- Price display: Large "**$100**" + "/ Year". Sub-text: "Billed annually".
- Optional "Save X%" tag — calculate against a hypothetical monthly rate for marketing purposes only.
- CTA: Large blue "Upgrade" button.
- Trust signal: "For your security, all orders are processed on a secured server" with a lock icon.
- Payment method icons: USDC and USDT token logos (official brand assets, not generic crypto icons).

**"What's included in Pro" checklist:**
From `PROJECT_REQUIREMENTS.md §4G`:

1. 3X Value Guarantee — refund if cumulative upside target not met
2. 24/7 access to research team/experts
3. All high-conviction token picks
4. On-demand Technical Analysis
5. Weekly interactive livestreams + Q&A
6. Daily macro, mechanics, and on-chain insights
7. Curated Airdrop Hub access

Each checklist item uses a green checkmark icon (colour: `#00FF41` from the design system).

**Urgency Banner:**

> "Promotional Elements: Countdown Banner — sticky footer banner (Orange/Yellow) highlighting a limited-time offer ('Save 23% & Get a Free 1-1 Call') with a live countdown timer."

- Sticky at the bottom of the viewport.
- Countdown timer format: `HH:MM:SS`. Target date: configurable via env var or admin setting.
- Dismiss button (X) — dismissed state persisted to `localStorage`. Reappears after 24 hours.
- Colour: `#FFD700` (Gold accent from design system) background, dark text.

### Payment Flow Steps Fine Print

From `USER_JOURNEY.md §2`:

**Step 1 — Chain Selection:**

- Show 4 chain options as selectable cards: Ethereum, Solana, Polygon, Arbitrum.
- Display chain logo + name + USDC/USDT availability note.
- Default: no selection (force user to actively choose).
- Fine print: different chains have different gas costs. Show an indicative note: "Polygon & Arbitrum: lowest fees". Do not show exact gas estimates (too volatile).

**Step 2 — Asset Selection:**

- USDC or USDT radio buttons.
- Show the token logo (official Circle USDC, Tether USDT).
- Note which assets are available on the selected chain:
  - Ethereum: USDC ✓, USDT ✓
  - Polygon: USDC ✓, USDT ✓
  - Arbitrum: USDC ✓, USDT ✓
  - Solana: USDC ✓, USDT ✓
- All chains support both — no conditional disabling needed.

**Step 3 — Wallet Connection:**

- If wallet already connected → skip directly to Step 4.
- Show "Connect Wallet" button.
- EVM chains (Ethereum, Polygon, Arbitrum): triggers RainbowKit modal. Supported wallets: MetaMask, Coinbase Wallet, WalletConnect.
- Solana: triggers Solana wallet adapter modal. Supported: Phantom, Solflare, Backpack.
- On connect: show connected wallet address (truncated: `0x1234...5678`) with a green "Connected" indicator.
- Fine print: wallet connection does NOT sign anything. It only reads the wallet address. The actual transaction signature happens in Step 4.

**Step 4 — Payment Confirmation Screen:**

- Display: "Send exactly **100 USDC** to:" + destination address (with copy button).
- Show a QR code of the payment address (Solana Pay QR standard, or simple address QR for EVM).
- Warning: "Send only USDC/USDT. Sending any other token will result in a permanent loss of funds."
- "Confirm in wallet" button:
  - EVM: Calls the ERC-20 `transfer()` function on the USDC/USDT contract. Uses wagmi `useWriteContract`.
  - Solana: Initiates an SPL token transfer. Uses Solana Pay transaction request or `@solana/web3.js`.
- The "Confirm in wallet" button triggers the wallet's native confirmation dialog (MetaMask popup, Phantom approval screen, etc.).

**Step 5 — Pending State:**

- Show a spinner with "Waiting for confirmation..." text.
- Display the transaction hash as soon as it's submitted (before confirmation).
- Tx hash is a clickable link to the block explorer:
  - Ethereum: `etherscan.io/tx/{hash}`
  - Polygon: `polygonscan.com/tx/{hash}`
  - Arbitrum: `arbiscan.io/tx/{hash}`
  - Solana: `solscan.io/tx/{hash}`
- Do NOT let the user navigate away. Show a browser `beforeunload` warning.
- Poll the transaction status every 5 seconds.
- EVM: Use `wagmi useWaitForTransactionReceipt`.
- Solana: Poll via `connection.getSignatureStatus`.

**Step 6 — Success State (Bridge to Sprint 6):**

- In this sprint: show "Transaction submitted! Verifying on-chain..." with the tx hash.
- Sprint 6 handles the actual verification and role upgrade.
- Store the `txHash` in `localStorage` as a fallback — if the user closes the tab, they can return and resume verification.
- Show "Save your transaction hash" prompt with a copy button as a safety net.

### Wallet Connection Architecture Fine Print

- `WalletProvider` wraps only the `/(dashboard)` route group — not the entire app. There's no reason to load Web3 libraries on the marketing homepage or auth pages.
- Separate providers for EVM (`WagmiProvider`) and Solana (`WalletAdapterProvider`). Both are client components.
- On wallet connect, call `POST /api/user/link-wallet` to associate the wallet address with the current user account in the `accounts` table. This enables showing the wallet address in Billing settings (Sprint 12).

### Coinbase Commerce Fine Print

- Coinbase Commerce generates a "charge" — a payment request with a unique address.
- `POST /api/payments/create-charge` creates a charge via the Coinbase Commerce API.
- Charge response includes: `id`, `hosted_url`, `addresses` (per-chain), `pricing` ($100 USD).
- The `addresses` object contains a unique deposit address per chain. Show the user the correct address for their selected chain.
- Charges expire after 60 minutes — if the user doesn't pay within 60 minutes, they must start over.
- Show the expiry countdown on the payment confirmation screen.

### Solana Pay Fine Print

- Solana Pay uses a URL scheme: `solana:{recipient}?amount={amount}&spl-token={mint}&label={label}&memo={memo}`.
- `recipient`: platform's USDC/USDT receiving address on Solana.
- `spl-token`: USDC mint address on Solana mainnet = `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`.
- `amount`: `100` (in token units — USDC has 6 decimals, but Solana Pay handles this).
- `memo`: encode `userId` in the memo field — this is how the backend identifies which user made the payment on verification.
- Generate the QR code from this URL using the `@solana/pay` library.

---

## Task Checklist

### Web3 Provider Setup

- [ ] Install `wagmi`, `viem`, `@rainbow-me/rainbowkit`, `@tanstack/react-query`
- [ ] Install `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets`, `@solana/web3.js`, `@solana/pay`
- [ ] Create `components/providers/Web3Providers.tsx` — wraps EVM + Solana providers (client component)
- [ ] Add `Web3Providers` to `app/(dashboard)/layout.tsx` (inside session check, client boundary)
- [ ] Configure wagmi with chains: mainnet, polygon, arbitrum
- [ ] Configure RainbowKit with app name: "CryptoEdy"
- [ ] Configure Solana wallet adapter: Phantom, Solflare, Backpack

### Wallet Connection

- [ ] `components/web3/ConnectWalletButton.tsx` — triggers RainbowKit (EVM) or Solana adapter modal based on selected chain
- [ ] `components/web3/WalletStatus.tsx` — shows connected address (truncated) + disconnect option
- [ ] `POST /api/user/link-wallet` — links wallet address to user's `accounts` table entry
- [ ] Handle wallet already linked to another account (show error: "This wallet is already linked to another account")

### Plans Page

- [ ] `app/(dashboard)/settings/plans/page.tsx` — full plans page
- [ ] `components/plans/PricingCard.tsx` — annually badge, $100 price, Upgrade CTA, trust signal, USDC/USDT icons
- [ ] `components/plans/ProFeatureChecklist.tsx` — 7 Pro features with green checkmarks
- [ ] `components/plans/UrgencyBanner.tsx` — sticky footer, countdown timer, dismiss (localStorage), gold background

### Payment Flow

- [ ] `components/payment/PaymentModal.tsx` — multi-step modal (or dedicated page `/upgrade`)
- [ ] `components/payment/ChainSelector.tsx` — 4 chain cards (Ethereum, Polygon, Arbitrum, Solana)
- [ ] `components/payment/AssetSelector.tsx` — USDC / USDT radio buttons
- [ ] `components/payment/PaymentConfirmation.tsx` — destination address, QR code, "Confirm in wallet" button, expiry timer
- [ ] `components/payment/PendingState.tsx` — spinner, tx hash link, explorer link, beforeunload warning
- [ ] `components/payment/SuccessState.tsx` — "Verifying on-chain..." with tx hash display + copy button

### API Routes

- [ ] `POST /api/payments/create-charge` — Coinbase Commerce charge creation
  - Input: `{ chain: 'ethereum' | 'polygon' | 'arbitrum', asset: 'USDC' | 'USDT', userId: string }`
  - Output: `{ chargeId, address, expiresAt }`
- [ ] `POST /api/payments/solana/create-request` — Solana Pay transaction request
  - Input: `{ asset: 'USDC' | 'USDT', userId: string }`
  - Output: `{ paymentUrl, qrData, recipient }`
- [ ] Install `@coinbase/coinbase-commerce-node` or use raw fetch against Coinbase Commerce API
- [ ] Install `qrcode.react` for QR code generation

### Transaction Submission (EVM)

- [ ] `lib/web3/evm-transfer.ts` — wagmi `useWriteContract` wrapper for ERC-20 `transfer()` call
- [ ] Token contract addresses per chain:
  - Ethereum USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
  - Ethereum USDT: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
  - Polygon USDC: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
  - Arbitrum USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
  - (Full list in `lib/web3/constants/token-addresses.ts`)
- [ ] `lib/web3/solana-transfer.ts` — SPL token transfer using `@solana/pay`

### Pending State & Polling

- [ ] `hooks/useTransactionStatus.ts` — polls tx status every 5s
  - EVM: `wagmi useWaitForTransactionReceipt`
  - Solana: `connection.getSignatureStatus` polling
- [ ] On confirmed: call `POST /api/payments/verify-tx` (built in Sprint 6), show SuccessState
- [ ] Store `{ txHash, chain, asset }` in `localStorage` key `pending-payment` as fallback
- [ ] On page load: if `pending-payment` exists in localStorage, show resume banner

---

## Acceptance Criteria / Definition of Done

- [ ] Plans page loads with pricing card, feature checklist, and urgency banner
- [ ] Urgency countdown timer counts down correctly
- [ ] Dismiss hides the banner; it reappears after 24 hours (test via manipulating localStorage timestamp)
- [ ] "Upgrade" CTA opens the payment modal / navigates to payment flow
- [ ] Chain selector shows all 4 chains; selecting one enables the Next button
- [ ] Asset selector shows USDC / USDT; selecting one enables the Next button
- [ ] "Connect Wallet" triggers RainbowKit modal on EVM chains
- [ ] "Connect Wallet" triggers Solana adapter modal on Solana
- [ ] Connected wallet address displays truncated (e.g., `0x1234...5678`)
- [ ] Payment confirmation shows the correct deposit address for the selected chain
- [ ] QR code renders correctly and encodes the payment address
- [ ] "Confirm in wallet" triggers the native wallet confirmation dialog
- [ ] Pending state shows spinner + tx hash with correct explorer link
- [ ] `beforeunload` warning appears if user tries to navigate away during pending state
- [ ] `pending-payment` is saved to localStorage on transaction submit
- [ ] `POST /api/payments/create-charge` returns a valid charge with an address
- [ ] `POST /api/payments/solana/create-request` returns a valid Solana Pay URL

---

## Dependencies

- Sprint 2 complete (auth — user must be logged in to pay)
- Sprint 4 complete (conversion wall "Upgrade" CTA now links to the real Plans page)

---

## Hands-off to Sprint 6

Sprint 6 handles the server-side on-chain verification, the webhook listeners, the `subscriptionExpiry` update, and the Pro role upgrade. The `txHash`, `chain`, and `userId` from this sprint are the inputs to Sprint 6's verification API.
