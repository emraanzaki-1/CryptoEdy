import { TrendingUp, Target, Star, RefreshCw } from 'lucide-react'
import { ToolPreviewLayout } from '@/components/tools/tool-preview-layout'

const HIGHLIGHTS = [
  {
    icon: Target,
    title: 'High-Conviction Picks',
    description:
      'Curated token selections with clear entry zones, targets, and invalidation levels.',
  },
  {
    icon: Star,
    title: 'Proprietary Scoring',
    description: 'Each asset scored across fundamentals, technicals, and on-chain metrics.',
  },
  {
    icon: RefreshCw,
    title: 'Weekly Updates',
    description: 'Refreshed every week by our core editorial research team with full write-ups.',
  },
] as const

export default function PicksPage() {
  return (
    <ToolPreviewLayout
      title={
        <>
          Assets & <span className="text-tertiary">Picks.</span>
        </>
      }
      description="A proprietary scoring system for underlying assets, updated weekly by our core research editorial team. No noise — only high-conviction plays."
      highlights={HIGHLIGHTS}
      icon={TrendingUp}
      accent="tertiary"
      decoration={
        <div className="absolute bottom-1/4 left-1/4 flex items-end gap-3 opacity-15">
          <div className="bg-tertiary h-16 w-6 rounded-t-lg" />
          <div className="bg-tertiary h-24 w-6 rounded-t-lg" />
          <div className="bg-tertiary h-12 w-6 rounded-t-lg" />
          <div className="bg-tertiary h-20 w-6 rounded-t-lg" />
          <div className="bg-tertiary h-8 w-6 rounded-t-lg" />
        </div>
      }
    />
  )
}
