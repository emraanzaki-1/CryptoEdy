# Sprint 7 — Market Direction Dashboard

**Phase:** 4 — Tools Suite
**Weeks:** 13–14
**Goal:** Pro members can access a live macro market dashboard with interactive charts, global DeFi metrics, and trend indicators. All market data is sourced from CoinGecko and DefiLlama APIs with proper caching.

---

## Spec References

| Document                             | Relevant Sections                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §4C Tools & Market Insights — Market Direction description                                     |
| `docs/specs/PROJECT_REQUIREMENTS.md` | §2 Technical Architecture — CoinGecko/DefiLlama APIs, TradingView Lightweight Charts           |
| `docs/specs/UI_SPECIFICATION.md`     | §2A Home Feed Sidebar — Tools hover submenu                                                    |
| `docs/specs/USER_JOURNEY.md`         | §3 Content Discovery & Tools Usage — "User selects Market Direction to check entry/exit zones" |

---

## Context & Fine Print

### Pro Gate Fine Print

All four tools in the suite are **Pro-only**. The middleware from Sprint 2 handles the redirect. Fine print for the Tools section:

- `free` users visiting `/tools/*` → redirect to `/upgrade` with a query param: `?source=tools&tool=market-direction`.
- The `/upgrade` page reads the `source` and `tool` query params to show a contextual upgrade message: "Unlock Market Direction and all Pro tools with a CryptoEdy Pro membership."
- Guest users (unauthenticated) → redirect to `/login` first, then back to the tool after login.

### CoinGecko API Fine Print

- CoinGecko has a **free tier** (50 calls/min) and a **Pro tier** ($129+/month, higher limits).
- In development: use the free tier. In production: budget for Pro API.
- All CoinGecko calls must go through the Next.js API route layer — never expose the API key to the client.
- Response caching: use `next: { revalidate: 300 }` (5 minutes) for market data. Price data is volatile but 5 minutes is acceptable for a dashboard (not a trading terminal).
- Rate limit handling: implement exponential backoff with jitter on 429 responses. Max 3 retries.
- If CoinGecko is down or rate-limited: show cached data with a "Data may be outdated" banner. Never show an error page — degrade gracefully.

**Endpoints used in this sprint:**

```
GET /global                              → total market cap, volume, BTC dominance, market cap change 24h
GET /simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true  → BTC current price
GET /coins/bitcoin/market_chart?vs_currency=usd&days=30   → OHLCV for chart
```

### DefiLlama API Fine Print

- DefiLlama is **free with no API key required**. No rate limit headers documented — be conservative (max 20 req/min).
- Base URL: `https://api.llama.fi`
- Cache aggressively: TVL data changes slowly. `revalidate: 600` (10 minutes) is appropriate.

**Endpoints used in this sprint:**

```
GET /v2/globalCharts                    → global DeFi TVL over time
GET /v2/chains                          → per-chain TVL breakdown
GET /protocols                          → top protocols by TVL
```

### TradingView Lightweight Charts Fine Print

- Use the open-source `lightweight-charts` library (MIT license, maintained by TradingView).
- **Not** the full TradingView widget (which requires a TradingView account and has licensing restrictions).
- `lightweight-charts` is a client-side library — all chart components must be `'use client'`.
- Wrap chart components in `dynamic(() => import(...), { ssr: false })` to prevent SSR errors.
- Chart types needed:
  - **Area chart** (market cap over time): `createChart` + `addAreaSeries`
  - **Candlestick chart** (BTC price): `createChart` + `addCandlestickSeries`
  - **Bar chart** (chain TVL): use a custom Shadcn/Recharts bar chart instead — Lightweight Charts is for OHLCV, not categorical bars.
- Charts must be responsive: call `chart.applyOptions({ width: container.clientWidth })` on resize. Use a `ResizeObserver`.
- Dark/Light theme: pass `layout: { background: { color: '#FFFFFF' } }` in light mode and `#0a0a0a` in dark mode. Subscribe to theme changes.

### Fear & Greed Index Fine Print

- Source: `https://api.alternative.me/fng/` — free, no key required.
- Returns: `{ data: [{ value: "65", value_classification: "Greed", timestamp: "..." }] }`
- Classifications: Extreme Fear (0–24), Fear (25–49), Neutral (50), Greed (51–74), Extreme Greed (75–100).
- Display as a gauge/arc visual with the numeric value and classification label.
- Cache: `revalidate: 3600` (1 hour — updates daily).

### Trend Indicators Fine Print

Simple classification based on data thresholds:

| Indicator                  | Bull  | Neutral    | Bear  |
| -------------------------- | ----- | ---------- | ----- |
| BTC 24h change             | > +3% | -3% to +3% | < -3% |
| Total market cap 7d change | > +5% | -5% to +5% | < -5% |
| Fear & Greed               | > 60  | 40–60      | < 40  |

Display as a simple pill badge: green "Bullish", grey "Neutral", red "Bearish". Never use these as financial advice — add a micro-disclaimer: "For informational purposes only."

### Loading & Error States Fine Print

From `PROJECT_REQUIREMENTS.md §6`:

> "Page load speeds under 2 seconds."

Strategy:

- Use Next.js `Suspense` boundaries around each data section. Show skeleton loaders while data fetches.
- Fetch different data sections in parallel using `Promise.all` in Server Components.
- Charts (client components) show a skeleton until the JS bundle loads and data is available.
- Error boundaries: each section has its own error boundary. If CoinGecko fails, the chart section shows "Unable to load chart data" — but the rest of the page still renders from DefiLlama data.

---

## Task Checklist

### API Wrappers

- [ ] `lib/api/coingecko.ts`:
  - `getGlobalMarketData()` → `{ totalMarketCap, totalVolume, btcDominance, marketCapChange24h }`
  - `getBTCPrice()` → `{ price, change24h }`
  - `getMarketCapHistory(days: 30 | 90 | 365)` → array of `{ time, value }`
  - `getBTCOHLCV(days: 30 | 90 | 365)` → array of `{ time, open, high, low, close }`
  - Rate limit handling with retry + backoff
  - All calls use `fetch` with `next: { revalidate: 300 }`
- [ ] `lib/api/defillama.ts`:
  - `getGlobalTVL()` → `{ tvl, tvlChange24h }`
  - `getTVLHistory()` → array of `{ date, tvl }`
  - `getChainTVL()` → array of `{ name, tvl }` sorted desc
  - All calls use `fetch` with `next: { revalidate: 600 }`
- [ ] `lib/api/fear-greed.ts`:
  - `getFearGreedIndex()` → `{ value, classification }`
  - Uses `next: { revalidate: 3600 }`
- [ ] `lib/api/constants/token-addresses.ts` — all USDC/USDT contract addresses per chain (needed from Sprint 5, consolidate here)

### Route Protection

- [ ] Update `/upgrade` page to read `?source` and `?tool` query params and show contextual message
- [ ] Confirm middleware correctly redirects `/tools/*` for non-Pro users

### Market Direction Page

- [ ] `app/(dashboard)/tools/market-direction/page.tsx` — Server Component, fetches global data in parallel
- [ ] `components/tools/market-direction/MetricsBar.tsx` — 4 metric cards: Market Cap, BTC Dominance, DeFi TVL, Fear & Greed
- [ ] `components/tools/market-direction/MarketCapChart.tsx` — client component, area chart, 30/90/365 day toggle
- [ ] `components/tools/market-direction/BTCPriceChart.tsx` — client component, candlestick chart, 30/90/365 day toggle
- [ ] `components/tools/market-direction/ChainTVLChart.tsx` — chain TVL bar chart (Recharts `BarChart`)
- [ ] `components/tools/market-direction/TrendIndicators.tsx` — bull/bear/neutral classification pills
- [ ] `components/tools/market-direction/FearGreedGauge.tsx` — arc gauge with value + classification
- [ ] Chart skeleton loaders (animate-pulse grey rectangles matching chart dimensions)
- [ ] Error boundary component per section
- [ ] `dynamic(() => import('.../MarketCapChart'), { ssr: false })` wrapping for chart components

### Proxy API Routes (to hide API keys from client)

- [ ] `GET /api/market/global` → proxies CoinGecko `/global`
- [ ] `GET /api/market/btc-price` → proxies CoinGecko BTC price
- [ ] `GET /api/market/history?days=30` → proxies CoinGecko market cap history
- [ ] `GET /api/market/btc-ohlcv?days=30` → proxies CoinGecko BTC OHLCV
- [ ] `GET /api/market/chain-tvl` → proxies DefiLlama chains
- [ ] `GET /api/market/fear-greed` → proxies alternative.me FGI
- [ ] All proxy routes: auth-protected (must be logged in), respond with cached data

---

## Acceptance Criteria / Definition of Done

- [ ] `/tools/market-direction` redirects non-Pro users to `/upgrade` with correct `?tool=market-direction` param
- [ ] Market Direction page loads for Pro users within 2 seconds
- [ ] All 4 metric cards show real data from CoinGecko/DefiLlama
- [ ] Market cap area chart renders with correct data and 30/90/365 day toggle works
- [ ] BTC candlestick chart renders with correct OHLCV data
- [ ] Chain TVL bar chart renders top 10 chains by TVL
- [ ] Fear & Greed gauge shows current value with correct classification colour
- [ ] Trend indicators show correct bull/bear/neutral classification based on real data
- [ ] Charts are responsive — resize correctly when browser window changes
- [ ] Charts adapt to light/dark theme correctly
- [ ] If CoinGecko returns 429 or 5xx: section shows error state, other sections still render
- [ ] Loading skeleton shows while data is fetching
- [ ] API keys are NOT visible in browser network requests (all calls go through `/api/market/*` proxy routes)

---

## Dependencies

- Sprint 6 complete (Pro role upgrade works — needed to test gate)
- Sprint 1 complete (Tailwind, Shadcn)

---

## Hands-off to Sprint 8

Sprint 8 builds Assets & Picks and Portfolio Tracker. The API wrappers (`coingecko.ts`, `defillama.ts`) created here are reused in Sprint 8 for live token prices in the Portfolio Tracker. Do not refactor them during Sprint 8 — extend only.
