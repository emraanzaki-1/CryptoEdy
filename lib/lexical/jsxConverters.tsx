import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'

import { CalloutBlockComponent } from '@/components/article/blocks/callout-block'
import { PriceTargetBlockComponent } from '@/components/article/blocks/price-target-block'
import { ChartEmbedBlockComponent } from '@/components/article/blocks/chart-embed-block'
import { PerformanceTableBlockComponent } from '@/components/article/blocks/performance-table-block'

export const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    callout: ({ node }: { node: SerializedBlockNode }) => {
      const fields = node.fields as unknown as {
        type: 'insight' | 'warning' | 'tip' | 'data'
        heading?: string | null
        body: string
      }
      return (
        <CalloutBlockComponent type={fields.type} heading={fields.heading} body={fields.body} />
      )
    },
    'price-target': ({ node }: { node: SerializedBlockNode }) => {
      const fields = node.fields as unknown as {
        token: string
        tokenName?: string | null
        entryZone: string
        priceTarget: string
        stopLoss: string
        timeframe: string
        riskRating: 'low' | 'medium' | 'high' | 'speculative'
        catalysts?: { catalyst: string; id?: string }[] | null
        rationale?: string | null
      }
      return <PriceTargetBlockComponent {...fields} />
    },
    'chart-embed': ({ node }: { node: SerializedBlockNode }) => {
      const fields = node.fields as unknown as {
        ticker: string
        interval: string
        chartType?: string | null
        height?: number | null
        showVolume?: boolean | null
        theme?: string | null
        caption?: string | null
      }
      return <ChartEmbedBlockComponent {...fields} />
    },
    'performance-table': ({ node }: { node: SerializedBlockNode }) => {
      const fields = node.fields as unknown as {
        title?: string | null
        rows: {
          token: string
          entryPrice: string
          exitPrice: string
          gain: string
          status?: 'open' | 'closed' | 'stopped' | null
          pickedAt: string
          id?: string
        }[]
        footnote?: string | null
      }
      return <PerformanceTableBlockComponent {...fields} />
    },
  },
})
