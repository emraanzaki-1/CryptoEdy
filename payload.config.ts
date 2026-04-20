import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { customType } from 'drizzle-orm/pg-core'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { FAQs } from './collections/FAQs'
import { Courses } from './collections/Courses'
import { Modules } from './collections/Modules'
import { Lessons } from './collections/Lessons'
import { richTextEditor } from './lib/lexical/richEditor'
import { adminUserEndpoints } from './lib/api/admin-users'
import { adminSubscriberEndpoints } from './lib/api/admin-subscribers'
import { categoryReorderEndpoint } from './lib/api/category-reorder'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Custom tsvector column type for full-text search
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

export default buildConfig({
  admin: {
    // Authors collection has auth: true — these are the CMS editor accounts
    user: 'authors',
    // 'all' lets each editor pick Light / Dark via avatar → Account → Theme.
    theme: 'all',
    // Live preview breakpoints shown in the admin iframe toolbar
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      beforeDashboard: ['@/components/admin/AdminDashboard'],
      afterNavLinks: ['@/components/admin/AdminNavLinks'],
      views: {
        userManagement: {
          Component: '@/components/admin/views/UserManagement',
          path: '/user-management',
          meta: {
            title: 'App Users',
            description: 'Manage application user roles and subscriptions',
          },
        },
        userManagementEdit: {
          Component: '@/components/admin/views/UserManagementEdit',
          path: '/user-management/:id',
          meta: {
            title: 'Edit App User',
            description: 'Edit application user details',
          },
        },
        subscriberManagement: {
          Component: '@/components/admin/views/SubscriberManagement',
          path: '/subscribers',
          meta: {
            title: 'Subscribers',
            description: 'View marketing email subscribers',
          },
        },
      },
    },
  },
  endpoints: [...adminUserEndpoints, ...adminSubscriberEndpoints, categoryReorderEndpoint],
  collections: [Authors, Categories, Tags, Media, Posts, FAQs, Courses, Modules, Lessons],
  // Rich Lexical editor is the global default for all richText fields.
  // Posts.content overrides with the same editor (with custom crypto blocks).
  editor: richTextEditor,
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Use a dedicated 'payload' schema so CMS tables are isolated from
    // the NextAuth/Drizzle tables that live in the default 'public' schema.
    schemaName: 'payload',
    afterSchemaInit: [
      ({ extendTable, schema }) => {
        if (schema.tables.posts) {
          extendTable({
            table: schema.tables.posts,
            columns: {
              search_vector: tsvector('search_vector'),
            },
          })
        }
        return schema
      },
    ],
  }),
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      // Auto-populate SEO fields from post data
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title as string} | CryptoEdy` : 'CryptoEdy'),
      generateDescription: ({ doc }) => (doc?.excerpt as string) ?? '',
      generateURL: ({ doc }) => {
        const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
        return `${base}/posts/${(doc?.slug as string) ?? ''}`
      },
    }),
  ],
  sharp,
})
