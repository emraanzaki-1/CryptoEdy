'use client'

import { useState, useCallback, useEffect } from 'react'

type OverviewData = {
  totalUsers: number
  activePro: number
  expiredPro: number
  expiringSoon: number
  totalRevenue: number
  recentRevenue: number
  totalPayments: number
}

type SubscriberDoc = {
  id: string
  email: string
  displayName: string | null
  username: string | null
  role: string
  subscriptionExpiry: string | null
  createdAt: string
  subscriptionStatus: 'active' | 'expired'
}

type SubscribersResponse = {
  docs: SubscriberDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: '8px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--theme-elevation-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--theme-elevation-800)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: '11px', color: 'var(--theme-elevation-400)', marginTop: '2px' }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s =
    status === 'active'
      ? { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Active' }
      : { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Expired' }

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
      }}
    >
      {s.label}
    </span>
  )
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function SubscriptionManagementClient() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [data, setData] = useState<SubscribersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin-subscriptions/overview')
      if (res.ok) setOverview(await res.json())
    } catch {
      // silently fail — KPIs are non-critical
    }
  }, [])

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin-subscriptions?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  return (
    <div
      className="gutter--left gutter--right"
      style={{ fontFamily: 'system-ui, sans-serif', paddingTop: '20px', paddingBottom: '20px' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--theme-elevation-800)',
            letterSpacing: '-0.02em',
          }}
        >
          Subscriptions
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
          Pro membership overview and subscriber management
        </p>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <KpiCard
            label="Active Pro"
            value={String(overview.activePro)}
            sublabel={`of ${overview.totalUsers} total users`}
          />
          <KpiCard
            label="Expired"
            value={String(overview.expiredPro)}
            sublabel="Were Pro, now free"
          />
          <KpiCard
            label="Expiring Soon"
            value={String(overview.expiringSoon)}
            sublabel="Within 30 days"
          />
          <KpiCard
            label="Total Revenue"
            value={formatCurrency(overview.totalRevenue)}
            sublabel={`${overview.totalPayments} payments`}
          />
          <KpiCard label="Last 30 Days" value={formatCurrency(overview.recentRevenue)} />
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by email, name, or username..."
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
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
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="expiring">Expiring Soon</option>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 1fr',
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
          <span>Username</span>
          <span>Status</span>
          <span>Expires</span>
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
            No subscribers found.
          </div>
        ) : (
          data.docs.map((sub, i) => (
            <div
              key={sub.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 1fr',
                padding: '12px 20px',
                borderBottom:
                  i < data.docs.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--theme-elevation-800)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {sub.displayName || sub.email}
                </div>
                {sub.displayName && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--theme-elevation-400)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {sub.email}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--theme-elevation-500)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {sub.username ? `@${sub.username}` : '—'}
              </span>
              <StatusBadge status={sub.subscriptionStatus} />
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {sub.subscriptionExpiry
                  ? new Date(sub.subscriptionExpiry).toLocaleDateString()
                  : '—'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {new Date(sub.createdAt).toLocaleDateString()}
              </span>
            </div>
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
