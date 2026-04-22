import type { SerializedEditorState } from 'lexical'

/**
 * Truncate a Lexical SerializedEditorState to approximately `ratio` of total
 * content, slicing at block boundaries (never mid-paragraph).
 *
 * Guardrails:
 * - At least `MIN_BLOCKS` top-level blocks are always shown.
 * - At least `MIN_CHARS` characters of text are always shown.
 * - Never ends on a heading, hr, or media-only block — includes the next
 *   paragraph/list after it.
 */

const DEFAULT_RATIO = 0.55
const MIN_BLOCKS = 2
const MIN_CHARS = 200
// Non-text blocks (images, embeds, tables, etc.) get a default char weight
const NON_TEXT_BLOCK_WEIGHT = 120

type AnyNode = Record<string, unknown>

/** Recursively count visible characters in a node tree. */
function countChars(node: AnyNode): number {
  // Text leaf node
  if (node.type === 'text' && typeof node.text === 'string') {
    return (node.text as string).length
  }

  // Nodes with children
  if (Array.isArray(node.children)) {
    return (node.children as AnyNode[]).reduce((sum, child) => sum + countChars(child), 0)
  }

  // Non-text blocks without children (image, embed, hr, etc.)
  return NON_TEXT_BLOCK_WEIGHT
}

/** Whether a block is "non-content" (heading, hr, image-only) — bad to end on. */
function isBadEndingBlock(node: AnyNode): boolean {
  const type = node.type as string
  if (type === 'heading' || type === 'horizontalrule') return true
  // Image/upload block with no text content
  if (
    (type === 'upload' || type === 'image' || type === 'block') &&
    countChars(node) <= NON_TEXT_BLOCK_WEIGHT
  ) {
    return true
  }
  return false
}

/**
 * Truncate editor state to ~`ratio` of total content at block boundaries.
 * Returns `null` if truncation isn't meaningful (article too short or ratio
 * would include all content).
 */
export function truncateEditorState(
  state: SerializedEditorState,
  ratio: number = DEFAULT_RATIO
): SerializedEditorState | null {
  const root = state.root as AnyNode
  const blocks = root.children as AnyNode[]

  if (!blocks || blocks.length === 0) return null

  // Count total chars
  const totalChars = blocks.reduce((sum, block) => sum + countChars(block), 0)
  const targetChars = Math.max(totalChars * ratio, MIN_CHARS)

  // If article is very short (≤ MIN_BLOCKS blocks), don't truncate
  if (blocks.length <= MIN_BLOCKS) return null

  let accumulated = 0
  let cutIndex = 0

  for (let i = 0; i < blocks.length; i++) {
    accumulated += countChars(blocks[i])
    cutIndex = i + 1

    if (accumulated >= targetChars && cutIndex >= MIN_BLOCKS) {
      break
    }
  }

  // If we'd show everything, no truncation needed
  if (cutIndex >= blocks.length) return null

  // Don't end on a heading, hr, or media-only block — extend
  while (cutIndex < blocks.length && isBadEndingBlock(blocks[cutIndex - 1])) {
    cutIndex++
  }

  if (cutIndex >= blocks.length) return null

  // Deep clone the truncated portion
  const truncated = JSON.parse(JSON.stringify(state)) as SerializedEditorState
  const truncatedRoot = truncated.root as AnyNode
  ;(truncatedRoot.children as AnyNode[]) = (truncatedRoot.children as AnyNode[]).slice(0, cutIndex)

  return truncated
}
