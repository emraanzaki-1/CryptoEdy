'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { SectionHeading } from '@/components/common/section-heading'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import type { NotificationType, NotificationSubtype } from '@/lib/db/schema/notifications'

/* ─── Category / Subtype Definitions ─────────────────────────────────────── */

interface SubtypeConfig {
  subtype: NotificationSubtype
  label: string
  description: string
}

interface CategoryConfig {
  type: NotificationType
  label: string
  subtypes: SubtypeConfig[]
}

const CATEGORIES: CategoryConfig[] = [
  {
    type: 'content',
    label: 'Content',
    subtypes: [
      {
        subtype: 'research',
        label: 'Research',
        description: 'Uncover hand-picked investment ideas.',
      },
      {
        subtype: 'analysis',
        label: 'Analysis',
        description: 'Watch us chart top assets & identify potential trading opportunities.',
      },
    ],
  },
  {
    type: 'community',
    label: 'Community',
    subtypes: [
      {
        subtype: 'message',
        label: 'New messages',
        description: 'Direct messages from other members.',
      },
      {
        subtype: 'mention',
        label: 'New mentions',
        description: "When you're mentioned in a forum or chat.",
      },
      {
        subtype: 'reply',
        label: 'New replies',
        description: 'Responses to your comments or posts.',
      },
    ],
  },
  {
    type: 'feed',
    label: 'Feed',
    subtypes: [
      {
        subtype: 'market_direction',
        label: 'Market Direction',
        description: 'Alerts for macro and trend updates.',
      },
      {
        subtype: 'picks',
        label: 'Assets & Picks',
        description: 'Alerts for new high-conviction token selections.',
      },
    ],
  },
  {
    type: 'account',
    label: 'Account',
    subtypes: [
      {
        subtype: 'subscription',
        label: 'Subscription',
        description: 'Payment confirmations, expiry warnings, and renewal reminders.',
      },
      {
        subtype: 'referral',
        label: 'Referrals',
        description: 'Referral reward notifications when someone joins through your link.',
      },
    ],
  },
]

/* ─── Types ──────────────────────────────────────────────────────────────── */

type GroupedPreferences = Record<
  NotificationType,
  Record<NotificationSubtype, { inApp: boolean; email: boolean }>
>

/* ─── Components ─────────────────────────────────────────────────────────── */

function NotificationSkeleton() {
  return (
    <div className="space-y-10">
      {[1, 2, 3, 4].map((section) => (
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

function SubtypeToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <Card variant="surface" className="flex-row items-center justify-between p-5">
      <div>
        <p className="text-on-surface text-body-lg font-semibold">{label}</p>
        <p className="text-on-surface-variant text-body-sm mt-1">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </Card>
  )
}

function CategoryGroup({
  config,
  prefs,
  saving,
  onToggleSubtype,
  onToggleMaster,
}: {
  config: CategoryConfig
  prefs: Record<NotificationSubtype, { inApp: boolean; email: boolean }>
  saving: string | null
  onToggleSubtype: (type: NotificationType, subtype: NotificationSubtype) => void
  onToggleMaster: (type: NotificationType) => void
}) {
  const subtypeValues = config.subtypes.map((s) => prefs[s.subtype]?.inApp ?? true)
  const allOn = subtypeValues.every(Boolean)
  const allOff = subtypeValues.every((v) => !v)
  const indeterminate = !allOn && !allOff

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeading variant="subsection">{config.label}</SectionHeading>
        <ToggleSwitch
          checked={allOn}
          indeterminate={indeterminate}
          onChange={() => onToggleMaster(config.type)}
          disabled={saving !== null}
        />
      </div>
      <div className="space-y-4">
        {config.subtypes.map((sub) => (
          <SubtypeToggleRow
            key={sub.subtype}
            label={sub.label}
            description={sub.description}
            checked={prefs[sub.subtype]?.inApp ?? true}
            onChange={() => onToggleSubtype(config.type, sub.subtype)}
            disabled={saving === `${config.type}:${sub.subtype}` || saving === config.type}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<GroupedPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // Fetch preferences
  useEffect(() => {
    fetch('/api/user/notification-preferences')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load preferences')
        return res.json()
      })
      .then((data: GroupedPreferences) => setPrefs(data))
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setLoading(false))
  }, [])

  // Toggle individual subtype
  const handleToggleSubtype = useCallback(
    async (type: NotificationType, subtype: NotificationSubtype) => {
      if (!prefs || saving) return

      const current = prefs[type]?.[subtype]?.inApp ?? true
      const key = `${type}:${subtype}`

      // Optimistic update
      setPrefs((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          [type]: {
            ...prev[type],
            [subtype]: { ...prev[type][subtype], inApp: !current },
          },
        }
      })
      setSaving(key)

      try {
        const res = await fetch('/api/user/notification-preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, subtype, channel: 'inApp', enabled: !current }),
        })
        if (!res.ok) throw new Error('Failed to save')
        const updated: GroupedPreferences = await res.json()
        setPrefs(updated)
        toast.success('Preferences saved')
      } catch {
        // Revert
        setPrefs((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            [type]: {
              ...prev[type],
              [subtype]: { ...prev[type][subtype], inApp: current },
            },
          }
        })
        toast.error('Failed to save preference')
      } finally {
        setSaving(null)
      }
    },
    [prefs, saving]
  )

  // Master toggle for a category
  const handleToggleMaster = useCallback(
    async (type: NotificationType) => {
      if (!prefs || saving) return

      const category = CATEGORIES.find((c) => c.type === type)
      if (!category) return

      // If all are on → turn all off. Otherwise → turn all on.
      const allOn = category.subtypes.every((s) => prefs[type]?.[s.subtype]?.inApp ?? true)
      const newValue = !allOn

      // Optimistic update
      const prevPrefs = prefs
      setPrefs((prev) => {
        if (!prev) return prev
        const updated = { ...prev, [type]: { ...prev[type] } }
        for (const sub of category.subtypes) {
          updated[type] = {
            ...updated[type],
            [sub.subtype]: { ...updated[type][sub.subtype], inApp: newValue },
          }
        }
        return updated
      })
      setSaving(type)

      try {
        const res = await fetch('/api/user/notification-preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, channel: 'inApp', enabled: newValue }),
        })
        if (!res.ok) throw new Error('Failed to save')
        const updated: GroupedPreferences = await res.json()
        setPrefs(updated)
        toast.success('Preferences saved')
      } catch {
        setPrefs(prevPrefs)
        toast.error('Failed to save preferences')
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
          {CATEGORIES.map((cat) => (
            <CategoryGroup
              key={cat.type}
              config={cat}
              prefs={prefs[cat.type] ?? {}}
              saving={saving}
              onToggleSubtype={handleToggleSubtype}
              onToggleMaster={handleToggleMaster}
            />
          ))}
        </div>
      )}
    </>
  )
}
