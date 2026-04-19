'use client'

import { useState, useCallback, useEffect } from 'react'

type AppUser = {
  id: string
  email: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  role: string
  subscriptionExpiry: string | null
  emailVerified: boolean
  blocked: boolean
  createdAt: string
}

type UsersResponse = {
  docs: AppUser[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

const ROLES = ['free', 'pro', 'analyst', 'admin'] as const

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    admin: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    analyst: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    pro: { bg: 'rgba(247,147,26,0.15)', color: '#f7931a' },
    free: { bg: 'var(--theme-elevation-150)', color: 'var(--theme-elevation-600)' },
  }
  const s = map[role] ?? map.free
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      {role}
    </span>
  )
}

function SubStatus({ role, expiry }: { role: string; expiry: string | null }) {
  if (role === 'admin' || role === 'analyst')
    return <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>N/A</span>
  if (role !== 'pro' || !expiry)
    return <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>—</span>

  const isExpired = new Date(expiry) < new Date()
  return (
    <span
      style={{
        fontSize: '12px',
        color: isExpired ? '#ef4444' : '#22c55e',
        fontWeight: 500,
      }}
    >
      {isExpired ? 'Expired' : 'Active'} · {new Date(expiry).toLocaleDateString()}
    </span>
  )
}

export default function UserManagementClient() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)

      const res = await fetch(`/api/admin-users?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div
      className="gutter--left gutter--right"
      style={{ fontFamily: 'system-ui, sans-serif', paddingTop: '20px', paddingBottom: '20px' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--theme-elevation-800)',
              letterSpacing: '-0.02em',
            }}
          >
            App Users
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
            Manage application user roles and subscriptions
            {data && ` · ${data.totalDocs} total`}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by email, username, or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          style={{
            flex: '1 1 250px',
            padding: '8px 12px',
            fontSize: '13px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '6px',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-elevation-800)',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(1)
          }}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            border: '1px solid var(--theme-border-color)',
            borderRadius: '6px',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-elevation-800)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          border: '1px solid var(--theme-border-color)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 0.8fr 1fr 1fr',
            padding: '10px 20px',
            borderBottom: '1px solid var(--theme-border-color)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Subscription</span>
          <span>Joined</span>
        </div>

        {loading ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--theme-elevation-400)',
              fontSize: '13px',
            }}
          >
            Loading...
          </div>
        ) : !data || data.docs.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--theme-elevation-400)',
              fontSize: '13px',
            }}
          >
            No users found.
          </div>
        ) : (
          data.docs.map((user, i) => (
            <a
              key={user.id}
              href={`/admin/user-management/${user.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 0.8fr 1fr 1fr',
                padding: '12px 20px',
                borderBottom:
                  i < data.docs.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--theme-elevation-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--theme-elevation-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--theme-elevation-600)',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (user.displayName ?? user.email).charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-800)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.displayName ?? user.username ?? user.email.split('@')[0]}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--theme-elevation-500)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div>
                <RoleBadge role={user.role} />
              </div>

              {/* Status */}
              <div>
                {user.blocked ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Blocked
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: 'rgba(34,197,94,0.15)',
                      color: '#22c55e',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Active
                  </span>
                )}
              </div>

              {/* Subscription */}
              <SubStatus role={user.role} expiry={user.subscriptionExpiry} />

              {/* Joined */}
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </a>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-elevation-700)',
              cursor: page <= 1 ? 'default' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(data.totalPages, page + 1))}
            disabled={page >= data.totalPages || loading}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid var(--theme-border-color)',
              borderRadius: '4px',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-elevation-700)',
              cursor: page >= data.totalPages ? 'default' : 'pointer',
              opacity: page >= data.totalPages ? 0.5 : 1,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
