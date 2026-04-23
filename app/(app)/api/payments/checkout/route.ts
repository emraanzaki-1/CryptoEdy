import { auth } from '@/lib/auth'
import { getActiveProvider } from '@/lib/payments/providers'
import { checkCsrf } from '@/lib/auth/csrf'

/**
 * POST /api/payments/checkout
 * Creates a checkout session with the active payment provider.
 * Requires authentication.
 */
export async function POST(request: Request) {
  const csrf = checkCsrf(request)
  if (csrf) return csrf

  const session = await auth()

  if (!session?.user?.id || !session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const provider = getActiveProvider()
    const result = await provider.createCheckout({
      userId: session.user.id,
      userEmail: session.user.email,
    })

    return Response.json({
      provider: provider.name,
      ...result,
    })
  } catch (err) {
    console.error('[checkout] Failed to create checkout:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
