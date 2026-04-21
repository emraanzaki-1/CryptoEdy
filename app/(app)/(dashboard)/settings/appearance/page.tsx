'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { cn } from '@/lib/utils'

const THEMES = [
  {
    value: 'light',
    name: 'Light',
    description: 'Classic light interface with high readability',
    icon: Sun,
    preview: (
      <div className="bg-surface-bright flex h-full flex-col gap-1.5 rounded-lg p-3">
        <div className="flex gap-1.5">
          <div className="bg-primary h-2 w-2 rounded-full" />
          <div className="bg-on-surface h-2 w-12 rounded" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <div className="bg-surface-container-low w-8 rounded" />
          <div className="bg-surface-container-lowest flex flex-1 flex-col gap-1 rounded p-1.5">
            <div className="bg-surface-container-high h-1.5 w-full rounded" />
            <div className="bg-surface-container-high h-1.5 w-4/5 rounded" />
            <div className="bg-surface-container mt-1 h-1.5 w-3/5 rounded" />
          </div>
        </div>
        <div className="bg-primary h-2 w-full rounded" />
      </div>
    ),
  },
  {
    value: 'dark',
    name: 'Dark',
    description: 'High-contrast dark mode for low-light environments',
    icon: Moon,
    preview: (
      <div className="dark bg-surface flex h-full flex-col gap-1.5 rounded-lg p-3">
        <div className="flex gap-1.5">
          <div className="bg-primary h-2 w-2 rounded-full" />
          <div className="bg-on-surface h-2 w-12 rounded" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <div className="bg-surface-container-low w-8 rounded" />
          <div className="bg-surface-container flex flex-1 flex-col gap-1 rounded p-1.5">
            <div className="bg-surface-container-high h-1.5 w-full rounded" />
            <div className="bg-surface-container-high h-1.5 w-4/5 rounded" />
            <div className="bg-surface-container-highest mt-1 h-1.5 w-3/5 rounded" />
          </div>
        </div>
        <div className="bg-primary h-2 w-full rounded" />
      </div>
    ),
  },
  {
    value: 'system',
    name: 'System',
    description: 'Automatically matches your OS appearance setting',
    icon: Monitor,
    preview: (
      <div className="flex h-full overflow-hidden rounded-lg">
        {/* Left half — light */}
        <div className="bg-surface-bright flex flex-1 flex-col gap-1.5 p-3">
          <div className="bg-on-surface h-2 w-8 rounded" />
          <div className="bg-surface-container-low flex-1 rounded" />
          <div className="bg-primary h-2 w-full rounded" />
        </div>
        {/* Right half — dark */}
        <div className="dark bg-surface flex flex-1 flex-col gap-1.5 p-3">
          <div className="bg-on-surface h-2 w-8 rounded" />
          <div className="bg-surface-container flex-1 rounded" />
          <div className="bg-primary h-2 w-full rounded" />
        </div>
      </div>
    ),
  },
] as const

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <>
      <SectionHeading as="h2" subtitle="Customize the look and feel of the CryptoEdy platform.">
        Appearance
      </SectionHeading>

      <div className="space-y-10">
        <section>
          <SectionHeading variant="subsection">Interface Theme</SectionHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {THEMES.map((t) => {
              const Icon = t.icon
              const isSelected = mounted && theme === t.value

              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200',
                    isSelected
                      ? 'border-primary/40 ring-primary/20 ring-2 ring-inset'
                      : 'border-outline-variant/15 hover:border-outline-variant/30'
                  )}
                >
                  {/* Preview */}
                  <div className="aspect-[16/9] w-full overflow-hidden">{t.preview}</div>

                  {/* Label */}
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex aspect-square size-8 shrink-0 items-center justify-center rounded-full',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-container text-on-surface-variant'
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-body-sm font-semibold',
                            isSelected ? 'text-primary' : 'text-on-surface'
                          )}
                        >
                          {t.name}
                        </p>
                        <p className="text-on-surface-variant text-micro mt-0.5">{t.description}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="bg-primary flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Check className="text-on-primary size-3" />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {!mounted && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container h-48 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
