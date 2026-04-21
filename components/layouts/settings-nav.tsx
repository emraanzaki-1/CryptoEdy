'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, CreditCard, Receipt, Bell, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsGroups = [
  {
    label: 'My Account',
    items: [
      { href: '/settings/profile', label: 'Profile', icon: User },
      { href: '/settings/plans', label: 'Plans & Subscription', icon: CreditCard },
      { href: '/settings/billing', label: 'Billing', icon: Receipt },
    ],
  },
  {
    label: 'Application',
    items: [
      { href: '/settings/notifications', label: 'Notification Settings', icon: Bell },
      { href: '/settings/appearance', label: 'Appearance', icon: Palette },
    ],
  },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <div className="flex flex-col gap-8">
        {settingsGroups.map((group) => (
          <div key={group.label}>
            <h3 className="text-on-surface-variant text-overline mb-3 px-3 font-bold uppercase">
              {group.label}
            </h3>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'text-body-sm flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors',
                      isActive
                        ? 'bg-primary-container/10 text-primary font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    )}
                  >
                    <item.icon className="size-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
