'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { deleteAccount } from '@/lib/profile/actions'

interface DangerZoneProps {
  userEmail?: string
}

export function DangerZone({ userEmail }: DangerZoneProps) {
  const [confirming, setConfirming] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    const result = await deleteAccount(confirmEmail)

    if (result.ok) {
      await signOut({ callbackUrl: '/' })
    } else {
      setError(result.error)
      setDeleting(false)
    }
  }

  return (
    <div className="border-error/20 bg-error-container/20 mt-12 rounded-3xl border p-8">
      <h3 className="text-error mb-2 text-base font-bold">Danger Zone</h3>
      <p className="text-on-surface-variant mb-6 text-base">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="bg-error text-on-error hover:bg-error/90 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-colors"
        >
          Delete account
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-error/10 flex items-start gap-3 rounded-2xl p-4">
            <AlertTriangle className="text-error mt-0.5 size-5 shrink-0" />
            <div className="text-sm">
              <p className="text-on-surface font-semibold">Are you absolutely sure?</p>
              <p className="text-on-surface-variant mt-1">
                Type <span className="text-error font-semibold">{userEmail || 'your email'}</span>{' '}
                to confirm deletion.
              </p>
            </div>
          </div>

          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value)
              setError(null)
            }}
            placeholder="Type your email to confirm"
            className="border-error/30 text-on-surface placeholder:text-outline focus:border-error focus:ring-error w-full rounded-2xl border bg-transparent px-5 py-3.5 text-base transition-all focus:ring-2"
          />

          {error && <p className="text-error text-sm font-medium">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setConfirming(false)
                setConfirmEmail('')
                setError(null)
              }}
              disabled={deleting}
              className="text-on-surface-variant hover:bg-surface-container rounded-full px-6 py-3 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || !confirmEmail.trim()}
              className="bg-error text-on-error hover:bg-error/90 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
