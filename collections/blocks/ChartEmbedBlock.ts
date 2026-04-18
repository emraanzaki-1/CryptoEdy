import type { Block } from 'payload'

// Embeds a TradingView chart widget inline in the article body.
// Renders as an iframe with the specified ticker, interval, and height.
export const ChartEmbedBlock: Block = {
  slug: 'chart-embed',
  labels: { singular: 'Chart', plural: 'Charts' },
  fields: [
    {
      name: 'ticker',
      type: 'text',
      required: true,
      admin: {
        description:
          'TradingView symbol including exchange prefix, e.g. BINANCE:ETHUSDT, COINBASE:BTCUSD.',
      },
    },
    {
      name: 'interval',
      type: 'select',
      required: true,
      defaultValue: 'D',
      options: [
        { label: '15 Minutes', value: '15' },
        { label: '1 Hour', value: '60' },
        { label: '4 Hours', value: '240' },
        { label: 'Daily', value: 'D' },
        { label: 'Weekly', value: 'W' },
        { label: 'Monthly', value: 'M' },
      ],
      admin: { description: 'Candlestick interval.' },
    },
    {
      name: 'chartType',
      type: 'select',
      defaultValue: 'candlestick',
      options: [
        { label: 'Candlestick', value: 'candlestick' },
        { label: 'Line', value: 'line' },
        { label: 'Area', value: 'area' },
        { label: 'Bar', value: 'bar' },
      ],
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 450,
      min: 300,
      max: 900,
      admin: { description: 'Chart height in pixels. Min 300, max 900.' },
    },
    {
      name: 'showVolume',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show volume bars below the price chart.' },
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
      admin: { description: 'Chart colour theme. Dark recommended for CryptoEdy brand.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption displayed below the chart.' },
    },
  ],
}
