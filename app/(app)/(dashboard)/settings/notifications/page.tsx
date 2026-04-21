'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { SectionHeading } from '@/components/common/section-heading'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
    <Card variant="surface" className="flex-row items-center justify-between p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-on-surface text-body-lg font-semibold">{title}</p>
          {isPro && <Badge variant="pro">PRO</Badge>}
        </div>
        <p className="text-on-surface-variant text-body-sm mt-1">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </Card>
  )
}

function NotificationSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="bg-surface-container mb-6 h-5 w-32 animate-pulse rounded" />
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="border-outline-variant/15 bg-surface-container-low flex items-center justify-between rounded-2xl border p-5"
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
      <SectionHeading as="h2" subtitle="Manage how and when you receive updates from CryptoEdy.">
        Notification Preferences
      </SectionHeading>

      {loading || !prefs ? (
        <NotificationSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Content Updates */}
          <section>
            <SectionHeading variant="subsection">Content Updates</SectionHeading>
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
            <SectionHeading variant="subsection">Feed Alerts</SectionHeading>
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
