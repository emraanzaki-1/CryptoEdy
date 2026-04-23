import { auth } from '@/lib/auth'
import { addConnection } from '@/lib/notifications/emitter'

export const dynamic = 'force-dynamic'

interface CleanupRefs {
  cleanup: () => void
  keepAlive: ReturnType<typeof setInterval>
}

const controllerCleanup = new WeakMap<ReadableStreamDefaultController, CleanupRefs>()

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

      controllerCleanup.set(controller, { cleanup, keepAlive })
    },

    cancel(controller) {
      const refs = controllerCleanup.get(controller as ReadableStreamDefaultController)
      if (refs) {
        refs.cleanup()
        clearInterval(refs.keepAlive)
        controllerCleanup.delete(controller as ReadableStreamDefaultController)
      }
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
