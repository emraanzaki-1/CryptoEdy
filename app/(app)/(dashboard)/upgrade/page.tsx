import Link from 'next/link'
import { SectionHeading } from '@/components/common/section-heading'
import { ButtonLink } from '@/components/ui/button-link'

export default function UpgradePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <div className="bg-tertiary-fixed text-on-tertiary-fixed text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
        Pro
      </div>
      <SectionHeading>Upgrade to CryptoEdy Pro</SectionHeading>
      <p className="text-on-surface-variant mt-4 max-w-md">
        Full access to token picks, deep research, airdrop guides, and all Pro tools for{' '}
        <strong>$100 / year</strong>.
      </p>
      <p className="text-on-surface-variant text-body-sm mt-2">Full payment flow coming soon.</p>
      <ButtonLink href="/feed" variant="gradient" size="xl" className="mt-8 rounded-full">
        Back to feed
      </ButtonLink>
    </div>
  )
}
