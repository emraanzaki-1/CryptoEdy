import { getPlaiceholder } from 'plaiceholder'

/**
 * Generates a base64-encoded blur placeholder for a single image URL.
 * Server-only — uses sharp under the hood.
 */
export async function getBlurDataUrl(imageUrl: string): Promise<string | undefined> {
  if (!imageUrl) return undefined
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return undefined
    const buffer = Buffer.from(await res.arrayBuffer())
    const { base64 } = await getPlaiceholder(buffer, { size: 10 })
    return base64
  } catch {
    return undefined
  }
}

/**
 * Batch-generates blur placeholders for an array of image URLs.
 * Returns a map of imageUrl → base64 string. Failed URLs are omitted.
 */
export async function getBlurDataUrls(imageUrls: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(imageUrls.filter(Boolean))]
  const results = await Promise.allSettled(
    unique.map(async (url) => ({ url, blur: await getBlurDataUrl(url) }))
  )
  const map: Record<string, string> = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.blur) {
      map[r.value.url] = r.value.blur
    }
  }
  return map
}
