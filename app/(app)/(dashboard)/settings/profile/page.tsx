'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Pencil, Loader2, Check } from 'lucide-react'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import {
  SettingsFormField,
  SettingsInput,
  SettingsTextarea,
} from '@/components/settings/settings-form-field'
import { DangerZone } from '@/components/settings/danger-zone'
import { useAvatar } from '@/components/providers/avatar-provider'
import { getProfile, updateProfile, type ProfileData } from '@/lib/profile/actions'

export default function ProfileSettingsPage() {
  const { update: updateSession } = useSession()
  const { setAvatarUrl: setGlobalAvatar } = useAvatar()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const populateForm = useCallback((data: ProfileData) => {
    setProfile(data)
    setFirstName(data.firstName ?? '')
    setLastName(data.lastName ?? '')
    setUsername(data.username ? `@${data.username}` : '')
    setDisplayName(data.displayName ?? '')
    setBio(data.bio ?? '')
    setAvatarUrl(data.avatarUrl)
  }, [])

  useEffect(() => {
    getProfile().then((result) => {
      if (result.ok) {
        populateForm(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [populateForm])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)

    const result = await updateProfile({
      firstName: firstName || null,
      lastName: lastName || null,
      username: username || null,
      displayName: displayName || null,
      bio: bio || null,
    })

    if (result.ok) {
      populateForm(result.data)
      await updateSession()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError(result.error)
    }

    setSaving(false)
  }

  const handleCancel = () => {
    if (!profile) return
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setUsername(profile.username ? `@${profile.username}` : '')
    setDisplayName(profile.displayName ?? '')
    setBio(profile.bio ?? '')
    setError(null)
  }

  const hasChanges =
    profile &&
    (firstName !== (profile.firstName ?? '') ||
      lastName !== (profile.lastName ?? '') ||
      username !== (profile.username ? `@${profile.username}` : '') ||
      displayName !== (profile.displayName ?? '') ||
      bio !== (profile.bio ?? ''))

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-on-surface-variant size-6 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          Profile Settings
        </h2>
        <p className="text-on-surface-variant text-base">
          Manage your personal information and application preferences.
        </p>
      </div>

      <div className="space-y-10">
        {/* Avatar Upload */}
        <AvatarUpload
          imageUrl={avatarUrl}
          fallbackInitial={(
            displayName?.[0] ||
            username?.[1] ||
            profile?.email?.[0] ||
            '?'
          ).toUpperCase()}
          alt="Profile picture"
          onUploaded={(url) => {
            setAvatarUrl(url)
            setGlobalAvatar(url)
            setProfile((prev) => (prev ? { ...prev, avatarUrl: url } : prev))
            updateSession()
          }}
          onRemoved={() => {
            setAvatarUrl(null)
            setGlobalAvatar(null)
            setProfile((prev) => (prev ? { ...prev, avatarUrl: null } : prev))
            updateSession()
          }}
        />

        {/* Personal Information */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Personal Information</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <SettingsFormField label="First Name">
              <SettingsInput
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </SettingsFormField>
            <SettingsFormField label="Last Name">
              <SettingsInput
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </SettingsFormField>
            <SettingsFormField label="Email Address" className="relative sm:col-span-2">
              <div className="relative">
                <SettingsInput type="email" value={profile?.email ?? ''} readOnly />
                <button className="text-primary hover:text-primary-container absolute top-1/2 right-4 -translate-y-1/2 p-1">
                  <Pencil className="size-4" />
                </button>
              </div>
            </SettingsFormField>
            <SettingsFormField label="Username">
              <SettingsInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </SettingsFormField>
            <SettingsFormField label="Display Name">
              <SettingsInput
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
              />
            </SettingsFormField>
          </div>
        </section>

        {/* Bio */}
        <section>
          <SettingsFormField label="Bio">
            <SettingsTextarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </SettingsFormField>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-error-container/30 text-error rounded-2xl px-5 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <section className="border-outline-variant/15 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="ml-auto flex w-full gap-4 sm:w-auto">
            <button
              onClick={handleCancel}
              disabled={!hasChanges || saving}
              className="text-on-surface-variant hover:bg-surface-container w-full rounded-full px-8 py-3.5 text-sm font-bold transition-colors disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="from-primary to-primary-container text-on-primary flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b px-8 py-3.5 text-sm font-bold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saved && <Check className="size-4" />}
              {saved ? 'Saved' : 'Save changes'}
            </button>
          </div>
        </section>
      </div>

      <DangerZone userEmail={profile?.email} />
    </>
  )
}
