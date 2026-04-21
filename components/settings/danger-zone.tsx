'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangle } from 'lucide-react'
import { deleteAccount } from '@/lib/profile/actions'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-field'

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
      <h3 className="text-error text-body-lg mb-2 font-bold">Danger Zone</h3>
      <p className="text-on-surface-variant text-body-lg mb-6">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      {!confirming ? (
        <Button
          variant="danger"
          onClick={() => setConfirming(true)}
          className="text-body-sm rounded-full px-6 py-3 font-bold"
        >
          Delete account
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="bg-error/10 flex items-start gap-3 rounded-2xl p-4">
            <AlertTriangle className="text-error mt-0.5 size-5 shrink-0" />
            <div className="text-body-sm">
              <p className="text-on-surface font-semibold">Are you absolutely sure?</p>
              <p className="text-on-surface-variant mt-1">
                Type <span className="text-error font-semibold">{userEmail || 'your email'}</span>{' '}
                to confirm deletion.
              </p>
            </div>
          </div>

          <FormInput
            type="email"
            variant="danger"
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value)
              setError(null)
            }}
            placeholder="Type your email to confirm"
          />

          {error && <p className="text-error text-body-sm font-medium">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setConfirming(false)
                setConfirmEmail('')
                setError(null)
              }}
              disabled={deleting}
              className="text-body-sm rounded-full px-6 py-3 font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting || !confirmEmail.trim()}
              loading={deleting}
              className="text-body-sm rounded-full px-6 py-3 font-bold"
            >
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
