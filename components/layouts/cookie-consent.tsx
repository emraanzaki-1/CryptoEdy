'use client'

import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    }, 0)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'all')
    setVisible(false)
  }

  function essential() {
    localStorage.setItem(STORAGE_KEY, 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="border-outline-variant/15 bg-surface-container-lowest shadow-elevated fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-4 rounded-2xl border p-5 sm:left-auto sm:max-w-sm">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl">
          <Cookie className="text-primary size-4" />
        </div>
        <div>
          <p className="text-on-surface text-body-sm font-bold">We use cookies</p>
          <p className="text-on-surface-variant text-body-sm mt-1">
            We use cookies to keep you signed in and improve your experience. No tracking or
            advertising cookies.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={essential}
          className="text-on-surface-variant hover:bg-surface-container flex-1 rounded-full font-semibold"
        >
          Essential only
        </Button>
        <Button variant="gradient" size="sm" onClick={accept} className="flex-1 rounded-full">
          Accept all
        </Button>
      </div>
    </div>
  )
}
