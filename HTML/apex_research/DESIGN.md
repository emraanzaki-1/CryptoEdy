# Design System Strategy: The Digital Curator

## 1. Overview & Creative North Star

This design system is built upon the North Star of **"The Digital Curator."** In a market saturated with volatile noise and aggressive "crypto-bro" aesthetics, this system functions as a high-end editorial gallery for financial intelligence.

We break the "generic template" look by rejecting the rigid 12-column grid in favor of **intentional asymmetry**. The experience is defined by breathable whitespace, overlapping depth, and a dramatic typographic scale that prioritizes narrative clarity over data density. We are not just building a platform; we are designing an authoritative research journal that happens to live on a screen.

---

## 2. Colors: Tonal Architecture

The palette is rooted in a "Deep Sea & Neon" spectrum, using the contrast between stability (Deep Blue) and momentum (Neon Green).

### Primary & Secondary

- **Primary (#003EC7):** The anchor. Use for high-intent actions.
- **Primary Container (#0052FF):** Use for active states and brand accents.
- **Secondary (#006E16):** Represents growth and bullish sentiment.
- **Secondary Container (#00F93F):** High-visibility highlights for "up" metrics.
- **Tertiary/Accents (#705D00 / #FFD700):** Reserved exclusively for "PRO" status and critical urgency.

### Surface Hierarchy & The "No-Line" Rule

To achieve a premium feel, **1px solid borders are strictly prohibited** for sectioning content. Boundaries are created through background shifts:

- **Surface (#F8F9FF):** The canvas.
- **Surface-Container-Low (#EFF4FF):** For secondary content regions.
- **Surface-Container-Lowest (#FFFFFF):** For primary cards, creating a "lifted" effect against the slightly darker base.

### Glass & Gradient Signature

- **Backdrop Blurs:** Use `surface-container-highest` with a 12px-20px backdrop blur for navigation bars and floating overlays.
- **Linear Soul:** CTAs should utilize a subtle vertical gradient from `primary` to `primary_container` to provide a "physical" presence that flat hex codes lack.

---

## 3. Typography: Editorial Authority

We use **Inter** as a singular, powerful typeface, relying on extreme weight and size shifts to create a hierarchy of "The Lead Story."

- **Display (Lg: 3.5rem):** Reserved for market-moving headlines. Use `-0.04em` letter spacing for a "tight" editorial look.
- **Headline (Md: 1.75rem):** For research category headers.
- **Title (Sm: 1.0rem):** For card headers and navigational markers.
- **Body (Md: 0.875rem):** Optimized for long-form reading. Line height must be `1.6` to prevent fatigue during deep-dive research.
- **Label (Md/Sm):** All-caps with `+0.05em` letter spacing for data metadata (e.g., "MARKET CAP," "VOL 24H").

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows and lines make a UI look "busy." This system uses **Tonal Layering** to convey hierarchy.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card (Pure White) sitting on a `surface-container-low` section (Light Blue-Grey) creates a natural edge.
- **Ambient Shadows:** Only for floating elements (Modals/Popovers).
  - Blur: `32px`
  - Opacity: `4-6%`
  - Color: Tinted with `on-surface` (#0B1C30) to mimic natural light.
- **The Ghost Border:** If a separator is required for accessibility, use `outline-variant` at **15% opacity**. Never use a 100% opaque border.
- **Frosted Integration:** Use Glassmorphism for sidebars. This allows the primary content colors to bleed through, ensuring the UI feels like a single cohesive ecosystem rather than separate "windows."

---

## 5. Components

### Buttons

- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. `0.75rem` roundedness.
- **Secondary:** `surface_container_high` background with `on_primary_fixed_variant` text.
- **Tertiary:** No background. `primary` text. Underline only on hover.

### Cards & Lists

- **The Divider Rule:** Forbid the use of horizontal lines. Separate list items using `1.5rem` of vertical white space or alternating backgrounds between `surface` and `surface_container_low`.
- **Card Styling:** `1.0rem` (xl) corner radius. Use Tonal Layering (White on Grey) for the "pop."

### Research Inputs

- **Text Fields:** Subtle `surface_container_high` fills. On focus, transition the background to `surface_container_lowest` and apply a 2px "Ghost Border" of `primary`.

### Fintech-Specific Components

- **Trend Micro-charts:** Use `secondary` for positive trends and `error` for negative. Use a `2px` stroke width with a subtle gradient fade underneath the line.
- **Status Pills:** High-contrast `secondary_fixed` for "Live" data, `tertiary_fixed` for "Pro Only."

---

## 6. Do’s and Don’ts

### Do

- **DO** use white space as a structural element. If a section feels cramped, double the padding rather than adding a line.
- **DO** use `display-lg` typography for single, impactful numbers (e.g., a Bitcoin price target).
- **DO** use "Glass" effects for mobile navigation to maintain a sense of place.

### Don't

- **DON'T** use pure black (#000000) for text. Use `on_surface` (#0B1C30) to maintain tonal harmony.
- **DON'T** use "generic" crypto icons (like basic coin logos) without a consistent "Digital Curator" container.
- **DON'T** use 1px borders. If you feel the need to draw a line, you haven't used enough contrast in your surface colors.
