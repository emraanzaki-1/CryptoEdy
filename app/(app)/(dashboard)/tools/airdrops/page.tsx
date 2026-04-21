import { Gift, CheckCircle, BookOpen, Bell } from 'lucide-react'
import { ToolPreviewLayout } from '@/components/tools/tool-preview-layout'

const HIGHLIGHTS = [
  {
    icon: CheckCircle,
    title: 'Eligibility Checker',
    description: 'Connect your wallet and instantly see which upcoming airdrops you qualify for.',
  },
  {
    icon: BookOpen,
    title: 'Step-by-Step Guides',
    description: 'Detailed walkthroughs for each ecosystem — never miss a critical interaction.',
  },
  {
    icon: Bell,
    title: 'Deadline Alerts',
    description: 'Get notified before snapshot dates and claim windows close.',
  },
] as const

export default function AirdropsPage() {
  return (
    <ToolPreviewLayout
      title={
        <>
          Airdrop <span className="text-secondary">Hub.</span>
        </>
      }
      description="Automated eligibility checks and step-by-step guides for the most promising ecosystems. Stop guessing — know exactly where to position."
      highlights={HIGHLIGHTS}
      icon={Gift}
      accent="secondary"
    />
  )
}
