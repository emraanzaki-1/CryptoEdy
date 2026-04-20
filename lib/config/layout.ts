/** Shared layout constants for the dashboard shell to reduce churn across edits. */

export const LAYOUT = {
  /** Main content area padding */
  content: {
    px: 'px-6 lg:px-10',
    pt: 'pt-6 lg:pt-8',
    pb: 'pb-6 lg:pb-10',
  },
  /** Top app bar */
  appBar: {
    px: 'px-6 lg:px-10',
    py: 'py-3',
    height: 'h-auto',
  },
  /** Content area border radius */
  mainRadius: 'rounded-tl-3xl',
} as const
