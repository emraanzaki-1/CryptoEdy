import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'

const preventDuplicateBookmark: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if (operation !== 'create') return data

  const existing = await req.payload.find({
    collection: 'bookmarks',
    where: {
      and: [{ userId: { equals: data.userId } }, { post: { equals: data.post } }],
    },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    throw new Error('Already bookmarked')
  }

  return data
}

export const Bookmarks: CollectionConfig = {
  slug: 'bookmarks',
  admin: {
    useAsTitle: 'userId',
    defaultColumns: ['userId', 'post', 'createdAt'],
    description: 'User bookmarks — maps app users to saved posts.',
    hidden: true,
  },
  access: {
    read: () => true,
    create: () => true,
    delete: () => true,
    update: () => false,
  },
  hooks: {
    beforeChange: [preventDuplicateBookmark],
  },
  fields: [
    {
      name: 'userId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'The app user UUID who bookmarked this post.' },
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      admin: { description: 'The bookmarked post.' },
    },
  ],
}
