/**
 * CryptoEdy admin sidebar logo.
 * Rendered by Payload as admin.components.graphics.Logo.
 * This is a React Server Component — no 'use client' needed.
 */
export default function AdminLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '4px 0',
      }}
    >
      {/* BTC-orange diamond icon */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="16"
          y="2"
          width="20"
          height="20"
          rx="3"
          transform="rotate(45 16 2)"
          fill="#f7931a"
        />
        {/* Stylised ₿ letterform */}
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#0d1117"
          fontFamily="system-ui, sans-serif"
        >
          ₿
        </text>
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--theme-elevation-800)',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1,
        }}
      >
        Crypto
        <span style={{ color: '#f7931a' }}>Edy</span>
      </span>
    </div>
  )
}
