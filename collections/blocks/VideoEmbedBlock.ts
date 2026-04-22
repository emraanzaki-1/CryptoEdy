import type { Block } from 'payload'

// Embeds a third-party video (Vimeo, YouTube, etc.) inline in the article body.
// The URL is converted to an embeddable iframe URL at render time.
export const VideoEmbedBlock: Block = {
  slug: 'video-embed',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'Paste the video URL from Vimeo, YouTube, or other supported platforms. e.g. https://vimeo.com/123456789',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16:9',
      options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '4:3 (Standard)', value: '4:3' },
        { label: '1:1 (Square)', value: '1:1' },
      ],
      admin: { description: 'Video aspect ratio.' },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Optional caption displayed below the video.' },
    },
  ],
}
