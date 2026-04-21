'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function check() {
      const scrollable = document.documentElement.scrollHeight > window.innerHeight
      const scrolled = window.scrollY > 400
      setVisible(scrollable && scrolled)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  if (!visible) return null

  return (
    <Button
      size="icon"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="bg-inverse-surface text-inverse-on-surface fixed right-6 bottom-6 z-50 size-10 rounded-full shadow-lg hover:opacity-90"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </Button>
  )
}
