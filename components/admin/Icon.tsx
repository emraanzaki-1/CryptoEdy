/**
 * CryptoEdy admin icon — shown in collapsed sidebar and browser tab favicon area.
 * Payload renders this as admin.components.graphics.Icon.
 */
export default function AdminIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CryptoEdy"
    >
      <rect x="16" y="2" width="20" height="20" rx="3" transform="rotate(45 16 2)" fill="#f7931a" />
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
  )
}
