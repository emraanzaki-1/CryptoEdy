import { createThirdwebClient } from 'thirdweb'

/**
 * Shared thirdweb client — used by both React widgets (browser) and
 * server-side utilities.
 *
 * In the browser the client ID is used (public, domain-restricted).
 * On the server the secret key is also available for API calls.
 */
export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})
