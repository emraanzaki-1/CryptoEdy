'use client'

import { useState } from 'react'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Badge } from '@/components/ui/badge'

interface NotificationItemProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  isPro?: boolean
}

function NotificationItem({ title, description, checked, onChange, isPro }: NotificationItemProps) {
  return (
    <div className="border-outline-variant/20 bg-surface-container-low flex items-center justify-between rounded-2xl border p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-on-surface text-base font-semibold">{title}</p>
          {isPro && <Badge variant="pro">PRO</Badge>}
        </div>
        <p className="text-on-surface-variant mt-1 text-sm">{description}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  )
}

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState({
    dailyBrief: true,
    proAlerts: true,
    mentions: true,
    followers: false,
    marketDirection: true,
    assetsPicks: true,
  })

  const toggle = (key: keyof typeof prefs) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

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

      <div className="space-y-10">
        {/* Content Updates */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Content Updates</h3>
          <div className="space-y-4">
            <NotificationItem
              title="Daily Market Brief"
              description="A concise summary of pre-market activity."
              checked={prefs.dailyBrief}
              onChange={() => toggle('dailyBrief')}
            />
            <NotificationItem
              title="Pro Research Alerts"
              description="Instant notifications for new deep-dive analyses."
              checked={prefs.proAlerts}
              onChange={() => toggle('proAlerts')}
              isPro
            />
          </div>
        </section>

        {/* Community & Social */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Community & Social</h3>
          <div className="space-y-4">
            <NotificationItem
              title="Mentions"
              description="When someone mentions you in a discussion."
              checked={prefs.mentions}
              onChange={() => toggle('mentions')}
            />
            <NotificationItem
              title="Follower Alerts"
              description="When someone new follows your public portfolio."
              checked={prefs.followers}
              onChange={() => toggle('followers')}
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
              onChange={() => toggle('marketDirection')}
            />
            <NotificationItem
              title="Assets & Picks"
              description="Alerts for new high-conviction token selections."
              checked={prefs.assetsPicks}
              onChange={() => toggle('assetsPicks')}
            />
          </div>
        </section>

        {/* Actions */}
        <section className="border-outline-variant/15 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="ml-auto flex w-full gap-4 sm:w-auto">
            <button className="text-on-surface-variant hover:bg-surface-container w-full rounded-full px-8 py-3.5 text-sm font-bold transition-colors sm:w-auto">
              Cancel
            </button>
            <button className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container w-full rounded-full px-8 py-3.5 text-sm font-bold shadow-sm transition-colors sm:w-auto">
              Save changes
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
