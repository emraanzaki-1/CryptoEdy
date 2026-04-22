'use client'

import { ThirdwebProvider as TWProvider } from 'thirdweb/react'

/**
 * Scoped wrapper for thirdweb React context.
 * Only loaded in routes that need wallet/payment widgets (e.g. settings).
 */
export function ThirdwebAppProvider({ children }: { children: React.ReactNode }) {
  return <TWProvider>{children}</TWProvider>
}
