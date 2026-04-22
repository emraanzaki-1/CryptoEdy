'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CheckoutWidget } from 'thirdweb/react'
import { polygon } from 'thirdweb/chains'
import { getThirdwebClient } from '@/lib/thirdweb/client'
import { Button } from '@/components/ui/button'

// USDC on Polygon
const USDC_POLYGON = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'

interface CheckoutButtonProps {
  className?: string
  /** Signed intent data from server — prevents purchaseData spoofing */
  intentData: {
    intentToken: string
    userId: string
    ts: number
  }
  /** When true, shows CheckoutWidget immediately without the "Upgrade Now" gate */
  inline?: boolean
}

export function CheckoutButton({ className, intentData, inline = false }: CheckoutButtonProps) {
  const [showCheckout, setShowCheckout] = useState(inline)
  const [completed, setCompleted] = useState(false)

  const sellerAddress = process.env.NEXT_PUBLIC_THIRDWEB_RECIPIENT_ADDRESS

  let client: ReturnType<typeof getThirdwebClient> | null = null
  try {
    client = getThirdwebClient()
  } catch {
    // env var not set
  }

  if (!sellerAddress || !client) {
    return (
      <Button variant="default" size="xxl" className={className} disabled>
        <span>Payment not configured</span>
      </Button>
    )
  }

  if (completed) {
    return (
      <div className="bg-tertiary-container text-on-tertiary-container rounded-2xl p-4 text-center font-bold">
        Payment received! Your Pro access will activate shortly.
      </div>
    )
  }

  if (!showCheckout) {
    return (
      <Button
        variant="default"
        size="xxl"
        className={className}
        onClick={() => setShowCheckout(true)}
      >
        <span>Upgrade Now</span>
        <ArrowRight className="size-5" />
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-3">
      <CheckoutWidget
        client={client!}
        chain={polygon}
        amount="100"
        tokenAddress={USDC_POLYGON as `0x${string}`}
        seller={sellerAddress as `0x${string}`}
        name="CryptoEdy Pro — Annual"
        description="1 year of Pro access to CryptoEdy research platform"
        purchaseData={intentData}
        theme="dark"
        paymentMethods={['crypto', 'card']}
        onSuccess={() => {
          setCompleted(true)
          setShowCheckout(false)
        }}
        onCancel={() => {
          if (!inline) setShowCheckout(false)
        }}
        onError={(error) => {
          console.error('[CheckoutWidget] Payment error:', error)
        }}
      />
      {!inline && (
        <button
          type="button"
          className="text-on-surface-variant hover:text-on-surface text-body-sm underline"
          onClick={() => setShowCheckout(false)}
        >
          Cancel
        </button>
      )}
    </div>
  )
}
