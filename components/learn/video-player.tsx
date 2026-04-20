'use client'

interface VideoPlayerProps {
  url: string
  title?: string
}

/**
 * Generic video embed that auto-detects Vimeo vs Bunny from URL pattern.
 */
export function VideoPlayer({ url, title }: VideoPlayerProps) {
  // Normalize URL to an embeddable format
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return null
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={embedUrl}
        title={title ?? 'Video lesson'}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null

  // Already an embed URL
  if (url.includes('player.vimeo.com') || url.includes('iframe.mediadelivery.net')) {
    return url
  }

  // Vimeo: https://vimeo.com/123456789 → https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // Bunny: https://video.bunnycdn.com/play/{libraryId}/{videoId}
  // → https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
  const bunnyMatch = url.match(/video\.bunnycdn\.com\/play\/(\d+)\/([a-f0-9-]+)/)
  if (bunnyMatch) {
    return `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}`
  }

  // Fallback: treat as direct embed URL
  return url
}
