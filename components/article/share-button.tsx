'use client'

import { useState } from 'react'
import { Share, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title: string
  slug: string
}

export function ShareButton({ title, slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const url = `${window.location.origin}/articles/${slug}`

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // User cancelled — do nothing
        return
      }
    }

    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={copied ? 'Link copied' : 'Share'}
      className={cn(
        'border-outline-variant/15 bg-surface hover:bg-surface-container-low flex size-10 items-center justify-center rounded-full border transition-colors',
        copied ? 'text-primary' : 'text-on-surface-variant'
      )}
    >
      {copied ? <Check className="size-5" /> : <Share className="size-5" />}
    </button>
  )
}
