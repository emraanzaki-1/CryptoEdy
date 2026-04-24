/**
 * In-process notification event emitter.
 * Holds per-user SSE connections and pushes events when notifications are created.
 */

type SseController = ReadableStreamDefaultController<Uint8Array>

const encoder = new TextEncoder()

interface UserConnection {
  controller: SseController
  userId: string
}

const connections = new Map<string, Set<UserConnection>>()

const MAX_CONNECTIONS_PER_USER = 5

/** Register an SSE connection for a user. Returns a cleanup function. */
export function addConnection(userId: string, controller: SseController): () => void {
  const conn: UserConnection = { controller, userId }

  if (!connections.has(userId)) {
    connections.set(userId, new Set())
  }
  const set = connections.get(userId)!

  // Evict oldest connections if limit exceeded
  while (set.size >= MAX_CONNECTIONS_PER_USER) {
    const oldest = set.values().next().value
    if (oldest) {
      try {
        oldest.controller.close()
      } catch {
        // Already closed
      }
      set.delete(oldest)
    }
  }

  set.add(conn)

  return () => {
    const s = connections.get(userId)
    if (s) {
      s.delete(conn)
      if (s.size === 0) connections.delete(userId)
    }
  }
}

/** Send an SSE event to all connections for a given user. */
export function emitToUser(userId: string, event: string, data: unknown): void {
  const set = connections.get(userId)
  if (!set || set.size === 0) return

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  const encoded = encoder.encode(payload)

  for (const conn of set) {
    try {
      conn.controller.enqueue(encoded)
    } catch {
      // Connection closed — will be cleaned up by the stream cancel callback
      set.delete(conn)
    }
  }
}

/** Send an SSE event to multiple users (for broadcasts). */
export function emitToUsers(userIds: string[], event: string, data: unknown): void {
  for (const uid of userIds) {
    emitToUser(uid, event, data)
  }
}
