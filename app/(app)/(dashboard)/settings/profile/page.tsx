'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import {
  SettingsFormField,
  SettingsInput,
  SettingsTextarea,
  SettingsSelect,
} from '@/components/settings/settings-form-field'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { DangerZone } from '@/components/settings/danger-zone'

export default function ProfileSettingsPage() {
  const [hideCurrency, setHideCurrency] = useState(true)

  return (
    <>
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-[2.5rem] leading-tight font-bold tracking-[-0.04em]">
          Profile Settings
        </h2>
        <p className="text-on-surface-variant text-base">
          Manage your personal information and application preferences.
        </p>
      </div>

      <div className="space-y-10">
        {/* Avatar Upload */}
        <AvatarUpload
          imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuCKzOmMufbe-_T25aE_RIbQELKvoVSR2kqy2oF0aesjQ_RQMc3QqaOBUVKNvNwhAzScP66NwVskRiEqdtzojCdlAIWdQ-m3X9-HJfKBTp5OplRWGJn3QhkFT0Aflyxic8bVtzQJMnAHrLp3V2-HBZ-hc5_zrCniGTyMTzCztafIpYdG9uN4MccxwnptvRVyUAEpMP4_Jv_GxkgPWIYhqoNJVNMKqKIZzJUHT1Elue2PPqsa0cvbwdqGFOsJJTUKBw66tXZ07geijKQP"
          alt="Profile picture"
        />

        {/* Personal Information */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Personal Information</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <SettingsFormField label="First Name">
              <SettingsInput type="text" defaultValue="John" />
            </SettingsFormField>
            <SettingsFormField label="Last Name">
              <SettingsInput type="text" defaultValue="Doe" />
            </SettingsFormField>
            <SettingsFormField label="Email Address" className="relative sm:col-span-2">
              <div className="relative">
                <SettingsInput type="email" defaultValue="john.doe@curator.app" readOnly />
                <button className="text-primary hover:text-primary-container absolute top-1/2 right-4 -translate-y-1/2 p-1">
                  <Pencil className="size-4" />
                </button>
              </div>
            </SettingsFormField>
            <SettingsFormField label="Username">
              <SettingsInput type="text" defaultValue="@johndoe" />
            </SettingsFormField>
            <SettingsFormField label="Display Name">
              <SettingsInput type="text" defaultValue="John Doe - Tech Analyst" />
            </SettingsFormField>
            <SettingsFormField label="Phone Number">
              <SettingsInput type="tel" defaultValue="+1 (555) 123-4567" />
            </SettingsFormField>
            <SettingsFormField label="Company Name">
              <SettingsInput type="text" defaultValue="Curator Capital" />
            </SettingsFormField>
            <SettingsFormField label="Full Address" className="sm:col-span-2">
              <SettingsInput
                type="text"
                defaultValue="123 Financial District, Suite 400, New York, NY 10004"
              />
            </SettingsFormField>
          </div>
        </section>

        {/* Bio */}
        <section>
          <SettingsFormField label="Bio">
            <SettingsTextarea
              rows={4}
              defaultValue="Senior technology analyst focusing on Web3 infrastructure and emerging consensus mechanisms. Previously at major investment firm."
            />
          </SettingsFormField>
        </section>

        {/* Privacy Preferences */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Privacy Preferences</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SettingsFormField label="Profile Visibility">
                <SettingsSelect defaultValue="public">
                  <option value="public">Public (Visible to all users)</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private</option>
                </SettingsSelect>
              </SettingsFormField>
              <SettingsFormField label="Crypto Portfolio Visibility">
                <SettingsSelect defaultValue="private">
                  <option value="private">Private</option>
                  <option value="connections">Shared with Connections</option>
                  <option value="public">Public</option>
                </SettingsSelect>
              </SettingsFormField>
            </div>
            <div className="border-outline-variant/15 bg-surface-container-low flex items-center justify-between rounded-2xl border p-5">
              <div>
                <p className="text-on-surface text-base font-semibold">Hide Currency Amounts</p>
                <p className="text-on-surface-variant mt-1 text-sm">
                  Replaces exact portfolio values with percentages
                </p>
              </div>
              <ToggleSwitch checked={hideCurrency} onChange={setHideCurrency} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="border-outline-variant/15 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="ml-auto flex w-full gap-4 sm:w-auto">
            <button className="text-on-surface-variant hover:bg-surface-container w-full rounded-full px-8 py-3.5 text-sm font-bold transition-colors sm:w-auto">
              Cancel
            </button>
            <button className="from-primary to-primary-container text-on-primary w-full rounded-full bg-gradient-to-b px-8 py-3.5 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 sm:w-auto">
              Save changes
            </button>
          </div>
        </section>
      </div>

      <DangerZone />
    </>
  )
}
