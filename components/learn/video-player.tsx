'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  title?: string
  lessonLabel?: string
}

/**
 * Generic video embed that auto-detects Vimeo vs Bunny from URL pattern.
 * Shows a play overlay initially, then reveals the iframe on click.
 */
export function VideoPlayer({ url, title, lessonLabel }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="bg-surface-container-low flex flex-col items-center justify-center gap-3 rounded-xl p-8 text-center">
        <p className="text-on-surface-variant text-sm">Unable to embed this video.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 text-sm font-medium underline"
        >
          Open video in new tab
        </a>
      </div>
    )
  }

  const autoplayUrl = isPlaying ? appendAutoplay(embedUrl) : embedUrl

  return (
    <div className="bg-surface-container-high group relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl shadow-sm">
      <iframe
        src={autoplayUrl}
        title={title ?? 'Video lesson'}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />

      {/* Play overlay */}
      {!isPlaying && (
        <div
          className="bg-on-surface/40 hover:bg-on-surface/30 absolute inset-0 z-10 flex items-center justify-center transition-all"
          onClick={() => setIsPlaying(true)}
        >
          <div className="bg-primary flex h-20 w-20 transform items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110">
            <Play className="h-9 w-9" fill="currentColor" />
          </div>

          {/* Bottom gradient metadata */}
          {lessonLabel && (
            <div className="from-on-surface/80 absolute right-0 bottom-0 left-0 bg-gradient-to-t to-transparent p-6">
              <p className="text-sm font-medium text-white">{lessonLabel}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null

  if (url.includes('player.vimeo.com') || url.includes('iframe.mediadelivery.net')) {
    return url
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  const bunnyMatch = url.match(/video\.bunnycdn\.com\/play\/(\d+)\/([a-f0-9-]+)/)
  if (bunnyMatch) {
    return `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}`
  }

  return url
}

function appendAutoplay(url: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}autoplay=1`
}
