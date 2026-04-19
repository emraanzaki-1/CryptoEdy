import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getBookmarkedPostIds(userId: string): Promise<Set<string>> {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'bookmarks',
    where: { userId: { equals: userId } },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const ids = new Set<string>()
  for (const doc of docs) {
    const postId =
      typeof doc.post === 'object'
        ? String((doc.post as { id: string | number }).id)
        : String(doc.post)
    ids.add(postId)
  }
  return ids
}
