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
      <Link href="/admin/payments" className="nav__link" id="nav-payments">
        <span className="nav__link-label">Payments</span>
      </Link>
      <Link href="/admin/subscriptions" className="nav__link" id="nav-subscriptions">
        <span className="nav__link-label">Subscriptions</span>
      </Link>
    </div>
  )
}
