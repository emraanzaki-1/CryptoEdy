import type { CollectionConfig } from 'payload'

// Payload's CMS editor accounts — separate from NextAuth app users.
// Only these accounts can log into /admin.
export const Authors: CollectionConfig = {
  slug: 'authors',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'displayName', 'role'],
    listSearchableFields: ['email', 'displayName'],
    description: 'CMS editor accounts. Analysts draft content; admins publish it.',
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req, id }) => {
      if (req.user?.role === 'admin') return true
      // Editors can update their own profile
      return req.user?.id === id
    },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      admin: { description: 'Public name shown on article bylines.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'analyst',
      options: [
        { label: 'Analyst', value: 'analyst' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: {
        description:
          'Analyst: can create posts and submit for review. Admin: can publish and manage all content.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: { description: 'Short bio displayed on article pages. Keep under 200 characters.' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Profile picture. Max 5MB, square crop recommended.' },
    },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          admin: { description: 'Twitter/X handle including @, e.g. @cryptoedy.' },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: { description: 'Full LinkedIn profile URL.' },
        },
      ],
    },
  ],
}
