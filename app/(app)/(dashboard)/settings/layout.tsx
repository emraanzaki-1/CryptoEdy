import { SettingsNav } from '@/components/layouts/settings-nav'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:flex-row">
      <SettingsNav />
      <div className="max-w-3xl flex-1 space-y-8">{children}</div>
    </div>
  )
}
