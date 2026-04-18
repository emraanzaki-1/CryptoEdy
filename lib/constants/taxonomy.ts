export const TAXONOMY = {
  research: {
    label: 'Research',
    items: [
      { label: 'Top Picks', slug: 'top-picks', value: 'top-picks' },
      { label: 'Deep Dives', slug: 'deep-dives', value: 'deep-dives' },
      { label: 'Passive Income', slug: 'passive-income', value: 'passive-income' },
      { label: 'Airdrop Reports', slug: 'airdrop-reports', value: 'airdrop-reports' },
      { label: 'Memecoins', slug: 'memecoins', value: 'memecoins' },
    ],
  },
  analysis: {
    label: 'Analysis',
    items: [
      { label: 'Market Updates', slug: 'market-updates', value: 'market-updates' },
      { label: 'Market Direction', slug: 'market-direction', value: 'market-direction' },
      { label: 'Market Pulse', slug: 'market-pulse', value: 'market-pulse' },
      { label: 'Livestreams', slug: 'livestreams', value: 'livestreams' },
    ],
  },
  education: {
    label: 'Education',
    items: [
      { label: 'Courses', slug: 'courses', value: 'courses' },
      { label: 'Resource Hub', slug: 'resource-hub', value: 'resource-hub' },
      { label: 'Glossary', slug: 'glossary', value: 'glossary' },
    ],
  },
} as const

export const ALL_CATEGORIES = (
  Object.entries(TAXONOMY) as [CategoryType, (typeof TAXONOMY)[CategoryType]][]
).flatMap(([type, section]) => section.items.map((item) => ({ ...item, type })))

// Flat select options array for Payload fields
export const CATEGORY_SELECT_OPTIONS = ALL_CATEGORIES.map((c) => ({
  label: c.label,
  value: c.value,
}))

export type CategoryType = keyof typeof TAXONOMY
export type CategorySlug =
  | 'top-picks'
  | 'deep-dives'
  | 'passive-income'
  | 'airdrop-reports'
  | 'memecoins'
  | 'market-updates'
  | 'market-direction'
  | 'market-pulse'
  | 'livestreams'
  | 'courses'
  | 'resource-hub'
  | 'glossary'

// Map slug → top-level type, used for URL construction and breadcrumbs
export const SLUG_TO_TYPE: Record<CategorySlug, CategoryType> = {
  'top-picks': 'research',
  'deep-dives': 'research',
  'passive-income': 'research',
  'airdrop-reports': 'research',
  memecoins: 'research',
  'market-updates': 'analysis',
  'market-direction': 'analysis',
  'market-pulse': 'analysis',
  livestreams: 'analysis',
  courses: 'education',
  'resource-hub': 'education',
  glossary: 'education',
}
