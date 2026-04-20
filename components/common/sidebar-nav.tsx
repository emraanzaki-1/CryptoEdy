'use client'

import { useEffect, useState } from 'react'

interface SidebarLink {
  id: string
  num: string
  label: string
}

export function SidebarNav({ links }: { links: SidebarLink[] }) {
  const [activeId, setActiveId] = useState(links[0]?.id ?? '')

  useEffect(() => {
    const ids = links.map((l) => l.id)
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section from top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-128px 0px -60% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [links])

  return (
    <aside className="sticky top-32 hidden h-fit lg:col-span-3 lg:block">
      <nav className="space-y-6">
        <div className="text-outline text-overline font-black tracking-[0.2em] uppercase">
          Document Navigation
        </div>
        <ul className="space-y-4">
          {links.map((link) => {
            const isActive = link.id === activeId
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`flex items-center gap-3 text-sm transition-colors ${
                    isActive
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary font-medium'
                  }`}
                >
                  {link.num}{' '}
                  <span
                    className={`inline-block h-px ${isActive ? 'bg-primary/20 w-8' : 'bg-outline-variant w-4'}`}
                  />
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
