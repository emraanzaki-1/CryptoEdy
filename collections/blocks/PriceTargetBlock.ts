import type { Block } from 'payload'

// Structured token pick summary card embedded in a research article.
// Renders as a prominent card showing entry, target, stop-loss, and key metadata.
export const PriceTargetBlock: Block = {
  slug: 'price-target',
  labels: { singular: 'Price Target', plural: 'Price Targets' },
  fields: [
    {
      name: 'token',
      type: 'text',
      required: true,
      admin: { description: 'Token symbol, e.g. ETH, SOL, ARB.' },
    },
    {
      name: 'tokenName',
      type: 'text',
      admin: { description: 'Full token name, e.g. Ethereum. Shown as subtitle.' },
    },
    {
      name: 'entryZone',
      type: 'text',
      required: true,
      admin: { description: 'Entry price range, e.g. $2,400–$2,700.' },
    },
    {
      name: 'priceTarget',
      type: 'text',
      required: true,
      admin: { description: '12-month price target, e.g. $6,500.' },
    },
    {
      name: 'stopLoss',
      type: 'text',
      required: true,
      admin: { description: 'Stop-loss level, e.g. $1,900.' },
    },
    {
      name: 'timeframe',
      type: 'text',
      required: true,
      admin: { description: 'Expected hold duration, e.g. 6–12 months.' },
    },
    {
      name: 'riskRating',
      type: 'select',
      required: true,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Speculative', value: 'speculative' },
      ],
      admin: { description: 'Risk level shown as a coloured badge on the card.' },
    },
    {
      name: 'catalysts',
      type: 'array',
      admin: { description: 'Key catalysts driving the thesis. List 2–4 short points.' },
      fields: [
        {
          name: 'catalyst',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'rationale',
      type: 'textarea',
      admin: { description: 'One-paragraph investment rationale shown on the card.' },
    },
  ],
}
