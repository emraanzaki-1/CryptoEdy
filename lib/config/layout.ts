/** Shared layout constants to reduce churn across edits. */

export const LAYOUT = {
  /** Main content area padding (dashboard) */
  content: {
    px: 'px-6 lg:px-10',
    pt: 'pt-6 lg:pt-8',
    pb: 'pb-6 lg:pb-10',
  },
  /** Top app bar (dashboard) */
  appBar: {
    px: 'px-6 lg:px-10',
    py: 'py-3',
    height: 'h-auto',
  },
  /** Content area border radius (dashboard) */
  mainRadius: 'rounded-tl-3xl',

  /** Guest / public routes */
  guest: {
    /** Responsive horizontal padding (16px mobile → 32px desktop) */
    px: 'px-4 md:px-8',
    /** Constrained container: max-width + auto-center + responsive padding */
    container: 'max-w-site mx-auto px-4 md:px-8',
    /** Vertical page padding for content pages */
    pagePy: 'pt-16 pb-24',
  },

  /** Spacing tokens — section / card / control patterns */
  spacing: {
    /** Landing section padding: 24px→40px horizontal, 56px vertical */
    section: 'px-section-x py-section md:px-section-x-md',
    /** Gap between section header and body */
    sectionGap: 'gap-section-gap',
    /** Card inner padding */
    card: 'p-card',
    /** Gap between items within a card */
    cardGap: 'gap-card-gap',
    /** Grid / list item gap */
    gridGap: 'gap-grid-gap',
  },
} as const
