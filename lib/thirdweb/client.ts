import { createThirdwebClient } from 'thirdweb'

/**
 * Shared thirdweb client — used by React widgets (browser-side).
 * Lazily initialized to avoid crashing when env vars aren't set
 * (e.g. during build or in non-payment pages).
 */
let _client: ReturnType<typeof createThirdwebClient> | null = null

export function getThirdwebClient() {
  if (_client) return _client

  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Configure it in .env.local to enable payments.'
    )
  }

  _client = createThirdwebClient({ clientId })
  return _client
}
