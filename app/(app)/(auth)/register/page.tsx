'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        username: form.username,
        password: form.password,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Registration failed')
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-3xl font-black tracking-[-0.033em] sm:text-4xl">
          Create your account
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Join CryptoEdy Research to unlock premium market insights.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="username"
          >
            Username
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a display name"
              value={form.username}
              onChange={handleChange}
              required
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="password"
          >
            Password
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button
            type="submit"
            disabled={loading}
            className="from-primary to-primary-container text-on-primary flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-b text-base font-bold tracking-[0.015em] shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div className="mt-2 text-center">
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary-container ml-1 font-bold transition-colors"
          >
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  )
}
