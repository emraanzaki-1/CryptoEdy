import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedBlockNode } from '@payloadcms/richtext-lexical'

import { VideoEmbedBlockComponent } from '@/components/article/blocks/video-embed-block'

export const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    'video-embed': ({ node }: { node: SerializedBlockNode }) => {
      const fields = node.fields as unknown as {
        url: string
        aspectRatio?: '16:9' | '4:3' | '1:1' | null
        caption?: string | null
      }
      return <VideoEmbedBlockComponent {...fields} />
    },
  },
})
