/**
 * CryptoEdy dashboard welcome banner.
 * Injected via admin.components.beforeDashboard.
 * Uses Payload CSS variables so it adapts to both light and dark themes.
 */
export default function DashboardBanner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-border-color)',
        borderLeft: '4px solid #f7931a',
        borderRadius: '8px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* BTC orange diamond icon */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
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

      {/* Text */}
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--theme-elevation-800)',
            lineHeight: 1.4,
          }}
        >
          Welcome to the <span style={{ color: '#f7931a' }}>CryptoEdy</span> Content Studio
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: '13px',
            color: 'var(--theme-elevation-500)',
            lineHeight: 1.5,
          }}
        >
          Publish posts, manage authors and media, and keep the feed fresh for your readers.
        </p>
      </div>
    </div>
  )
}
