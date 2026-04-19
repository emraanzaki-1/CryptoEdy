'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { auth } from '@/lib/auth'

export async function toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const userId = session.user.id
  const numericPostId = Number(postId)
  const payload = await getPayload({ config: configPromise })

  // Check if bookmark already exists
  const { docs } = await payload.find({
    collection: 'bookmarks',
    where: {
      and: [{ userId: { equals: userId } }, { post: { equals: numericPostId } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (docs.length > 0) {
    // Remove bookmark
    await payload.delete({
      collection: 'bookmarks',
      id: docs[0].id,
      overrideAccess: true,
    })
    return { bookmarked: false }
  }

  // Create bookmark
  await payload.create({
    collection: 'bookmarks',
    data: { userId, post: numericPostId },
    overrideAccess: true,
  })
  return { bookmarked: true }
}
