import type { Endpoint } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { revalidateTag } from 'next/cache'

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

export const categoryReorderEndpoint: Endpoint = {
  path: '/categories-reorder',
  method: 'post',
  handler: async (req) => {
    if (!isAdmin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await addDataAndFileToRequest(req)
    const { items } = (req.data ?? {}) as {
      items?: Array<{ id: string | number; weight: number }>
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'items array is required: [{ id, weight }]' }, { status: 400 })
    }

    // Validate all weights are non-negative integers
    for (const item of items) {
      if (typeof item.weight !== 'number' || item.weight < 0 || !Number.isInteger(item.weight)) {
        return Response.json(
          { error: `Invalid weight for id ${item.id}: must be a non-negative integer` },
          { status: 400 }
        )
      }
    }

    await Promise.all(
      items.map((item) =>
        req.payload.update({
          collection: 'categories',
          id: item.id,
          data: { weight: item.weight },
        })
      )
    )

    revalidateTag('categories', 'default')

    return Response.json({ success: true })
  },
}
