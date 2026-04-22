interface VideoEmbedBlockProps {
  url: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | null
  caption?: string | null
}

const ASPECT_PADDING: Record<string, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '1:1': '100%',
}

/**
 * Converts a video page URL to an embeddable iframe URL.
 * Supports Vimeo, YouTube (watch & shorts), and falls back to the raw URL.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    // Vimeo — https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?dnt=1`
    }
    if (host === 'player.vimeo.com') {
      return url.includes('?') ? url : `${url}?dnt=1`
    }

    // YouTube — https://www.youtube.com/watch?v=ID or https://youtu.be/ID
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop()
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (host === 'youtube-nocookie.com') {
      return url
    }

    // Fallback — assume the URL is already embeddable
    return url
  } catch {
    return null
  }
}

export function VideoEmbedBlockComponent({ url, aspectRatio, caption }: VideoEmbedBlockProps) {
  const embedUrl = toEmbedUrl(url)
  const padding = ASPECT_PADDING[aspectRatio ?? '16:9'] ?? '56.25%'

  if (!embedUrl) {
    return (
      <figure className="my-8">
        <div className="border-outline-variant/15 bg-surface-container rounded-xl border p-6 text-center">
          <p className="text-on-surface-variant text-body-sm">Invalid video URL</p>
        </div>
      </figure>
    )
  }

  return (
    <figure className="my-8">
      <div
        className="border-outline-variant/15 relative overflow-hidden rounded-xl border"
        style={{ paddingBottom: padding }}
      >
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          loading="lazy"
          title={caption ?? 'Embedded video'}
        />
      </div>
      {caption && (
        <figcaption className="text-on-surface-variant text-micro mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
