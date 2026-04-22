'use client'

import { useState, useCallback, useEffect } from 'react'

type PaymentDoc = {
  id: string
  txHash: string
  chain: string
  asset: string
  amount: string
  status: 'confirmed' | 'pending' | 'failed'
  walletAddress: string | null
  adminNote: string | null
  confirmedAt: string | null
  createdAt: string
  user: {
    id: string
    email: string | null
    displayName: string | null
  }
}

type PaymentsResponse = {
  docs: PaymentDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

const CHAIN_OPTIONS = ['', 'ethereum', 'polygon', 'arbitrum', 'solana'] as const
const STATUS_OPTIONS = ['', 'confirmed', 'pending', 'failed'] as const

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  }
  const s = styles[status] ?? styles.pending

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
      {status}
    </span>
  )
}

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function getExplorerUrl(chain: string, txHash: string): string {
  const bases: Record<string, string> = {
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    solana: 'https://solscan.io/tx/',
  }
  return `${bases[chain] ?? ''}${txHash}`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function PaymentManagementClient() {
  const [data, setData] = useState<PaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [chainFilter, setChainFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDoc | null>(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (chainFilter) params.set('chain', chainFilter)

      const res = await fetch(`/api/admin-payments?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, chainFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const openDetail = (payment: PaymentDoc) => {
    setSelectedPayment(payment)
    setNoteText(payment.adminNote ?? '')
  }

  const closeDetail = () => {
    setSelectedPayment(null)
    setNoteText('')
  }

  const saveNote = async () => {
    if (!selectedPayment) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/admin-payments/${selectedPayment.id}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: noteText }),
      })
      if (res.ok) {
        setSelectedPayment({ ...selectedPayment, adminNote: noteText })
        fetchPayments()
      }
    } finally {
      setSavingNote(false)
    }
  }

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
            Payments
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
            All subscription payments
            {data && ` · ${data.totalDocs} total`}
          </p>
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams()
            if (statusFilter) params.set('status', statusFilter)
            if (chainFilter) params.set('chain', chainFilter)
            window.location.href = `/api/admin-payments/export?${params}`
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

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by tx hash or email..."
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
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? capitalize(s) : 'All Statuses'}
            </option>
          ))}
        </select>
        <select
          value={chainFilter}
          onChange={(e) => {
            setChainFilter(e.target.value)
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
          {CHAIN_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c ? capitalize(c) : 'All Chains'}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.8fr 0.8fr 0.6fr 0.7fr 0.7fr 1.2fr',
            padding: '10px 20px',
            borderBottom: '1px solid var(--theme-border-color)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--theme-elevation-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <span>Date</span>
          <span>User</span>
          <span>Chain</span>
          <span>Asset</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Tx Hash</span>
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
            No payments found.
          </div>
        ) : (
          data.docs.map((payment, i) => (
            <div
              key={payment.id}
              onClick={() => openDetail(payment)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.8fr 0.8fr 0.6fr 0.7fr 0.7fr 1.2fr',
                padding: '12px 20px',
                borderBottom:
                  i < data.docs.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--theme-elevation-150)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ''
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
                {new Date(payment.createdAt).toLocaleDateString()}
              </span>
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
                  {payment.user.displayName || payment.user.email || 'Unknown'}
                </div>
                {payment.user.displayName && payment.user.email && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--theme-elevation-400)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {payment.user.email}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
                {capitalize(payment.chain)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
                {payment.asset}
              </span>
              <span
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--theme-elevation-800)' }}
              >
                ${payment.amount}
              </span>
              <StatusBadge status={payment.status} />
              <a
                href={getExplorerUrl(payment.chain, payment.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: '12px',
                  color: 'var(--theme-elevation-500)',
                  fontFamily: 'monospace',
                  textDecoration: 'underline',
                }}
              >
                {truncateHash(payment.txHash)}
              </a>
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

      {/* Payment Detail Drawer */}
      {selectedPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={closeDetail}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
            }}
          />
          {/* Drawer */}
          <div
            style={{
              position: 'relative',
              width: '480px',
              maxWidth: '100vw',
              background: 'var(--theme-elevation-0)',
              borderLeft: '1px solid var(--theme-border-color)',
              overflow: 'auto',
              padding: '24px',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--theme-elevation-800)',
                }}
              >
                Payment Detail
              </h2>
              <button
                onClick={closeDetail}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--theme-elevation-500)',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <DetailRow label="Status">
                <StatusBadge status={selectedPayment.status} />
              </DetailRow>
              <DetailRow label="Amount">
                ${selectedPayment.amount} {selectedPayment.asset}
              </DetailRow>
              <DetailRow label="Chain">{capitalize(selectedPayment.chain)}</DetailRow>
              <DetailRow label="Tx Hash">
                <a
                  href={getExplorerUrl(selectedPayment.chain, selectedPayment.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--theme-elevation-600)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedPayment.txHash}
                </a>
              </DetailRow>
              <DetailRow label="User">
                {selectedPayment.user.displayName || selectedPayment.user.email || 'Unknown'}
                {selectedPayment.user.email && (
                  <div style={{ fontSize: '11px', color: 'var(--theme-elevation-400)' }}>
                    {selectedPayment.user.email}
                  </div>
                )}
              </DetailRow>
              {selectedPayment.walletAddress && (
                <DetailRow label="Wallet">
                  <span
                    style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}
                  >
                    {selectedPayment.walletAddress}
                  </span>
                </DetailRow>
              )}
              <DetailRow label="Created">
                {new Date(selectedPayment.createdAt).toLocaleString()}
              </DetailRow>
              {selectedPayment.confirmedAt && (
                <DetailRow label="Confirmed">
                  {new Date(selectedPayment.confirmedAt).toLocaleString()}
                </DetailRow>
              )}

              {/* Admin Note */}
              <div
                style={{
                  marginTop: '8px',
                  borderTop: '1px solid var(--theme-border-color)',
                  paddingTop: '16px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--theme-elevation-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                  }}
                >
                  Admin Note
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid var(--theme-border-color)',
                    borderRadius: '6px',
                    background: 'var(--theme-elevation-50)',
                    color: 'var(--theme-elevation-800)',
                    fontFamily: 'system-ui, sans-serif',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                  placeholder="Add internal notes about this payment..."
                />
                <button
                  onClick={saveNote}
                  disabled={savingNote || noteText === (selectedPayment.adminNote ?? '')}
                  style={{
                    marginTop: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid var(--theme-border-color)',
                    borderRadius: '4px',
                    background:
                      noteText !== (selectedPayment.adminNote ?? '')
                        ? 'var(--theme-elevation-800)'
                        : 'var(--theme-elevation-50)',
                    color:
                      noteText !== (selectedPayment.adminNote ?? '')
                        ? 'var(--theme-elevation-0)'
                        : 'var(--theme-elevation-400)',
                    cursor:
                      savingNote || noteText === (selectedPayment.adminNote ?? '')
                        ? 'default'
                        : 'pointer',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
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
      <div style={{ fontSize: '13px', color: 'var(--theme-elevation-800)' }}>{children}</div>
    </div>
  )
}
