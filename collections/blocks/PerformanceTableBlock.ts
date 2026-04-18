import type { Block } from 'payload'

// Track record table showing historical pick performance.
// Renders as a styled table: token | entry | exit | gain | date.
export const PerformanceTableBlock: Block = {
  slug: 'performance-table',
  labels: { singular: 'Performance Table', plural: 'Performance Tables' },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Track Record',
      admin: { description: 'Table heading shown above the rows.' },
    },
    {
      name: 'rows',
      type: 'array',
      required: true,
      minRows: 1,
      admin: { description: 'Add one row per token pick.' },
      fields: [
        {
          name: 'token',
          type: 'text',
          required: true,
          admin: { description: 'Token symbol, e.g. ETH.' },
        },
        {
          name: 'entryPrice',
          type: 'text',
          required: true,
          admin: { description: 'Entry price at time of pick, e.g. $120.' },
        },
        {
          name: 'exitPrice',
          type: 'text',
          required: true,
          admin: { description: 'Exit price or current price, e.g. $7,420.' },
        },
        {
          name: 'gain',
          type: 'text',
          required: true,
          admin: { description: 'Percentage gain including sign, e.g. +6,082%.' },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'closed',
          options: [
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
            { label: 'Stopped Out', value: 'stopped' },
          ],
          admin: { description: 'Current pick status. Open = still holding.' },
        },
        {
          name: 'pickedAt',
          type: 'date',
          required: true,
          admin: { description: 'Date the pick was published.' },
        },
      ],
    },
    {
      name: 'footnote',
      type: 'text',
      admin: {
        description:
          'Optional disclaimer shown below the table, e.g. "Past performance is not indicative of future results."',
      },
    },
  ],
}
