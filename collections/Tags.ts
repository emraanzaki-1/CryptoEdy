import type { CollectionConfig } from 'payload'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
    listSearchableFields: ['name', 'slug'],
    description: 'Freeform metadata tags used for search and related content matching.',
  },
  access: {
    read: () => true,
    create: ({ req }) => ['analyst', 'admin'].includes(req.user?.role as string),
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Tag label shown on articles, e.g. "Ethereum".' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe slug, e.g. "ethereum". Auto-populate from name.' },
    },
  ],
}
