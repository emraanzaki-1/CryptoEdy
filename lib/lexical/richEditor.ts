import {
  lexicalEditor,
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { CalloutBlock } from '../../collections/blocks/CalloutBlock'
import { ChartEmbedBlock } from '../../collections/blocks/ChartEmbedBlock'
import { PerformanceTableBlock } from '../../collections/blocks/PerformanceTableBlock'
import { PriceTargetBlock } from '../../collections/blocks/PriceTargetBlock'

/**
 * Full-featured Lexical editor for CryptoEdy content authors.
 *
 * Features included:
 *   Typography  — H2–H4, Bold, Italic, Underline, Strikethrough, Inline Code
 *   Structure   — Ordered list, Unordered list, Checklist, Blockquote, HR, Indent, Align
 *   Media       — Inline image/media upload with caption field
 *   Links       — Internal + external hyperlinks with rel/target controls
 *   Toolbars    — Fixed toolbar (always visible) + Inline toolbar (on text select)
 *
 *   Custom crypto blocks (inserted via the + block menu):
 *     💡 Callout          — insight / warning / tip / data highlight box
 *     🎯 Price Target     — structured pick card (entry, target, stop-loss, risk)
 *     📈 Chart Embed      — TradingView chart widget (ticker, interval, theme)
 *     📊 Performance Table — historical track record table with open/closed picks
 */
export const richTextEditor = lexicalEditor({
  features: [
    // ----- Toolbars -----
    FixedToolbarFeature(),
    InlineToolbarFeature(),

    // ----- Typography -----
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    InlineCodeFeature(),

    // ----- Lists & Structure -----
    OrderedListFeature(),
    UnorderedListFeature(),
    ChecklistFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    IndentFeature(),
    AlignFeature(),

    // ----- Links -----
    LinkFeature({
      enabledCollections: ['posts'],
    }),

    // ----- Inline media -----
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'caption',
              type: 'text',
              admin: { description: 'Optional caption displayed below the image.' },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'card',
              options: [
                { label: 'Thumbnail (300×200)', value: 'thumbnail' },
                { label: 'Card (800×533)', value: 'card' },
                { label: 'Hero / Full-width (1600×900)', value: 'hero' },
              ],
              admin: { description: 'Which pre-generated image size to render.' },
            },
          ],
        },
      },
    }),

    // ----- Custom crypto blocks -----
    BlocksFeature({
      blocks: [CalloutBlock, PriceTargetBlock, ChartEmbedBlock, PerformanceTableBlock],
    }),
  ],
})
