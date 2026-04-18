export function DangerZone() {
  return (
    <div className="border-error/20 bg-error-container/20 mt-12 rounded-3xl border p-8">
      <h3 className="text-error mb-2 text-base font-bold">Danger Zone</h3>
      <p className="text-on-surface-variant mb-6 text-base">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button className="bg-error text-on-error hover:bg-error/90 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-colors">
        Delete account
      </button>
    </div>
  )
}
