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

export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    group: 'Education',
    useAsTitle: 'title',
    defaultColumns: ['title', 'difficulty', 'status', 'isProOnly', 'order'],
    listSearchableFields: ['title', 'slug'],
    description: 'Trading courses with structured modules and lessons.',
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
      admin: { description: 'Course title shown in listings and detail pages.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'URL-safe identifier, e.g. "crypto-trading-101". Used in /learn/courses/[slug].',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 300,
      admin: { description: 'Short summary shown on course cards. Max 300 chars.' },
    },
    {
      name: 'description',
      type: 'richText',
      admin: { description: 'Full course description shown on the course detail page.' },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Course cover image for cards and detail page header.' },
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      defaultValue: 'beginner',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Difficulty level shown as a badge on course cards.',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Estimated total time, e.g. "6 hours" or "3 weeks".',
      },
    },
    {
      name: 'isProOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Require Pro subscription to enroll. Free preview lessons are still accessible.',
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
        description: 'Only published courses are visible to users.',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order in course listing. Lower = first.',
      },
    },
  ],
}
