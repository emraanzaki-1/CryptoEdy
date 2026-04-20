'use client'

import { useState, useCallback, useEffect } from 'react'

type Subscriber = {
  id: string
  email: string
  active: boolean
  subscribedAt: string
  unsubscribedAt: string | null
}

type SubscribersResponse = {
  docs: Subscriber[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function StatusBadge({ active }: { active: boolean }) {
  const s = active
    ? { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Active' }
    : { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Unsubscribed' }

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

export default function SubscriberManagementClient() {
  const [data, setData] = useState<SubscribersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin-subscribers?${params}`)
      if (res.ok) {
        setData(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

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
            Subscribers
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
            Marketing email subscribers
            {data && ` · ${data.totalDocs} total`}
          </p>
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (statusFilter) params.set('status', statusFilter)
            window.location.href = `/api/admin-subscribers/export?${params}`
          }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid var(--theme-border-color)',
            borderRadius: '6px',
            background: 'var(--theme-elevation-50)',
            color: 'var(--theme-elevation-700)',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by email..."
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
          <option value="unsubscribed">Unsubscribed</option>
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
            gridTemplateColumns: '2fr 0.8fr 1fr 1fr',
            padding: '10px 20px',
            borderBottom: '1px solid var(--theme-border-color)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <span>Email</span>
          <span>Status</span>
          <span>Subscribed</span>
          <span>Unsubscribed</span>
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
                gridTemplateColumns: '2fr 0.8fr 1fr 1fr',
                padding: '12px 20px',
                borderBottom:
                  i < data.docs.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {/* Email */}
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
                  {sub.email}
                </div>
              </div>

              {/* Status */}
              <div>
                <StatusBadge active={sub.active} />
              </div>

              {/* Subscribed date */}
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {new Date(sub.subscribedAt).toLocaleDateString()}
              </span>

              {/* Unsubscribed date */}
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString() : '—'}
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
