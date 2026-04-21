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
} as const
