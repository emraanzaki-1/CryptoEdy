'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type PreferenceKey = 'dailyBrief' | 'proAlerts' | 'marketDirection' | 'assetsPicks'

interface Preferences {
  dailyBrief: boolean
  proAlerts: boolean
  marketDirection: boolean
  assetsPicks: boolean
}

interface NotificationItemProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  isPro?: boolean
  disabled?: boolean
}

function NotificationItem({
  title,
  description,
  checked,
  onChange,
  isPro,
  disabled,
}: NotificationItemProps) {
  return (
    <div className="border-outline-variant/20 bg-surface-container-low flex items-center justify-between rounded-2xl border p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-on-surface text-base font-semibold">{title}</p>
          {isPro && <Badge variant="pro">PRO</Badge>}
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="bg-surface-container mb-5 h-5 w-32 animate-pulse rounded" />
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border-outline-variant/20 bg-surface-container-low flex items-center justify-between rounded-2xl border p-5"
              >
                <div className="space-y-2">
                  <div className="bg-surface-container h-4 w-40 animate-pulse rounded" />
                  <div className="bg-surface-container h-3 w-56 animate-pulse rounded" />
                </div>
                <div className="bg-surface-container h-6 w-11 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<PreferenceKey | null>(null)

  useEffect(() => {
    fetch('/api/user/notification-preferences')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load preferences')
        return res.json()
      })
      .then((data: Preferences) => setPrefs(data))
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = useCallback(
    async (key: PreferenceKey) => {
      if (!prefs || saving) return

      const previous = prefs[key]
      // Optimistic update
      setPrefs((prev) => (prev ? { ...prev, [key]: !previous } : prev))
      setSaving(key)

      try {
        const res = await fetch('/api/user/notification-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, enabled: !previous }),
        })

        if (!res.ok) throw new Error('Failed to save')

        const updated: Preferences = await res.json()
        setPrefs(updated)
        toast.success('Preferences saved')
      } catch {
        // Revert optimistic update
        setPrefs((prev) => (prev ? { ...prev, [key]: previous } : prev))
        toast.error('Failed to save preference')
      } finally {
        setSaving(null)
      }
    },
    [prefs, saving]
  )

  return (
    <>
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          Notification Preferences
        </h2>
        <p className="text-on-surface-variant text-base">
          Manage how and when you receive updates from CryptoEdy.
        </p>
      </div>

      {loading || !prefs ? (
        <NotificationSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Content Updates */}
          <section>
            <h3 className="text-on-surface mb-5 text-base font-semibold">Content Updates</h3>
            <div className="space-y-4">
              <NotificationItem
                title="Daily Market Brief"
                description="A concise summary of pre-market activity."
                checked={prefs.dailyBrief}
                onChange={() => handleToggle('dailyBrief')}
                disabled={saving === 'dailyBrief'}
              />
              <NotificationItem
                title="Pro Research Alerts"
                description="Instant notifications for new deep-dive analyses."
                checked={prefs.proAlerts}
                onChange={() => handleToggle('proAlerts')}
                disabled={saving === 'proAlerts'}
                isPro
              />
            </div>
          </section>

          {/* Feed Alerts */}
          <section>
            <h3 className="text-on-surface mb-5 text-base font-semibold">Feed Alerts</h3>
            <div className="space-y-4">
              <NotificationItem
                title="Market Direction"
                description="Alerts for macro and trend updates."
                checked={prefs.marketDirection}
                onChange={() => handleToggle('marketDirection')}
                disabled={saving === 'marketDirection'}
              />
              <NotificationItem
                title="Assets & Picks"
                description="Alerts for new high-conviction token selections."
                checked={prefs.assetsPicks}
                onChange={() => handleToggle('assetsPicks')}
                disabled={saving === 'assetsPicks'}
              />
            </div>
          </section>
        </div>
      )}
    </>
  )
}
