import { Users, ShieldCheck, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolPreviewLayout } from '@/components/tools/tool-preview-layout'

const HIGHLIGHTS = [
  {
    icon: Users,
    title: 'Peer-to-Peer Intelligence',
    description:
      'Engage with verified investors and data scientists in curated discussion threads.',
  },
  {
    icon: ShieldCheck,
    title: 'Vetted Network',
    description:
      'A strictly curated environment for serious digital asset research — no noise, only signal.',
  },
] as const

export default function CommunityPage() {
  return (
    <ToolPreviewLayout
      title={
        <>
          The Inner <span className="text-primary">Circle.</span>
        </>
      }
      description="We're building a high-fidelity forum and networking space designed exclusively for CryptoEdy members. Real-time alpha, vetted insights, and direct access to our editorial researchers."
      highlights={HIGHLIGHTS}
      icon={Users}
      accent="primary"
      decoration={
        <>
          {/* Decorative nodes */}
          <div className="absolute inset-0 opacity-20">
            <div className="bg-primary absolute top-[30%] left-[20%] size-3 rounded-full" />
            <div className="bg-primary absolute top-[20%] right-[25%] size-2 rounded-full" />
            <div className="bg-secondary absolute bottom-[35%] left-[35%] size-2.5 rounded-full" />
            <div className="bg-primary absolute right-[30%] bottom-[25%] size-2 rounded-full" />
            <div className="bg-primary-container absolute top-[15%] left-[50%] size-4 rounded-full" />
            <div className="bg-secondary-container absolute bottom-[20%] left-[15%] size-3 rounded-full" />
          </div>
          {/* Animated pulse lines */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-15">
            <div className="bg-primary h-px w-3/4 animate-pulse rounded-full [animation-duration:3s]" />
            <div className="bg-primary h-px w-1/2 animate-pulse rounded-full [animation-delay:0.5s] [animation-duration:3s]" />
            <div className="bg-primary h-px w-2/3 animate-pulse rounded-full [animation-delay:1s] [animation-duration:3s]" />
          </div>
        </>
      }
      actions={
        <div>
          <Button variant="gradient" size="xl">
            <Bell className="size-4" />
            Notify Me
          </Button>
        </div>
      }
    />
  )
}
