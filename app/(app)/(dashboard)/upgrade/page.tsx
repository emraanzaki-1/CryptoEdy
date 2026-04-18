import Link from 'next/link'

export default function UpgradePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <div className="bg-tertiary-fixed text-on-tertiary-fixed mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
        Pro
      </div>
      <h1 className="text-on-surface text-3xl font-bold tracking-[-0.04em]">
        Upgrade to CryptoEdy Pro
      </h1>
      <p className="text-on-surface-variant mt-4 max-w-md">
        Full access to token picks, deep research, airdrop guides, and all Pro tools for{' '}
        <strong>$100 / year</strong>.
      </p>
      <p className="text-on-surface-variant mt-2 text-sm">Full payment flow coming soon.</p>
      <Link
        href="/feed"
        className="from-primary to-primary-container text-on-primary mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-b px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
      >
        Back to feed
      </Link>
    </div>
  )
}
