# UI/UX Specification Document: CryptoEdy Research Platform

## 1. Visual Identity & Design System

- **Design Philosophy:** Clean, modern "Fintech" aesthetic. High-performance, data-driven, and trustworthy.
- **Color Palette:**
  - **Primary:** Deep Blue (#0052FF) - Used for primary actions, active states, and navigation accents.
  - **Secondary:** Neon Green (#00FF41) - Used for "Save" actions, positive growth metrics, and data highlights.
  - **Accents:** Gold/Yellow (#FFD700) - Reserved for "PRO" status and high-urgency promotional banners.
  - **Background:** Crisp White (#FFFFFF) / Light Grey (#F8F9FA) for content areas.
- **Typography:** Bold sans-serif headings (Inter or Geist) for clarity; clean, readable body text for long-form research.
- **Components:** Shadcn UI base (modified for the "Fintech" look).

---

## 2. Page Inventory & Structure

### A. Home Feed (The Central Hub)

- **Top Navigation:**
  - **Category Dropdowns:** Research (All, Top Picks, etc.), Analysis (Market Updates, etc.), Education (Crypto School, etc.).
  - **Search:** Command-palette UI (⌘ + /) for global keyword search.
  - **Notifications:** Tabbed bell dropdown (All, Content, Community) with a management cog.
  - **User Badge:** Dropdown (Account Settings, Referral, Support, Log out).
- **Sidebar:** Slim vertical nav (Home, Community, Tools). Tools shows a hoverable menu (Market Direction, Picks, Tracker, Airdrops).
- **Main Feed:**
  - Personalized header (e.g., "Your Feed").
  - **Layout Toggle:** Switch between Grid and List views.
  - **Filter Pills:** Horizontal tabs (All, Research, Analysis).
  - **Portfolio Card:** Pinned blue-gradient card showing Total Balance and Profit/Loss.

### B. Article & Gated Content Page

- **Breadcrumbs:** Full path tracking (Home > Research > Title).
- **Metadata Bar:** Date, read time (e.g., "18 min read"), and share buttons.
- **Content Flow:**
  - Public "Hook" (Summary, "In this report" bullets).
  - Gated "Wall" block: "Continue reading by joining CryptoEdy Pro".
  - **Inline Pricing:** $100/year annual card and feature checklist embedded in the flow.
- **Trust Blocks:** 3X Value Guarantee section, Track Record showcase (ETH +6,082%, etc.), and FAQ accordion.
- **Engagement:** "Recommended from CryptoEdy" footer grid.

### C. Profile & Settings (Two-Column Layout)

- **Sub-Navigation:**
  - **My Account:** Profile, Plans, Billing.
  - **Application:** Notification Settings, Appearance.
- **Profile Fields:** First/Last Name, Email (edit icon), Username, Phone (country selector), Bio text area.
- **Privacy:** Dropdowns for Profile/Portfolio visibility (Public/Private) and "Hide Currency Amounts" toggle.
- **Danger Zone:** "Delete account" option in red.

### D. Plans & Subscription Page

- **Annually Toggle:** Fixed to annual billing for the $100/year tier.
- **Pricing Card:** Large "$100/year" display with "Upgrade" CTA and stablecoin payment icons (USDC, USDT).
- **Checklist:** Detailed breakdown of Pro benefits (Expert access, Top Picks, 3X Guarantee).
- **Urgency Banner:** Sticky footer countdown (e.g., "Save 23% & Get a Free 1-1 Call").

### E. Notification Settings

- **Categorized Toggles:** Granular switches for Content, Community, Feed, and Account.
- **Master Switches:** "All notifications" toggle for each category.
- **Aesthetic:** Clean list items with high-contrast blue toggle switches.

### F. Appearance Settings

- **Interface Theme:** Side-by-side stylized UI previews for Light, Dark, and System modes.
- **Selectors:** Radio buttons with a blue "active" indicator.

---

## 3. Global Footer

- **Layout:** High-contrast Solid Blue background.
- **Columns:** Hierarchical links for Research, Analysis, Tools, and Platform (Privacy, Team, etc.).
- **Socials:** Circular icons (Discord, Instagram, X, Facebook).
- **Legal:** Fixed financial disclaimer regarding educational intent and risk.

---

## 4. Key UI Interactions & Behaviors

- **Content Blurring:** Non-Pro users see a smooth CSS blur or fade transition before the conversion wall.
- **Responsive Navigation:**
  - **Mobile:** Sidebar collapses into a hamburger menu; Header search becomes a compact icon.
  - **Tablets:** Sidebar stays slim; Feed switches to single/double-column grid.
- **Tool Hover Logic:** Tools in the sidebar reveal a slide-out menu on hover for instant navigation.
- **Real-time Feedback:** Notification bell displays a red badge with the unread count instantly.
