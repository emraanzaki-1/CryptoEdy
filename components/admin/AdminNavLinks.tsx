import React from 'react'
import Link from 'next/link'

export default function AdminNavLinks() {
  return (
    <div
      className="nav-group"
      style={{
        marginTop: '8px',
        borderTop: '1px solid var(--theme-elevation-150)',
        paddingTop: '8px',
      }}
    >
      <Link href="/admin/user-management" className="nav__link" id="nav-user-management">
        <span className="nav__link-label">App Users</span>
      </Link>
      <Link href="/admin/subscribers" className="nav__link" id="nav-subscribers">
        <span className="nav__link-label">Subscribers</span>
      </Link>
    </div>
  )
}
