import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { richTextEditor } from '../lib/lexical/richEditor'

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

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'module', 'order', 'status', 'isFreePreview'],
    listSearchableFields: ['title', 'slug'],
    description: 'Individual lessons within a module. Supports rich text and video.',
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
      admin: { description: 'Lesson title, e.g. "What Is a Candlestick?".' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL-safe identifier. Used in /learn/courses/[course]/[lesson].' },
    },
    {
      name: 'module',
      type: 'relationship',
      relationTo: 'modules',
      required: true,
      admin: { description: 'The module this lesson belongs to.' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: richTextEditor,
      admin: { description: 'Lesson body. Same editor as Posts — supports all blocks.' },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description:
          'Video embed URL (Vimeo or Bunny). Leave empty for text-only lessons. Example: https://player.vimeo.com/video/123456789',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated reading/watching time in minutes.',
      },
    },
    {
      name: 'isFreePreview',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Allow non-Pro users to preview this lesson even in a Pro-only course.',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order within the module. Lower = first.',
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
        description: 'Only published lessons are visible to users.',
      },
    },
  ],
}
