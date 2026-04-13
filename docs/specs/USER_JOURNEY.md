# User Journey Documentation: CryptoEdy Research Platform

This document outlines the key user journeys, from initial discovery to becoming a "Pro Member" and utilizing the platform's research tools.

---

## 1. Journey: The "Guest" to "Registered" Conversion

**Goal:** Capture user interest and move them into the free ecosystem.

1.  **Discovery:** User lands on the public homepage (SEO-driven articles or social referral).
2.  **Engagement:** User clicks on a "Market Analysis" or "Research" teaser.
3.  **The Hook:** User reads the first 20% of the article. The content then "blurs" or shows a "Create Free Account to Continue Reading" CTA.
4.  **Registration:**
    - User clicks "Sign Up."
    - User provides Email and Password (handled by Payload Native Auth).
    - System sends a verification email.
5.  **Onboarding:** User verifies email and is redirected to the "Home Feed" (Free Tier). They can now see all "Free" articles and partial "Pro" teasers.

---

## 2. Journey: The "Go Pro" Subscription (Crypto-Only)

**Goal:** Convert a registered user to a paid "Pro Member" using USDC/USDT.

1.  **Trigger:** User clicks a "Locked" High-Conviction Pick or the "Upgrade to Pro" button in the sidebar/header.
2.  **Pricing Page:** User sees the single tier: **$100 / Year**.
3.  **Payment Method Selection:**
    - User chooses their preferred chain (e.g., Solana, Ethereum, Polygon).
    - User selects asset: **USDC** or **USDT**.
4.  **Wallet Connection:** User connects their wallet (Phantom, MetaMask, etc.) via NextAuth/RainbowKit.
5.  **Transaction:**
    - Platform generates a unique payment request or displays a deposit address.
    - User confirms the $100 stablecoin transfer in their wallet.
6.  **Verification:**
    - Platform monitors the transaction hash (via webhook or indexer).
    - Once confirmed (usually < 1 min), the system updates the user's role to `Pro Member` and sets `subscriptionExpiry` to +365 days.
7.  **Success:** User receives a "Welcome to Pro" notification and all content/tools are instantly unlocked.

---

## 3. Journey: Content Discovery & Tools Usage

**Goal:** High-value daily engagement for Pro Members.

1.  **Daily Login:** User lands on the **Home Feed**.
2.  **Personalization:** User toggles to **Grid View** (their saved preference) and filters by the **"Research"** pill to see the latest token picks.
3.  **Tool Engagement:**
    - User hovers over **Tools** in the left sidebar.
    - User selects **"Assets and Picks"** to check entry/exit zones for a specific token.
4.  **Deep Dive:** User clicks a report, reads the full analysis, and uses the **Top Navigation Search** to find related macro reports ("Market Direction").
5.  **Tracking:** User checks the **Airdrops** tool to mark "Step 1: Bridge to Arbitrum" as complete for a new project.

---

## 4. Journey: Community & Notifications

**Goal:** Retention through social proof and real-time alerts.

1.  **Alert:** User sees a red dot on the **Notification Bell**.
2.  **Filtering:** User opens the dropdown and clicks the **"Content"** tab to see a new "Emergency Macro Update."
3.  **Interaction:** User clicks the notification, reads the update, and then switches to the **"Community"** tab to see if analysts are discussing it in the forum.
4.  **Management:** User realizes they are getting too many community alerts; they click the **Cog Wheel** in the notification dropdown to instantly disable "Forum Reply" emails while keeping "New Pick" alerts active.

---

## 5. Journey: Referral & Growth

**Goal:** Incentivize users to bring in new Pro members.

1.  **Access:** User opens the **User Badge Dropdown** and selects **"Referral."**
2.  **Share:** User copies their unique referral link.
3.  **Conversion:** A friend uses the link to sign up and pays $100 for the annual Pro plan.
4.  **Reward:** The system detects the referred payment and automatically logs a referral credit (e.g., $10 in USDC/USDT) to the user's account dashboard, viewable in **"Account Settings."**

---

## 6. Journey: Analyst Workflow (Internal)

**Goal:** Efficient content publishing and notification.

1.  **Authoring:** Analyst logs into the **Payload Admin Panel**.
2.  **Creation:** Analyst creates a new "Research Report," sets `isProOnly: true`, and selects a `Risk Rating`.
3.  **Review:** Analyst saves as "Draft." Editor reviews the formatting and charts.
4.  **Publish:** Editor clicks "Publish."
5.  **Distribution:**
    - The report appears on the Home Feed.
    - The system automatically triggers a "New Content" notification to all users' tabbed dropdowns.
    - Pro members receive the full alert; Guest/Free users receive a "New Pro Content" teaser.
