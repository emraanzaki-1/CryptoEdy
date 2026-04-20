import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'

const autoSlugOnCreate: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && !data.slug && data.title) {
    data.slug = (data.title as string)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }
  return data
}

export const Modules: CollectionConfig = {
  slug: 'modules',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'course', 'order', 'status'],
    listSearchableFields: ['title', 'slug'],
    description: 'Course modules — logical groupings of lessons within a course.',
  },
  hooks: {
    beforeChange: [autoSlugOnCreate],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
    create: ({ req }) => ['analyst', 'admin'].includes(req.user?.role as string),
    update: ({ req }) => ['analyst', 'admin'].includes(req.user?.role as string),
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Module title, e.g. "Introduction to Chart Patterns".' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier. Auto-generated from title on creation.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description shown in the course outline.' },
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
      admin: { description: 'The course this module belongs to.' },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order within the course. Lower = first.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Only published modules are visible to users.',
      },
    },
  ],
}
