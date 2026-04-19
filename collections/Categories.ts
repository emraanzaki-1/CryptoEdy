import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug'],
    listSearchableFields: ['name', 'slug'],
    description:
      'Content taxonomy with parent-child hierarchy. Top-level parents: Research, Analysis, Education. Children are the specific categories (e.g. Top Picks, Market Updates).',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Display name shown in navigation and breadcrumbs, e.g. "Top Picks".' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'URL-safe identifier, e.g. "top-picks". Used in routes like /research/top-picks. DO NOT change after publishing.',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        description:
          'Parent category for hierarchy. Leave empty for top-level categories (Research, Analysis, Education). Set to a parent for child categories (e.g. Top Picks → Research).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short description shown on category landing pages.' },
    },
  ],
}
