import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  defaultSort: 'weight',
  hooks: {
    afterChange: [
      () => {
        revalidateTag('categories', 'max')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('categories', 'max')
      },
    ],
  },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'slug', 'weight'],
    listSearchableFields: ['name', 'slug'],
    description:
      'Content taxonomy with parent-child hierarchy. Top-level parents: Research, Analysis, Education. Children are the specific categories (e.g. Top Picks, Market Updates).',
    components: {
      views: {
        list: {
          Component: '@/components/admin/views/CategoriesListView',
        },
      },
    },
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
        components: {
          Field: '@/components/admin/fields/GroupedParentSelect',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short description shown on category landing pages.' },
    },
    {
      name: 'routePrefix',
      type: 'text',
      admin: {
        position: 'sidebar',
        description:
          'URL prefix for this parent category\'s hub page, e.g. "research" or "analysis". Child links become /{routePrefix}/{childSlug}. Leave blank for categories that use custom routes (e.g. Education → /learn).',
        condition: (data) => !data.parent,
      },
    },
    {
      name: 'excludeFromMainFeed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'When enabled, posts in this category (and all its children) are excluded from the main /feed page. Use for sections with a dedicated hub (e.g. Education → /learn).',
        condition: (data) => !data.parent,
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'When disabled, this category and all its children are hidden from the front-end. Content tagged with disabled categories returns 404.',
      },
    },
    {
      name: 'weight',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Ordering weight within its level (managed via drag-and-drop in the list view). Lower = higher priority.',
      },
    },
  ],
}
