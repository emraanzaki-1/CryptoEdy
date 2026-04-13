# Project Requirements Document: CryptoEdy Research Platform

## 1. Project Overview

**Objective:** Build a comprehensive, premium cryptocurrency research and analysis platform called CryptoEdy. The platform will deliver high-conviction token picks, macro-economic analysis, on-chain data insights, and educational content through a crypto-native subscription model.

---

## 2. Technical Architecture

- **Framework:** Next.js (TypeScript) - App Router for performance and SEO.
- **CMS:** **Payload CMS (3.0+)** - Integrated directly into the Next.js application for a unified codebase and high-performance content fetching via its Local API.
- **Database:** PostgreSQL with **Drizzle ORM** for type-safe and efficient data handling.
- **Authentication:**
  - **Payload Native Auth:** For traditional Email/Password login.
  - **NextAuth.js:** Integrated for Web3 Wallet authentication (MetaMask, Phantom, etc.).
- **Payments:** **Web3 Native (Stablecoins Only)**.
  - Supported Assets: **USDC** and **USDT** exclusively.
  - Multi-Chain Support: Ethereum, Solana, Polygon, Arbitrum, etc.
  - Gateways: Coinbase Commerce, Solana Pay, or direct on-chain verification via transaction hashes and webhooks.
  - No fiat or Stripe integration.
- **Styling:** Tailwind CSS + Shadcn UI for a professional, "Fintech" visual identity.
- **Real-time Data:** TradingView Lightweight Charts (technical analysis) and CoinGecko/DefiLlama APIs (market data).

---

## 3. User Roles and Permissions

- **Guest:** Access to the homepage, marketing content, and limited "teaser" articles.
- **Registered (Free):** Access to free newsletters, public watchlists, and basic community features.
- **Pro Member (Paid):** Full access to high-conviction token picks, deep research reports, airdrop guides, and premium livestreams.
- **Analyst/Editor:** Permissions to create, edit, and publish research reports, market updates, and educational courses via the Payload Admin panel.
- **Super Admin:** Full platform oversight, including user role management, subscription overrides, and financial analytics.

---

## 4. User Interface & Visual Design (Discovery from Screenshot)

### A. General Visual Identity:

- **Style:** Clean, modern "Fintech" aesthetic.
- **Color Palette:** Professional white/light grey background with bold accents (Blue, Neon Green).
- **Typography:** Bold headings and clean sans-serif body text for high readability.

### B. Top Navigation Header:

- **Search Bar:** Wide, centered search input with keyboard shortcut hint (e.g., `⌘ /`).
- **Notification System (Bell Icon):**
  - **Trigger:** Bell icon with red activity badge (count).
  - **Header:** "Notifications" title with an integrated **Settings (Cog Wheel)** icon on the right.
  - **Tabbed Navigation:** **All**, **Content**, and **Community** tabs with a blue indicator for the active tab.
  - **Global Actions:** "Mark all as read" link in blue below the tabs.
  - **Notification Items:**
    - **Icon:** Platform logo (CryptoEdy) or community member avatar.
    - **Title & Time:** Source name (e.g., "CryptoEdy") with a relative timestamp (e.g., "3d", "17d").
    - **Description:** Concise summary text of the alert.
    - **Individual Action:** A circular **Checkmark Button** on the right of each item to mark it as read.
- **User Avatar (Dropdown Menu):**
  - **Account settings:** Manage profile, wallet, and subscription.
  - **Referral:** Access referral link and rewards.
  - **Support:** Help center and support requests.
  - **Log out:** Securely sign out of the platform (includes an exit icon).

### C. Left Sidebar Navigation:

- **Design:** Slim sidebar with high-contrast icons (Home, Community, Tools).
- **Active State:** Clear visual indicator (e.g., blue icon/text) for the current active section.

### D. Home Feed Components:

- **Personalized Header:** "User's feed" title (e.g., `ansari.rahman's feed`).
- **Feed Item Cards:**
  - **Pro Badge:** Distinctive **Gold "PRO" Badge** for gated content.
  - **Category Labels:** Grey secondary badges (e.g., "Research Report", "Market Direction").
  - **Metadata:** Display of **Read Time** (e.g., "18 min read") and **Published Date**.
  - **Content:** Bold titles, short excerpts, and high-quality feature images.
- **Portfolio Summary Card (Sticky/Pinned):**
  - **Header:** "Your portfolios".
  - **Metrics:** Total Balance (USD) and Total Profit/Loss (Percentage/Absolute).
  - **Design:** Blue gradient background with subtle wave pattern.

### E. Footer Design & Navigation:

- **Visual Style:** High-contrast **Solid Blue background** with white text.
- **Hierarchical Link Structure (Columns):**
  - **Research:** Top Picks, Deep Dives, Passive Income, Airdrop Reports, Memecoins.
  - **Analysis:** Market Updates, Market Direction, Market Pulse, Livestreams.
  - **Tools:** Market Direction, Assets & Picks, Airdrops, Portfolio Tracker.
  - **Platform (CryptoEdy):** Affiliate Program, Education, Privacy Policy, Terms & Conditions, Contact Us, Write for Us, Team.
- **Social Connectivity ("Stay connected"):** Circular social icons for **Discord, Instagram, X (Twitter), and Facebook**.
- **Legal Compliance:** Comprehensive **Financial Disclaimer** text in the footer base (acknowledging the platform is for educational/informational purposes and not financial advice).

---

## 4. User Interface & Visual Design (Discovery from Screenshot)

...

### F. Settings & Profile Page:

- **Layout:** Two-column layout with a left-hand navigation sidebar and a main "Profile" content area.
- **Settings Navigation (Left Sidebar):**
  - **My Account:** Profile (Active), Plans, Billing.
  - **Application:** Notification settings, Appearance.
- **Profile Content Area:**
  - **Profile Image:** Section to upload or choose an avatar (supports WEBP, SVG, PNG, JPG max 5MB).
  - **Personal Information:**
    - Fields: **First Name**, **Last Name**, **Email address** (with edit icon), **Username**, **Display Name**, **Phone number** (with country code selector), **Company Name**, **Full Address**.
  - **Bio:** Large "Complete your bio" text area ("Tell us more about yourself").
  - **Profile Visibility & Privacy:**
    - **Profile Visibility:** Dropdown (e.g., Public/Private).
    - **Crypto portfolio Visibility:** Dropdown (e.g., Public/Private).
    - **Hide Currency Amounts:** Toggle/Checkbox option.
  - **Actions:** "Cancel" (Blue ghost button) and "Save changes" (Light green solid button).
  - **Danger Zone:** "Delete account" option (Red text) with a brief warning about permanent data deletion.

### G. Plans & Subscription Page:

- **Layout:** Centered pricing card with a side-by-side feature checklist.
- **Pricing Card Design:**
  - **Header:** "Annually" toggle (active/fixed).
  - **Pricing:** Clear display of the **$100 / Year** annual rate (with "Save X%" tag).
  - **CTA:** Large, blue "Upgrade" button.
  - **Trust Signals:** Security text ("For your security, all orders are processed on a secured server") and payment network icons (Stablecoins: USDC, USDT).
- **"What's included in Pro" Checklist:**
  - **Value Guarantee:** Refund policy if cumulative upside doesn't reach target (e.g., "3X Value Guarantee").
  - **Expert Access:** 24/7 access to research team/experts.
  - **Top Picks:** Access to all high-conviction token picks.
  - **Technical Analysis:** Request-based on-demand TA.
  - **Livestreams:** Weekly interactive sessions and Q&A.
  - **Daily Insights:** Macro, Mechanics, and On-chain analysis.
  - **Airdrop Hub:** Curated lists and guides for upcoming distributions.
- **Promotional Elements:**
  - **Countdown Banner:** A sticky footer banner (e.g., Orange/Yellow) highlighting a limited-time offer (e.g., "Save 23% & Get a Free 1-1 Call") with a live countdown timer.

### H. Notification Settings Page:

- **Layout:** Categorized list of toggle switches for granular alert management.
- **Notification Categories & Toggles:**
  - **Content:**
    - **All notifications:** Master toggle for content alerts.
    - **Research:** "Uncover hand-picked investment ideas."
    - **Analysis:** "Watch us chart top assets & identify potential trading opportunities."
  - **Community:**
    - **All notifications:** Master toggle for community alerts.
    - **New messages:** Direct messages from other members.
    - **New mentions:** When a user is mentioned in a forum/chat.
    - **New replies:** Responses to a user's comments/posts.
  - **Feed:**
    - **All notifications:** Master toggle for feed-specific alerts.
    - **Market Direction:** Alerts for macro and trend updates.
    - **Assets & Picks:** Alerts for new high-conviction token selections.
  - **Account:**
    - **All notifications:** Master toggle for account-related alerts.
    - **Advertising:** Promotional and platform updates.
- **Design:** Clean white list items with blue toggle switches for an active state.

### I. Appearance Settings Page:

- **Layout:** "Interface Theme" section with side-by-side visual theme previews.
- **Theme Options:**
  - **Light:** Classic light interface with high readability.
  - **Dark:** High-contrast dark mode for low-light environments.
  - **System:** Automatically switches between light and dark based on the user's OS settings.
- **Design:** Each theme is represented by a stylized UI preview card with a radio button selector below it. A blue dot indicator is used for the active selection.

### J. Article & Gated Content Page:

- **Layout:** Long-form editorial layout with high-impact visuals and integrated conversion blocks.
- **Header Elements:**
  - **Breadcrumbs:** e.g., `CryptoEdy > Research > "The Everything Exchange"`.
  - **Badges:** Gold "PRO" badge and Grey Category badge (e.g., "Research Report").
  - **Metadata:** Published date, comment count, and **Social Share Icons** (Copy Link, Facebook, X).
  - **Intro Section:** Bold Title, Subtitle, and a lead image.
- **Content Gating ("Paywall"):**
  - **The Hook:** Initial article summary and "In this report" bullet points are public.
  - **The Wall:** Content transitions to a "Continue reading by joining CryptoEdy Pro" block.
  - **Integrated Conversion:** The **$100 / Year Pricing Card** and "What's included in Pro" checklist are embedded directly within the article flow to drive immediate conversion.
- **Conversion & Trust Sections (Post-Wall):**
  - **3X Value Guarantee Section:** Dedicated block explaining the refund policy with a "Get started" CTA and trust signal (e.g., "Trusted by 300,000+ Investors").
  - **Track Record Showcase:** Horizontal scroll or grid of "Winning Picks" showing entry/exit price and percentage gains (e.g., ETH +6,082%) with associated charts.
  - **FAQ Section:** Accordion-style list answering common questions about trust, experience levels, and the refund policy.
- **Engagement:** - **Recommended from CryptoEdy:** A "Related Content" footer grid (similar to the Home Feed) with navigation arrows.
  ...

### A. Home Feed & Discovery

- **Dynamic Layout Engine:** Support for responsive Grid and List views with persistent user preference.
- **Real-time Filtering:** Client-side filtering of research and analysis content via category tabs.

### B. Communication & Alerts

- **Notification Engine:** Real-time and persistent alerts categorized by content type.
- **In-App Preferences:** Granular toggle controls for email vs. in-app notifications.

### C. Tools & Market Insights

- **Market Direction:** Real-time macro data, liquidity flows, and trend dashboards.
- **Assets & Picks:** Searchable database of "Pro" picks with risk ratings and price targets.
- **Portfolio Tracker:**
  - **Personal:** Manual or wallet-connected asset tracking.
  - **Platform:** Real-time performance of the official CryptoEdy portfolio.
- **Airdrops:** Task-based progress tracking for upcoming/active distributions.

### D. User Management & Social

- **Referral System:** Crypto-native referral tracking (rewarding users in USDC/USDT for successful annual sign-ups).
- **Account Dashboard:** Unified view of subscription history, connected wallets, and referral earnings.

### E. Educational Center

- **Courses:** Structured learning paths for crypto beginners to advanced traders.
- **Resource Hub:** Curated library of tutorials and glossary terms.

### F. Admin Dashboard (Backend)

- **Content Management:** Full CRUD (Create, Read, Update, Delete) for all site content with scheduling capabilities.
- **User Management:** Searchable directory of users with the ability to edit roles and permissions.
- **Subscription Analytics:** Tracking of active memberships, churn rates, and on-chain revenue.
- **Financial Reporting:** Monitoring of transaction hashes, wallet addresses, and payment confirmation status.

---

## 5. Web3 Payment & Subscription Logic

- **Subscription Tiers:** Single tier - **Annual "Pro" Plan**.
  - **Price:** **USD 100 / Year**.
  - **Billing Frequency:** Annual only (No monthly subscription option).
  - **Settlement:** Settled exclusively in USDC or USDT (across supported chains).
- **On-chain Verification:** Automated verification of transaction hashes via webhooks or indexers to instantly unlock member access.
- **Renewal Alerts:** Automated notifications for subscription expiry, as crypto payments lack traditional "auto-renew" capabilities.

---

## 6. Non-Functional Requirements

- **SEO & Performance:** Server-Side Rendering (SSR) for all public research to ensure high visibility. Page load speeds under 2 seconds.
- **Security:** Secure handling of user wallet data and rigorous verification of payment transactions to prevent fraud.
- **Mobile Optimized:** A fully responsive experience across all devices.
- **Scalability:** Architecture designed to handle rapid content growth and high concurrent user traffic.
