# Sprint 8 — Assets & Picks + Portfolio Tracker

**Phase:** 4 — Tools Suite
**Weeks:** 15–16
**Goal:** Pro members can browse all high-conviction token picks with analyst notes, and track their personal portfolio with live P&L calculated from CoinGecko prices.

---

## Spec References

| Document                             | Relevant Sections                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4C Tools & Market Insights — Assets & Picks, Portfolio Tracker descriptions                   |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4D Home Feed — Portfolio Summary Card (wired in this sprint)                                  |
| `docs/specs/UI_SPECIFICATION.md`     | §2A Home Feed — Portfolio Card (blue gradient, Total Balance, P&L)                             |
| `docs/specs/USER_JOURNEY.md`         | §3 Content Discovery & Tools Usage — "User selects Assets and Picks to check entry/exit zones" |

---

## Context & Fine Print

### Assets & Picks Fine Print

From `PROJECT_REQUIREMENTS.md §4C`:

> "Assets & Picks: Searchable database of 'Pro' picks with risk ratings and price targets."

**Data ownership:** Picks are created by analysts via Payload CMS admin (`/admin`). The `picks` Drizzle table is the source of truth — it mirrors or extends what's managed in Payload. Two approaches:

1. **Payload-native (recommended):** Create a `Picks` collection in Payload. Analysts manage picks via the admin UI. The frontend reads from Payload Local API. No separate Drizzle table needed for picks.
2. **Drizzle table with Payload sync:** Picks are in Drizzle, Payload manages them via a custom Payload endpoint.

**Decision: Use Payload collection.** Consistency with Posts, Media, and Categories. Analysts already know the Payload UI.

`Picks` Payload collection fields:

```
tokenName: text (required)
ticker: text (required, uppercase — e.g., ETH, SOL)
coingeckoId: text (required — the CoinGecko coin ID for live price lookup, e.g., 'ethereum', 'solana')
chain: select (Ethereum | Solana | Polygon | Arbitrum | Multi-chain)
entryZoneLow: number (USD)
entryZoneHigh: number (USD)
exitZoneLow: number (nullable)
exitZoneHigh: number (nullable)
stopLoss: number (nullable)
riskRating: select (low | medium | high | speculative)
status: select (active | closed | watchlist)
publishedAt: date
closedAt: date (nullable — set when status changes to 'closed')
analystNotes: richText (Lexical — full analyst write-up)
relatedPost: relation to Posts collection (nullable — link to associated deep dive)
entryPrice: number (nullable — the actual entry price for performance tracking)
exitPrice: number (nullable — set when closed, for performance calculation)
```

**Performance calculation:**

- Active picks: `currentPrice` (fetched live from CoinGecko using `coingeckoId`) vs `entryZoneLow/High` midpoint.
- Closed picks: `((exitPrice - entryPrice) / entryPrice) * 100` percentage gain.
- This is display-only — not financial advice.

**Pick card component:**

- Token logo: fetched from CoinGecko coin data (`image.small` field).
- Ticker badge: uppercase, grey background.
- Entry zone: `$X – $Y` range.
- Exit zone: `$X – $Y` range (shown only if set).
- Risk badge: colour-coded — Low (green), Medium (yellow), High (orange), Speculative (red).
- Performance indicator: for closed picks, show `+62%` (green) or `-15%` (red).
- For active picks: show current price vs entry zone with a subtle up/down arrow.
- "View Analysis" button → links to `relatedPost` article if set.

**Search + filter fine print:**

- Search: client-side filter on `tokenName` and `ticker`. Debounced 300ms.
- Filter by status: Active | Closed | Watchlist — default: All.
- Filter by risk: All | Low | Medium | High | Speculative.
- Filter by chain: All | Ethereum | Solana | Polygon | Arbitrum | Multi-chain.
- Sort: Newest first (default) | Highest gain (for closed picks) | Risk rating.
- All filters are URL query params (`?status=active&risk=high`) — shareable and bookmark-able.

**Pick detail page (`/tools/picks/[slug]`):**

- Full `analystNotes` rich text rendered.
- Entry/exit zone clearly displayed with a visual range indicator.
- TradingView Lightweight Chart showing the token's price history (OHLCV from CoinGecko).
- Current price live-updated every 60 seconds (SWR or React Query polling).
- Link to associated research report.
- "Add to portfolio" button → pre-fills the portfolio add form with this token.

### Portfolio Tracker Fine Print

From `PROJECT_REQUIREMENTS.md §4C`:

> "Portfolio Tracker: Personal (manual or wallet-connected asset tracking) and Platform (real-time performance of the official CryptoEdy portfolio)."

**Two distinct tabs:**

1. **My Portfolio** — user's personal holdings.
2. **Platform Portfolio** — the official CryptoEdy model portfolio (managed by admin, read-only for users).

**My Portfolio — manual entry fine print:**

`portfolios` table (Drizzle):

```ts
{ id, userId, name, isDefault: boolean, createdAt }
```

Each user can have multiple named portfolios (e.g., "DeFi Bag", "Long-term Holds"). One is marked `isDefault: true`.

`holdings` table (Drizzle):

```ts
{
  id, portfolioId,
  coingeckoId: varchar,   // for live price lookup
  tokenName: varchar,
  ticker: varchar,
  amount: decimal(20, 8), // support up to 8 decimal places (e.g., 0.00000001 BTC)
  purchasePrice: decimal(20, 8),
  purchaseDate: date,
  notes: text (nullable)
}
```

**P&L calculation (live, client-side):**

```ts
currentValue = amount * currentPrice (from CoinGecko)
costBasis = amount * purchasePrice
absolutePnL = currentValue - costBasis
percentagePnL = ((currentValue - costBasis) / costBasis) * 100
```

Total portfolio P&L = sum of all holdings' P&L.

**Wallet-connect mode fine print:**
From `PROJECT_REQUIREMENTS.md §4C`:

> "Personal: Manual or wallet-connected asset tracking."

Wallet-connect reads **on-chain balances** via wagmi `useBalance` and `useReadContracts`:

- EVM: Read ETH balance + ERC-20 balances for a predefined list of tokens.
- This is a **read-only snapshot** — it shows current on-chain balances but does NOT track historical purchase prices.
- Wallet-connected holdings show "N/A" for cost basis / P&L unless the user manually enters purchase prices.
- The wallet-connected view is a convenience feature, not a full portfolio tracker. Make this clear in the UI: "Connect wallet to see current balances. Add purchase prices to track P&L."

**Platform Portfolio tab fine print:**

- A special `platformPortfolio` Payload collection (admin-managed).
- Contains the official CryptoEdy model portfolio — the picks the platform itself would hold.
- Users can see it but cannot edit it.
- Ties directly into the Picks collection — platform portfolio holdings are a subset of Picks.
- Performance calculated the same way as personal holdings.

### Home Feed Portfolio Card Wire-up

From Sprint 4, the Portfolio Summary Card on the home feed showed static placeholder data. In this sprint, wire it up:

- Fetch the user's default portfolio total value and P&L.
- If no portfolio exists: show "Set up your portfolio →" CTA.
- If portfolio exists: show Total Balance (USD) and Total P&L (% + absolute).
- The card is a quick summary — link to the full Portfolio Tracker page.

---

## Task Checklist

### Payload: Picks Collection

- [ ] Create `collections/Picks.ts` in Payload with all fields above
- [ ] Access control: create/update/delete → analyst + admin; read → pro + analyst + admin (Pro-gated)
- [ ] Add to `payload.config.ts`
- [ ] Seed 10 sample picks (mix of active, closed, watchlist, different risk ratings, different chains)
- [ ] Verify `relatedPost` relation works in the admin UI

### Assets & Picks Page

- [ ] `app/(dashboard)/tools/picks/page.tsx` — SSR, fetches all picks from Payload Local API
- [ ] `components/tools/picks/PicksFilter.tsx` — search + filter bar (status, risk, chain)
- [ ] `components/tools/picks/PicksGrid.tsx` — responsive grid of pick cards
- [ ] `components/tools/picks/PickCard.tsx` — full card as described above
- [ ] `components/tools/picks/RiskBadge.tsx` — colour-coded risk rating badge
- [ ] `app/(dashboard)/tools/picks/[slug]/page.tsx` — pick detail page
- [ ] `components/tools/picks/PickDetail.tsx` — full analyst notes, entry/exit ranges, live price chart
- [ ] Live price refresh: SWR (`swr`) polling CoinGecko every 60s for active picks
- [ ] "Add to portfolio" button on pick detail → opens portfolio add modal

### Portfolio Tracker

- [ ] Drizzle migration: `portfolios` + `holdings` tables
- [ ] `app/(dashboard)/tools/portfolio/page.tsx` — two tabs: My Portfolio, Platform Portfolio
- [ ] `components/tools/portfolio/PortfolioSummary.tsx` — total value, total P&L (absolute + %)
- [ ] `components/tools/portfolio/HoldingsTable.tsx` — sortable table: token, amount, avg cost, current price, value, P&L
- [ ] `components/tools/portfolio/AddHoldingModal.tsx` — form: token search autocomplete (CoinGecko `/search`), amount, purchase price, date
- [ ] `components/tools/portfolio/EditHoldingModal.tsx` — same form, pre-filled
- [ ] `components/tools/portfolio/AllocationChart.tsx` — pie chart (Recharts `PieChart`): holdings by % of portfolio
- [ ] `components/tools/portfolio/WalletSnapshotPanel.tsx` — wallet connect, reads on-chain balances, shows "N/A" for P&L
- [ ] `components/tools/portfolio/PlatformPortfolio.tsx` — read-only view of official CryptoEdy portfolio
- [ ] `GET /api/portfolio` — returns user's portfolios + holdings with live prices
- [ ] `POST /api/portfolio/holdings` — add holding
- [ ] `PATCH /api/portfolio/holdings/:id` — update holding
- [ ] `DELETE /api/portfolio/holdings/:id` — remove holding
- [ ] `GET /api/portfolio/live-prices?ids=bitcoin,ethereum` — proxies CoinGecko, returns current prices for a list of coin IDs

### Home Feed Portfolio Card Wire-up

- [ ] Update `components/feed/PortfolioCard.tsx` to fetch from `GET /api/portfolio` (client-side, SWR)
- [ ] Show real total balance + P&L
- [ ] Show "Set up your portfolio" CTA if no default portfolio exists

### Payload: Platform Portfolio Collection

- [ ] Create `collections/PlatformPortfolio.ts` — admin-only create/update/delete, Pro read
- [ ] Seed with 5 platform picks mirroring real Picks entries

---

## Acceptance Criteria / Definition of Done

- [ ] `/tools/picks` loads all seeded picks for Pro users
- [ ] Search filters picks by ticker/name in real time (debounced)
- [ ] Status/risk/chain filters work and update the URL query params
- [ ] Pick cards show risk badge with correct colour
- [ ] Closed picks show percentage gain/loss in green/red
- [ ] Active picks show current price vs entry zone
- [ ] Pick detail page shows full analyst notes and live price chart
- [ ] "Add to portfolio" button pre-fills the portfolio form with the token
- [ ] Portfolio tracker loads the user's holdings with correct P&L calculations
- [ ] Adding a holding persists to DB and recalculates total portfolio value
- [ ] Editing and deleting a holding works correctly
- [ ] Allocation pie chart reflects the holdings correctly
- [ ] Wallet-connect mode shows on-chain balances (test with a connected wallet)
- [ ] Platform Portfolio tab shows official picks as read-only
- [ ] Home Feed Portfolio Card now shows real data (not static placeholders)
- [ ] Live prices update without full page reload

---

## Dependencies

- Sprint 7 complete (`coingecko.ts` API wrapper exists — reused here)
- Sprint 5 complete (RainbowKit wallet adapter exists — reused for wallet-connect portfolio)
- Sprint 3 complete (Payload admin exists — `Picks` collection added here)

---

## Hands-off to Sprint 9

Sprint 9 builds the Airdrop Hub. It is independent of Sprints 7–8 and can be built in parallel by a separate engineer if available. The only shared dependency is the Payload admin setup (Sprint 3) and the Pro gate middleware (Sprint 2).
