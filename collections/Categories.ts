import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'slug'],
    listSearchableFields: ['name', 'slug'],
    description:
      'Content taxonomy. Slugs must match URL paths exactly — do not change without updating routes.',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Research', value: 'research' },
        { label: 'Analysis', value: 'analysis' },
        { label: 'Education', value: 'education' },
      ],
      admin: { description: 'Top-level section this category belongs to.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short description shown on category landing pages.' },
    },
  ],
}
