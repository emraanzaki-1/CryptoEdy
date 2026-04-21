'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Supports both window-level scroll (guest pages) and overflow container
 * scroll (dashboard pages with #main-scroll).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  const findContainer = useCallback(() => document.getElementById('main-scroll'), [])

  useEffect(() => {
    // Retry until the container appears (dashboard layout is async)
    let container = findContainer()
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    function check() {
      if (container) {
        const scrollable = container.scrollHeight > container.clientHeight
        const scrolled = container.scrollTop > 400
        setVisible(scrollable && scrolled)
      } else {
        const scrollable = document.documentElement.scrollHeight > window.innerHeight
        const scrolled = window.scrollY > 400
        setVisible(scrollable && scrolled)
      }
    }

    function attach() {
      const scrollTarget = container ?? window
      scrollTarget.addEventListener('scroll', check, { passive: true })
      window.addEventListener('resize', check, { passive: true })
      check()
    }

    function detach() {
      const scrollTarget = container ?? window
      scrollTarget.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }

    if (!container) {
      // Dashboard layout is async — retry a few times
      let attempts = 0
      const tryFind = () => {
        container = findContainer()
        if (container || attempts >= 10) {
          attach()
          return
        }
        attempts++
        retryTimer = setTimeout(tryFind, 200)
      }
      tryFind()
    } else {
      attach()
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer)
      detach()
    }
  }, [findContainer])

  function scrollToTop() {
    const container = findContainer()
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!visible) return null

  return (
    <Button
      size="icon"
      onClick={scrollToTop}
      className="bg-inverse-surface text-inverse-on-surface fixed right-6 bottom-6 z-50 size-10 rounded-full shadow-lg hover:opacity-90"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </Button>
  )
}
