import { BarChart2, TrendingUp, Activity, Compass } from 'lucide-react'
import { ToolPreviewLayout } from '@/components/tools/tool-preview-layout'

const HIGHLIGHTS = [
  {
    icon: TrendingUp,
    title: 'Macro Trend Analysis',
    description: 'Aggregated on-chain and off-chain signals to identify market regime shifts.',
  },
  {
    icon: Activity,
    title: 'Directional Indicators',
    description: 'Proprietary scoring model combining sentiment, volume, and network activity.',
  },
  {
    icon: Compass,
    title: 'Entry & Exit Signals',
    description: 'Data-driven timing insights for positioning across market cycles.',
  },
] as const

export default function MarketDirectionPage() {
  return (
    <ToolPreviewLayout
      title={
        <>
          Market <span className="text-primary">Direction.</span>
        </>
      }
      description="Real-time directional indicators and macro trend analysis. Understand where the market is heading before it gets there."
      highlights={HIGHLIGHTS}
      icon={BarChart2}
      accent="primary"
      decoration={
        <div className="absolute inset-x-8 bottom-1/3 flex flex-col gap-4 opacity-20">
          <div className="bg-primary h-0.5 w-full origin-left -rotate-3 rounded-full" />
          <div className="bg-secondary h-0.5 w-3/4 origin-left rotate-2 rounded-full" />
          <div className="bg-primary h-0.5 w-5/6 origin-left -rotate-1 rounded-full" />
        </div>
      }
    />
  )
}
