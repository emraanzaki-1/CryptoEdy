import { Layers, Wallet, PieChart, ArrowDownUp } from 'lucide-react'
import { ToolPreviewLayout } from '@/components/tools/tool-preview-layout'

const HIGHLIGHTS = [
  {
    icon: Wallet,
    title: 'Multi-Chain Visibility',
    description: 'Connect wallets across EVM, Solana, and Cosmos chains in a unified dashboard.',
  },
  {
    icon: PieChart,
    title: 'Cost-Basis Analysis',
    description: 'Deep attribution modeling to understand your true realized and unrealized PnL.',
  },
  {
    icon: ArrowDownUp,
    title: 'DeFi Position Tracking',
    description: 'Monitor LP positions, staking rewards, and lending collateral across protocols.',
  },
] as const

export default function TrackerPage() {
  return (
    <ToolPreviewLayout
      title={
        <>
          Portfolio <span className="text-primary">Tracker.</span>
        </>
      }
      description="Advanced portfolio analytics to understand exactly where your alpha is coming from across chains and DeFi protocols."
      highlights={HIGHLIGHTS}
      icon={Layers}
      accent="primary"
      decoration={
        <div className="absolute top-1/4 left-1/4 opacity-10">
          <div className="bg-primary size-24 rounded-full" />
          <div className="bg-secondary absolute top-0 left-12 size-16 rounded-full" />
          <div className="bg-tertiary absolute top-14 left-4 size-12 rounded-full" />
        </div>
      }
    />
  )
}
