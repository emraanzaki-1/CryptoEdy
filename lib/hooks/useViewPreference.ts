'use client'

import { useSyncExternalStore, useCallback } from 'react'

type View = 'grid' | 'list'
const STORAGE_KEY = 'feed-view-preference'

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): View {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'grid' || v === 'list') return v
  } catch {
    /* SSR / unavailable */
  }
  return 'grid'
}

function getServerSnapshot(): View {
  return 'grid'
}

export function useViewPreference() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setView = useCallback((v: View) => {
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {
      /* noop */
    }
    listeners.forEach((cb) => cb())
  }, [])

  return [view, setView] as const
}
