'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AtSign, Briefcase } from 'lucide-react'
import { GuestNav } from '@/components/layouts/guest-nav'
import { Footer } from '@/components/layouts/footer'

const SUBJECTS = ['Editorial Inquiry', 'Technical Support', 'Partnership', 'Other'] as const

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(SUBJECTS),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [serverError, setServerError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: 'Editorial Inquiry' },
  })

  async function onSubmit(data: ContactFormData) {
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="bg-surface relative flex min-h-screen w-full flex-col overflow-x-clip">
      <div className="bg-surface-container-highest/80 sticky top-0 z-50 w-full backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <GuestNav />
        </div>
      </div>

      <main className="flex-1 pt-16 pb-24">
        {/* ── Hero Section ── */}
        <section className="mx-auto mb-20 max-w-[1200px] px-4 md:px-8">
          <div>
            <span className="text-primary text-overline mb-4 block font-bold tracking-[0.2em] uppercase">
              Contact
            </span>
            <h1 className="text-headline-lg text-on-surface mb-6 leading-[0.95] font-black">
              Get in Touch with the <span className="text-primary">CryptoEdy</span> Team.
            </h1>
            <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
              For research inquiries, editorial feedback, or partnership opportunities, our team is
              standing by to provide the clarity you require.
            </p>
          </div>
        </section>

        {/* ── Contact & Form Grid ── */}
        <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 px-4 md:px-8 lg:grid-cols-12">
          {/* Information Panel */}
          <div className="space-y-12 lg:col-span-4">
            <div>
              <h3 className="text-on-surface-variant text-overline mb-6 font-bold tracking-[0.05em] uppercase">
                Contact Channels
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <AtSign className="text-primary mt-1 size-5" />
                  <div>
                    <p className="text-sm font-bold">Research &amp; Insights</p>
                    <p className="text-on-surface-variant">research@cryptoedy.com</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Briefcase className="text-primary mt-1 size-5" />
                  <div>
                    <p className="text-sm font-bold">General Inquiries</p>
                    <p className="text-on-surface-variant">hello@cryptoedy.com</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-on-surface-variant text-overline mb-6 font-bold tracking-[0.05em] uppercase">
                Social
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="#"
                  className="bg-surface-container-lowest hover:bg-surface-container-high flex items-center gap-3 rounded-xl p-4 transition-colors"
                >
                  <span className="text-sm font-bold">Twitter / X</span>
                </a>
                <a
                  href="#"
                  className="bg-surface-container-lowest hover:bg-surface-container-high flex items-center gap-3 rounded-xl p-4 transition-colors"
                >
                  <span className="text-sm font-bold">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-12px_rgba(11,28,48,0.06)] md:p-12 lg:col-span-8">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="bg-primary/10 text-primary text-headline mb-4 flex size-16 items-center justify-center rounded-full">
                  ✓
                </div>
                <h2 className="text-on-surface mb-2 text-xl font-black">Message Sent</h2>
                <p className="text-on-surface-variant max-w-sm text-sm">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {serverError && (
                  <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm">
                    {serverError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-on-surface-variant text-overline font-bold tracking-[0.05em] uppercase"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="bg-surface-container-low text-on-surface placeholder:text-outline-variant focus:ring-primary/20 w-full rounded-lg border-none px-6 py-4 text-sm transition-all outline-none focus:ring-2"
                      {...register('name')}
                    />
                    {errors.name && <p className="text-error text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-on-surface-variant text-overline font-bold tracking-[0.05em] uppercase"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className="bg-surface-container-low text-on-surface placeholder:text-outline-variant focus:ring-primary/20 w-full rounded-lg border-none px-6 py-4 text-sm transition-all outline-none focus:ring-2"
                      {...register('email')}
                    />
                    {errors.email && <p className="text-error text-xs">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-on-surface-variant text-overline font-bold tracking-[0.05em] uppercase"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    className="bg-surface-container-low text-on-surface focus:ring-primary/20 w-full rounded-lg border-none px-6 py-4 text-sm transition-all outline-none focus:ring-2"
                    {...register('subject')}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-error text-xs">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-on-surface-variant text-overline font-bold tracking-[0.05em] uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Your inquiry details..."
                    className="bg-surface-container-low text-on-surface placeholder:text-outline-variant focus:ring-primary/20 w-full resize-none rounded-lg border-none px-6 py-4 text-sm transition-all outline-none focus:ring-2"
                    {...register('message')}
                  />
                  {errors.message && <p className="text-error text-xs">{errors.message.message}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="from-primary to-primary-container text-on-primary hover:shadow-primary/20 w-full rounded-xl bg-gradient-to-b px-12 py-5 font-bold tracking-[0.015em] transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 md:w-auto"
                  >
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
