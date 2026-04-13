# CryptoEdy Platform — Implementation Plan

**7 Phases · 14 Sprints · ~28 Weeks**

Each sprint is 2 weeks with shippable deliverables. Full task breakdowns, spec cross-references, fine prints, and acceptance criteria live in the individual sprint files linked below.

---

## Spec Documents

All sprint files are cross-referenced against:

- [`docs/specs/PROJECT_REQUIREMENTS.md`](../specs/PROJECT_REQUIREMENTS.md) — full technical spec, user roles, UI components
- [`docs/specs/UI_SPECIFICATION.md`](../specs/UI_SPECIFICATION.md) — design system, page inventory, interactions
- [`docs/specs/USER_JOURNEY.md`](../specs/USER_JOURNEY.md) — 6 core user flows

---

## Phase 1 — Foundation & Infrastructure

> Goal: Running Next.js app with database, CMS, and auth in place.

| Sprint                           | Title                        | Weeks | Key Deliverable                                                                    |
| -------------------------------- | ---------------------------- | ----- | ---------------------------------------------------------------------------------- |
| [Sprint 1](sprints/sprint-01.md) | Project Scaffolding          | 1–2   | Clean deployable shell — Next.js, Tailwind, Shadcn, design tokens, CI/CD           |
| [Sprint 2](sprints/sprint-02.md) | Data Layer & Auth Foundation | 3–4   | PostgreSQL + Drizzle, Payload CMS admin live, email/password auth, role middleware |

---

## Phase 2 — Content System & Core UI

> Goal: Editors can publish. Users can browse and read articles with gating.

| Sprint                           | Title                           | Weeks | Key Deliverable                                                  |
| -------------------------------- | ------------------------------- | ----- | ---------------------------------------------------------------- |
| [Sprint 3](sprints/sprint-03.md) | CMS Collections & Content Model | 5–6   | Payload collections, editorial workflow, seed data               |
| [Sprint 4](sprints/sprint-04.md) | Home Feed & Article Page        | 7–8   | Feed, article page, content gating (blur + paywall), SSR for SEO |

---

## Phase 3 — Web3 Payments & Subscriptions

> Goal: Full crypto payment loop — wallet → $100 USDC/USDT → Pro upgrade.

| Sprint                           | Title                                 | Weeks | Key Deliverable                                                       |
| -------------------------------- | ------------------------------------- | ----- | --------------------------------------------------------------------- |
| [Sprint 5](sprints/sprint-05.md) | Wallet Connection & Payment Flow      | 9–10  | Plans page, chain/asset selector, wallet connect, payment initiation  |
| [Sprint 6](sprints/sprint-06.md) | On-Chain Verification & Subscriptions | 11–12 | Webhook verification, Pro role upgrade, billing page, referral system |

---

## Phase 4 — Tools Suite

> Goal: Pro members have all four research and tracking tools with live market data.

| Sprint                           | Title                              | Weeks | Key Deliverable                                                        |
| -------------------------------- | ---------------------------------- | ----- | ---------------------------------------------------------------------- |
| [Sprint 7](sprints/sprint-07.md) | Market Direction Dashboard         | 13–14 | CoinGecko/DefiLlama APIs, TradingView charts, macro metrics            |
| [Sprint 8](sprints/sprint-08.md) | Assets & Picks + Portfolio Tracker | 15–16 | Picks database, portfolio P&L tracking, home feed portfolio card wired |
| [Sprint 9](sprints/sprint-09.md) | Airdrop Hub                        | 17–18 | Airdrop listings, step-by-step task tracking, per-user progress        |

---

## Phase 5 — Notifications & Community

> Goal: Users stay engaged through real-time alerts and community interaction.

| Sprint                            | Title               | Weeks | Key Deliverable                                                            |
| --------------------------------- | ------------------- | ----- | -------------------------------------------------------------------------- |
| [Sprint 10](sprints/sprint-10.md) | Notification Engine | 19–20 | Bell dropdown, notification DB, preference settings, all event stubs wired |
| [Sprint 11](sprints/sprint-11.md) | Community Features  | 21–22 | Forum threads, replies, reactions, direct messaging                        |

---

## Phase 6 — Settings, Admin & Polish

> Goal: All settings complete, admin has full visibility, platform is production-quality.

| Sprint                            | Title                            | Weeks | Key Deliverable                                                                   |
| --------------------------------- | -------------------------------- | ----- | --------------------------------------------------------------------------------- |
| [Sprint 12](sprints/sprint-12.md) | Settings & Admin Dashboard       | 23–24 | Profile, Appearance settings, admin user/subscription/financial management        |
| [Sprint 13](sprints/sprint-13.md) | Performance, SEO & Mobile Polish | 25–26 | Lighthouse ≥90, ISR, bundle splits, mobile responsive, accessibility, legal pages |

---

## Phase 7 — Launch

> Goal: Production-ready, hardened, monitored, and shipped.

| Sprint                            | Title               | Weeks | Key Deliverable                                                              |
| --------------------------------- | ------------------- | ----- | ---------------------------------------------------------------------------- |
| [Sprint 14](sprints/sprint-14.md) | Hardening & Go-Live | 27–28 | E2E QA on all 6 user journeys, security audit, monitoring, production deploy |

---

## Critical Path

```
Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → Sprint 6
(Scaffold)  (Auth/DB)  (CMS)      (Feed/Gate) (Payment)  (Verify/Pro)
```

The subscription loop (Sprints 1–6) must be sequential — each sprint depends on the previous. Once Sprint 6 is complete, **Phases 4, 5, and 6 can be built in parallel** by separate engineers.

Parallel tracks post-Sprint 6:

- **Track A:** Sprints 7, 8, 9 (Tools Suite)
- **Track B:** Sprints 10, 11 (Notifications + Community)
- **Track C:** Sprint 12 (Settings + Admin) — can start alongside Track A/B

All tracks converge at **Sprint 13** (Polish) and **Sprint 14** (Launch).

---

## Post-Launch Backlog

Deferred from V1 scope (see [Sprint 14](sprints/sprint-14.md) for full list):

- Automated referral USDC/USDT payouts (currently manual)
- Real-time messaging (WebSockets — currently polling)
- Full-text search backend (Algolia or PostgreSQL FTS)
- Weekly email newsletter digest
- Native mobile app / PWA
- Multi-language support
