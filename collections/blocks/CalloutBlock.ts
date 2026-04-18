import type { Block } from 'payload'

// Highlighted editorial note embedded in article body.
// Renders as a coloured aside: insight (blue), warning (amber), tip (green), data (purple).
export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'insight',
      options: [
        { label: '💡 Key Insight', value: 'insight' },
        { label: '⚠️ Warning', value: 'warning' },
        { label: '✅ Pro Tip', value: 'tip' },
        { label: '📊 Data Point', value: 'data' },
      ],
      admin: { description: 'Controls the colour and icon of the callout box.' },
    },
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional bold heading inside the callout.' },
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: { description: 'Main callout text. Keep under 120 words for best readability.' },
    },
  ],
}
