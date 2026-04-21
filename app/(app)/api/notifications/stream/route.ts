import { auth } from '@/lib/auth'
import { addConnection } from '@/lib/notifications/emitter'

export const dynamic = 'force-dynamic'

/**
 * SSE endpoint — keeps a long-lived connection open and pushes
 * notification events to the authenticated user in real time.
 */
export async function GET(): Promise<Response> {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Send initial connected event
      controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`))

      // Register this connection
      const cleanup = addConnection(userId, controller)

      // Keep-alive ping every 25s to prevent proxy/browser timeout
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`))
        } catch {
          clearInterval(keepAlive)
        }
      }, 25_000)

      // Store cleanup refs so cancel() can use them
      ;(controller as unknown as Record<string, unknown>).__cleanup = cleanup
      ;(controller as unknown as Record<string, unknown>).__keepAlive = keepAlive
    },

    cancel(controller) {
      const ctrl = controller as unknown as Record<string, unknown>
      if (typeof ctrl.__cleanup === 'function') ctrl.__cleanup()
      if (ctrl.__keepAlive) clearInterval(ctrl.__keepAlive as ReturnType<typeof setInterval>)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
