'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type AppUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  role: string
  emailVerified: boolean
  blocked: boolean
  subscriptionExpiry: string | null
  referralCode: string | null
  createdAt: string
  updatedAt: string
}

const ROLES = ['free', 'pro', 'analyst', 'admin'] as const

export default function UserManagementEditClient({ userId }: { userId: string }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('free')
  const [emailVerified, setEmailVerified] = useState(false)
  const [subscriptionExpiry, setSubscriptionExpiry] = useState('')

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin-users/${userId}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Failed to load user')
        return
      }
      const { user: u } = await res.json()
      setUser(u)
      setFirstName(u.firstName ?? '')
      setLastName(u.lastName ?? '')
      setUsername(u.username ?? '')
      setDisplayName(u.displayName ?? '')
      setRole(u.role)
      setEmailVerified(u.emailVerified)
      setSubscriptionExpiry(
        u.subscriptionExpiry ? new Date(u.subscriptionExpiry).toISOString().split('T')[0] : ''
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const body: Record<string, unknown> = {
        firstName: firstName || null,
        lastName: lastName || null,
        username: username || null,
        displayName: displayName || null,
        role,
        emailVerified,
      }
      if (subscriptionExpiry) {
        body.subscriptionExpiry = new Date(subscriptionExpiry).toISOString()
      }

      const res = await fetch(`/api/admin-users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Failed to save changes')
        return
      }
      const { user: updated } = await res.json()
      setUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleBlock = async () => {
    const newBlocked = !user?.blocked
    const action = newBlocked ? 'block' : 'unblock'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return

    setError(null)
    try {
      const res = await fetch(`/api/admin-users/${userId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: newBlocked }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? `Failed to ${action} user`)
        return
      }
      await fetchUser()
    } catch {
      setError(`Failed to ${action} user`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this user? This cannot be undone.'))
      return
    if (!confirm('This will delete all user data. Type confirm to proceed — are you sure?')) return

    setError(null)
    try {
      const res = await fetch(`/api/admin-users/${userId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Failed to delete user')
        return
      }
      window.location.href = '/admin/user-management'
    } catch {
      setError('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div
        className="collection-edit gutter--left gutter--right"
        style={{ padding: '40px 0', textAlign: 'center' }}
      >
        <p style={{ color: 'var(--theme-elevation-500)', fontSize: '14px' }}>Loading user...</p>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div
        className="collection-edit gutter--left gutter--right"
        style={{ padding: '40px 0', textAlign: 'center' }}
      >
        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
        <Link
          href="/admin/user-management"
          style={{
            display: 'inline-block',
            marginTop: '12px',
            color: 'var(--theme-elevation-650)',
            fontSize: '13px',
            textDecoration: 'underline',
          }}
        >
          ← Back to App Users
        </Link>
      </div>
    )
  }

  return (
    <div className="collection-edit gutter--left gutter--right">
      {/* Header with email + avatar */}
      <header
        className="collection-edit__header"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '20px 0',
          borderBottom: '1px solid var(--theme-elevation-150)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--theme-elevation-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--theme-elevation-600)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            (user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--theme-elevation-800)',
            }}
          >
            {user?.displayName ?? user?.username ?? user?.email?.split('@')[0]}
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
            {user?.email}
          </p>
        </div>
      </header>

      {/* Blocked banner */}
      {user?.blocked && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: '16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ⛔ This user is blocked and cannot access the platform.
        </div>
      )}

      {/* Status messages */}
      {error && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: '16px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: '16px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '6px',
            color: '#22c55e',
            fontSize: '13px',
          }}
        >
          Changes saved successfully.
        </div>
      )}

      {/* Form fields */}
      <div className="field-type" style={{ display: 'grid', gap: '20px' }}>
        {/* Email (read-only) */}
        <FieldRow label="Email">
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="field-type__input"
            style={inputStyle({ disabled: true })}
          />
        </FieldRow>

        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FieldRow label="First Name">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="field-type__input"
              style={inputStyle({})}
            />
          </FieldRow>
          <FieldRow label="Last Name">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="field-type__input"
              style={inputStyle({})}
            />
          </FieldRow>
        </div>

        <FieldRow label="Username">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field-type__input"
            style={inputStyle({})}
          />
        </FieldRow>

        <FieldRow label="Display Name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-type__input"
            style={inputStyle({})}
          />
        </FieldRow>

        {/* Role */}
        <FieldRow label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle({})}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </FieldRow>

        {/* Email Verified */}
        <FieldRow label="Email Verified">
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--theme-elevation-800)',
            }}
          >
            <input
              type="checkbox"
              checked={emailVerified}
              onChange={(e) => setEmailVerified(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--theme-success-500, #22c55e)',
              }}
            />
            {emailVerified ? 'Verified' : 'Not verified'}
          </label>
        </FieldRow>

        {/* Subscription Expiry */}
        <FieldRow label="Subscription Expiry">
          <input
            type="date"
            value={subscriptionExpiry}
            onChange={(e) => setSubscriptionExpiry(e.target.value)}
            className="field-type__input"
            style={inputStyle({})}
          />
        </FieldRow>

        {/* Referral Code (read-only) */}
        <FieldRow label="Referral Code">
          <input
            type="text"
            value={user?.referralCode ?? '—'}
            disabled
            className="field-type__input"
            style={inputStyle({ disabled: true })}
          />
        </FieldRow>

        {/* Timestamps (read-only) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FieldRow label="Created At">
            <input
              type="text"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
              disabled
              className="field-type__input"
              style={inputStyle({ disabled: true })}
            />
          </FieldRow>
          <FieldRow label="Updated At">
            <input
              type="text"
              value={user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}
              disabled
              className="field-type__input"
              style={inputStyle({ disabled: true })}
            />
          </FieldRow>
        </div>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid var(--theme-elevation-150)',
        }}
      >
        {/* Destructive actions (left) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleToggleBlock}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: user?.blocked ? '#22c55e' : '#ef4444',
              background: user?.blocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${user?.blocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {user?.blocked ? 'Unblock User' : 'Block User'}
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ef4444',
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Delete User
          </button>
        </div>

        {/* Save actions (right) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            href="/admin/user-management"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--theme-elevation-650)',
              textDecoration: 'none',
              border: '1px solid var(--theme-elevation-250)',
              borderRadius: '4px',
              background: 'transparent',
            }}
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: saving
                ? 'var(--theme-elevation-400)'
                : 'var(--theme-success-500, #22c55e)',
              border: 'none',
              borderRadius: '4px',
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--theme-elevation-650)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function inputStyle({ disabled }: { disabled?: boolean }): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: disabled ? 'var(--theme-elevation-500)' : 'var(--theme-elevation-800)',
    background: disabled ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-0, #fff)',
    border: '1px solid var(--theme-elevation-250)',
    borderRadius: '4px',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
  }
}
