import type {
  CollectionConfig,
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from 'payload'
import { onPostPublished } from '../lib/notifications/events'
import { richTextEditor } from '../lib/lexical/richEditor'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>

  if (n.type === 'text' && typeof n.text === 'string') return n.text
  if (n.root) return extractTextFromLexical(n.root)
  if (Array.isArray(n.children)) return n.children.map(extractTextFromLexical).join(' ')
  return ''
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

const autoReadTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data.content) {
    const text = extractTextFromLexical(data.content)
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length
    data.readTime = Math.ceil(wordCount / 200) || 1
  }
  return data
}

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

// Auto-set publishedAt when status first transitions to 'published'
const autoPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const wasNotPublished = originalDoc?.status !== 'published'
  const isNowPublished = data.status === 'published'
  if (wasNotPublished && isNowPublished && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}

// Analysts cannot self-publish or unpublish — only admins can move status to/from published.
const guardStatusTransition: CollectionBeforeChangeHook = ({ data, req, originalDoc, context }) => {
  if (context?.skipStatusGuard) return data

  const userRole = req.user?.role as string | undefined
  const newStatus = data.status as string | undefined
  const currentStatus = (originalDoc?.status as string | undefined) ?? 'draft'

  if (!newStatus || newStatus === currentStatus) return data

  if (newStatus === 'published' && userRole !== 'admin') {
    throw new Error('Only admins can publish posts.')
  }

  if (currentStatus === 'published' && newStatus === 'draft' && userRole !== 'admin') {
    throw new Error('Only admins can unpublish posts.')
  }

  return data
}

const firePublishedEvent: CollectionAfterChangeHook = async ({ doc, previousDoc }) => {
  const justPublished =
    (previousDoc?.status !== 'published' || !previousDoc) && doc.status === 'published'
  if (justPublished) {
    await onPostPublished(doc as Record<string, unknown>)
  }
}

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'isProOnly', 'publishedAt', 'author'],
    listSearchableFields: ['title', 'excerpt'],
    description: 'All platform content — research reports, analysis, and education articles.',
    // Live preview — renders the article page in an iframe while editing.
    // The Next.js preview route is built in Sprint 4.
    livePreview: {
      url: ({ data }) => {
        const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
        return `${base}/preview/posts/${data.slug ?? 'draft'}`
      },
    },
  },
  // Version history with auto-saving drafts every 2 seconds.
  // Gives authors full undo history + prevents accidental content loss.
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [autoSlugOnCreate, autoReadTime, autoPublishedAt, guardStatusTransition],
    afterChange: [firePublishedEvent],
  },
  access: {
    // Published posts are public; draft/review only for authenticated editors
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: { equals: 'published' },
        publishedAt: { less_than_equal: new Date().toISOString() },
      }
    },
    create: ({ req }) => ['analyst', 'admin'].includes(req.user?.role as string),
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      if (req.user.role === 'analyst') {
        return { author: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    // ---- Core ----
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Article headline. Keep under 100 characters for best SEO.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description:
          'Short summary shown on feed cards and search results. Also auto-populates the SEO description. Max 200 chars.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: richTextEditor,
      admin: {
        description:
          'Full article body. Use the + button to insert charts, price targets, callouts, and performance tables.',
      },
    },
    // ---- Sidebar: Publishing ----
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Workflow: Analyst moves draft → review. Admin publishes from review. Admin can unpublish to draft.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description:
          'Auto-set when first published. Set a future date to schedule — post goes live when this date passes.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'isProOnly',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description:
          'Default ON — most content is Pro-gated. Uncheck explicitly to publish as free content.',
      },
    },

    // ---- Sidebar: Attribution ----
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'CMS author of this post. Shown on the byline.',
      },
    },

    // ---- Sidebar: Taxonomy ----
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Primary content category. Determines URL path and feed filter pill.',
        components: {
          Field: '@/components/admin/fields/GroupedCategorySelect',
        },
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Optional tags for search and related content matching, e.g. Ethereum, DeFi.',
      },
    },

    // ---- Sidebar: Media ----
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description:
          'Required before publishing. Use the hero size (1600×900). Alt text must be filled in on upload.',
      },
    },

    // ---- Sidebar: Research-specific ----
    {
      name: 'riskRating',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Speculative', value: 'speculative' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Risk badge on pick cards. Only shown for Top Picks and Deep Dives — leave blank for analysis/education.',
      },
    },

    // ---- Sidebar: Computed / System ----
    {
      name: 'readTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-calculated: word count ÷ 200, rounded up. Not manually editable.',
        condition: (data) => !!data.content,
      },
    },

    // ---- Sidebar: URL ----
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        description:
          'Auto-generated from title on creation. Changing after publishing breaks URLs and SEO — edit with care.',
      },
    },
  ],
}
