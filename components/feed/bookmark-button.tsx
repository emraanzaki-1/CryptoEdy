'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bookmark } from 'lucide-react'
import { toggleBookmark } from '@/lib/bookmarks/actions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
  variant: 'card' | 'article'
}

export function BookmarkButton({ postId, initialBookmarked, variant }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const prev = isBookmarked
    setIsBookmarked(!prev)

    startTransition(async () => {
      try {
        const result = await toggleBookmark(postId)
        setIsBookmarked(result.bookmarked)
        // Refresh the page when unbookmarking from the saved page
        if (!result.bookmarked && pathname === '/saved') {
          router.refresh()
        }
      } catch {
        setIsBookmarked(prev)
      }
    })
  }

  if (variant === 'article') {
    return (
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={handleClick}
        disabled={isPending}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        className={cn(
          'border-outline-variant/15 bg-surface hover:bg-surface-container-low size-10 rounded-full border',
          isBookmarked ? 'text-primary' : 'text-on-surface-variant'
        )}
      >
        <Bookmark className={cn('size-5', isBookmarked && 'fill-current')} />
      </Button>
    )
  }

  // card variant — used in both grid and list cards
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      className={cn(
        'absolute top-3 right-3 rounded-full backdrop-blur-sm transition-opacity',
        isBookmarked
          ? 'bg-primary/80 text-on-primary opacity-100'
          : 'bg-on-surface/40 text-on-primary hover:bg-on-surface/60 opacity-0 group-hover:opacity-100'
      )}
    >
      <Bookmark className={cn('size-4', isBookmarked && 'fill-current')} />
    </Button>
  )
}
