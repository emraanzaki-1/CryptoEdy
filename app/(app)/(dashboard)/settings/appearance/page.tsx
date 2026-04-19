'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  {
    value: 'light',
    name: 'Light',
    description: 'Classic light interface with high readability',
    icon: Sun,
    preview: (
      <div className="flex h-full flex-col gap-1.5 rounded-lg bg-[#f8f9ff] p-3">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#003ec7]" />
          <div className="h-2 w-12 rounded bg-[#0b1c30]" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <div className="w-8 rounded bg-[#eff4ff]" />
          <div className="flex flex-1 flex-col gap-1 rounded bg-white p-1.5">
            <div className="h-1.5 w-full rounded bg-[#dce9ff]" />
            <div className="h-1.5 w-4/5 rounded bg-[#dce9ff]" />
            <div className="mt-1 h-1.5 w-3/5 rounded bg-[#e5eeff]" />
          </div>
        </div>
        <div className="h-2 w-full rounded bg-[#003ec7]" />
      </div>
    ),
  },
  {
    value: 'dark',
    name: 'Dark',
    description: 'High-contrast dark mode for low-light environments',
    icon: Moon,
    preview: (
      <div className="flex h-full flex-col gap-1.5 rounded-lg bg-[#0d1117] p-3">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#b7c4ff]" />
          <div className="h-2 w-12 rounded bg-[#eaf1ff]" />
        </div>
        <div className="flex flex-1 gap-1.5">
          <div className="w-8 rounded bg-[#111827]" />
          <div className="flex flex-1 flex-col gap-1 rounded bg-[#161f2e] p-1.5">
            <div className="h-1.5 w-full rounded bg-[#1d2739]" />
            <div className="h-1.5 w-4/5 rounded bg-[#1d2739]" />
            <div className="mt-1 h-1.5 w-3/5 rounded bg-[#263044]" />
          </div>
        </div>
        <div className="h-2 w-full rounded bg-[#b7c4ff]" />
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
        <div className="flex flex-1 flex-col gap-1.5 bg-[#f8f9ff] p-3">
          <div className="h-2 w-8 rounded bg-[#0b1c30]" />
          <div className="flex-1 rounded bg-[#eff4ff]" />
          <div className="h-2 w-full rounded bg-[#003ec7]" />
        </div>
        {/* Right half — dark */}
        <div className="flex flex-1 flex-col gap-1.5 bg-[#0d1117] p-3">
          <div className="h-2 w-8 rounded bg-[#eaf1ff]" />
          <div className="flex-1 rounded bg-[#161f2e]" />
          <div className="h-2 w-full rounded bg-[#b7c4ff]" />
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
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          Appearance
        </h2>
        <p className="text-on-surface-variant text-base">
          Customize the look and feel of the CryptoEdy platform.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Interface Theme</h3>
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
                            'text-sm font-semibold',
                            isSelected ? 'text-primary' : 'text-on-surface'
                          )}
                        >
                          {t.name}
                        </p>
                        <p className="text-on-surface-variant mt-0.5 text-xs">{t.description}</p>
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
