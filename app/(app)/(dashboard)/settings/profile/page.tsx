'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Pencil, Loader2, Check, X, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvatarUpload } from '@/components/settings/avatar-upload'
import { SectionHeading } from '@/components/common/section-heading'
import { FormField, FormInput, FormTextarea } from '@/components/ui/form-field'
import { DangerZone } from '@/components/settings/danger-zone'
import { useAvatar } from '@/components/providers/avatar-provider'
import { getProfile, updateProfile, type ProfileData } from '@/lib/profile/actions'

export default function ProfileSettingsPage() {
  const { update: updateSession } = useSession()
  const { setAvatarUrl: setGlobalAvatar } = useAvatar()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email change state
  const [emailEditOpen, setEmailEditOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle')
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const populateForm = useCallback((data: ProfileData) => {
    setProfile(data)
    setFirstName(data.firstName ?? '')
    setLastName(data.lastName ?? '')
    setUsername(data.username ? `@${data.username}` : '')
    setDisplayName(data.displayName ?? '')
    setBio(data.bio ?? '')
    setAvatarUrl(data.avatarUrl)
  }, [])

  // Debounced username availability check — all setState calls are inside async callbacks
  useEffect(() => {
    const raw = username.startsWith('@') ? username.slice(1) : username
    const isUnchanged = !raw || raw === (profile?.username ?? '')

    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)

    usernameDebounceRef.current = setTimeout(
      async () => {
        if (isUnchanged) {
          setUsernameStatus('idle')
          return
        }
        setUsernameStatus('checking')
        const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(raw)}`)
        const data = (await res.json()) as { available?: boolean; error?: string }
        if (data.error && !data.available) {
          setUsernameStatus('invalid')
        } else {
          setUsernameStatus(data.available ? 'available' : 'taken')
        }
      },
      isUnchanged ? 0 : 500
    )

    return () => {
      if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current)
    }
  }, [username, profile?.username])

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

  // Handle redirect back from email verification link
  useEffect(() => {
    const changed = searchParams.get('emailChanged')
    const errParam = searchParams.get('emailError')
    if (changed === 'true') {
      getProfile().then((result) => {
        if (result.ok) populateForm(result.data)
        setEmailSent(false)
        setEmailEditOpen(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      })
    }
    if (errParam) {
      Promise.resolve(errParam).then((param) => {
        setEmailError(
          param === 'expired'
            ? 'Verification link expired. Please request a new one.'
            : 'Invalid or already used verification link.'
        )
      })
    }
  }, [searchParams, populateForm])

  const handleEmailChange = async () => {
    setEmailSending(true)
    setEmailError(null)
    const res = await fetch('/api/user/change-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEmail }),
    })
    const data = (await res.json()) as { ok?: boolean; error?: string }
    if (data.ok) {
      setEmailSent(true)
    } else {
      setEmailError(data.error ?? 'Something went wrong. Please try again.')
    }
    setEmailSending(false)
  }

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
      <SectionHeading
        as="h2"
        subtitle="Manage your personal information and application preferences."
      >
        Profile Settings
      </SectionHeading>

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
          <SectionHeading variant="subsection">Personal Information</SectionHeading>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="firstName">
              <FormInput
                id="firstName"
                variant="outlined"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName">
              <FormInput
                id="lastName"
                variant="outlined"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </FormField>
            <FormField label="Email Address" htmlFor="email" className="relative sm:col-span-2">
              <div className="space-y-3">
                <div className="relative">
                  <FormInput
                    id="email"
                    variant="outlined"
                    type="email"
                    value={profile?.email ?? ''}
                    readOnly
                  />
                  {!emailEditOpen && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => {
                        setEmailEditOpen(true)
                        setEmailSent(false)
                        setEmailError(null)
                        setNewEmail('')
                      }}
                      className="text-primary hover:text-primary-container absolute top-1/2 right-4 -translate-y-1/2"
                      aria-label="Change email address"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>

                {emailEditOpen && !emailSent && (
                  <div className="bg-surface-container space-y-3 rounded-2xl p-4">
                    <p className="text-on-surface-variant text-body-sm font-medium">
                      Enter your new email address. We&apos;ll send a verification link there.
                    </p>
                    <FormInput
                      variant="outlined"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      autoFocus
                    />
                    {emailError && (
                      <p className="text-error text-body-sm font-medium">{emailError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEmailEditOpen(false)
                          setEmailError(null)
                        }}
                        className="text-on-surface-variant rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleEmailChange}
                        loading={emailSending}
                        disabled={!newEmail || emailSending}
                        className="rounded-full"
                      >
                        Send verification
                      </Button>
                    </div>
                  </div>
                )}

                {emailEditOpen && emailSent && (
                  <div className="bg-primary/5 border-primary/20 flex items-start gap-3 rounded-2xl border p-4">
                    <Mail className="text-primary mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="text-on-surface text-body-sm font-semibold">
                        Verification email sent
                      </p>
                      <p className="text-on-surface-variant text-body-sm mt-0.5">
                        Check your inbox at <strong>{newEmail}</strong> and click the link to
                        confirm the change.
                      </p>
                      <button
                        onClick={() => {
                          setEmailSent(false)
                          setEmailError(null)
                        }}
                        className="text-primary text-body-sm mt-2 font-semibold hover:underline"
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </FormField>
            <FormField
              label="Username"
              htmlFor="username"
              error={
                usernameStatus === 'taken'
                  ? 'Username is already taken'
                  : usernameStatus === 'invalid'
                    ? 'Username must be 3–20 characters: letters, numbers, underscores only'
                    : undefined
              }
            >
              <div className="relative">
                <FormInput
                  id="username"
                  variant="outlined"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  className="pr-9"
                />
                {usernameStatus === 'checking' && (
                  <Loader2 className="text-on-surface-variant absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
                )}
                {usernameStatus === 'available' && (
                  <Check className="text-primary absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                )}
                {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                  <X className="text-error absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                )}
              </div>
            </FormField>
            <FormField label="Display Name" htmlFor="displayName">
              <FormInput
                id="displayName"
                variant="outlined"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
              />
            </FormField>
          </div>
        </section>

        {/* Bio */}
        <section>
          <FormField label="Bio" htmlFor="bio">
            <FormTextarea
              id="bio"
              variant="outlined"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </FormField>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-error-container/30 text-error text-body-sm rounded-2xl px-5 py-3 font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <section className="border-outline-variant/15 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="ml-auto flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleCancel}
              disabled={!hasChanges || saving}
              className="text-on-surface-variant hover:bg-surface-container w-full rounded-full px-8 font-bold sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="default"
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
              className="w-full rounded-full sm:w-auto"
            >
              {saved && <Check className="size-4" />}
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </div>
        </section>
      </div>

      <DangerZone userEmail={profile?.email} />
    </>
  )
}
