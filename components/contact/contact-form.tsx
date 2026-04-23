'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AtSign, Briefcase } from 'lucide-react'
import { GuestSection } from '@/components/layouts/guest-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { FormField, FormInput, FormTextarea, FormSelect } from '@/components/ui/form-field'
import { Heading, Title } from '@/components/ui/typography'

const SUBJECTS = ['Editorial Inquiry', 'Technical Support', 'Partnership', 'Other'] as const

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(SUBJECTS),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
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
    <>
      {/* ── Hero Section ── */}
      <GuestSection className="mb-20">
        <div>
          <span className="text-primary text-overline mb-4 block font-bold uppercase">Contact</span>
          <Heading as="h1" size="lg" className="mb-6 font-black">
            Get in Touch with the <span className="text-primary">CryptoEdy</span> Team.
          </Heading>
          <p className="text-on-surface-variant text-subtitle max-w-2xl">
            For research inquiries, editorial feedback, or partnership opportunities, our team is
            standing by to provide the clarity you require.
          </p>
        </div>
      </GuestSection>

      {/* ── Contact & Form Grid ── */}
      <GuestSection className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Information Panel */}
        <div className="space-y-12 lg:col-span-4">
          <div>
            <h3 className="text-on-surface-variant text-overline mb-6 font-bold uppercase">
              Contact Channels
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <AtSign className="text-primary mt-1 size-5" />
                <div>
                  <p className="text-body-sm font-bold">Research &amp; Insights</p>
                  <p className="text-on-surface-variant">research@cryptoedy.com</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Briefcase className="text-primary mt-1 size-5" />
                <div>
                  <p className="text-body-sm font-bold">General Inquiries</p>
                  <p className="text-on-surface-variant">hello@cryptoedy.com</p>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-on-surface-variant text-overline mb-6 font-bold uppercase">
              Social
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="#"
                className="bg-surface-container-lowest hover:bg-surface-container-high flex items-center gap-3 rounded-xl p-4 transition-colors"
              >
                <span className="text-body-sm font-bold">Twitter / X</span>
              </a>
              <a
                href="#"
                className="bg-surface-container-lowest hover:bg-surface-container-high flex items-center gap-3 rounded-xl p-4 transition-colors"
              >
                <span className="text-body-sm font-bold">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <Card variant="elevated" className="p-8 md:p-12 lg:col-span-8">
          {submitted ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
              <div className="bg-primary/10 text-primary text-headline mb-4 flex size-16 items-center justify-center rounded-full">
                ✓
              </div>
              <Title as="h2" className="mb-2 font-black">
                Message Sent
              </Title>
              <p className="text-on-surface-variant text-body-sm max-w-sm">
                Thank you for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {serverError && (
                <div className="bg-error-container text-on-error-container text-body-sm rounded-xl px-4 py-3">
                  {serverError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormField label="Full Name" htmlFor="name" error={errors.name?.message}>
                  <FormInput
                    id="name"
                    variant="outlined"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                  />
                </FormField>
                <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
                  <FormInput
                    id="email"
                    variant="outlined"
                    type="email"
                    placeholder="john@company.com"
                    {...register('email')}
                  />
                </FormField>
              </div>

              <FormField label="Subject" htmlFor="subject" error={errors.subject?.message}>
                <FormSelect id="subject" variant="outlined" {...register('subject')}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              <FormField label="Message" htmlFor="message" error={errors.message?.message}>
                <FormTextarea
                  id="message"
                  variant="outlined"
                  rows={6}
                  placeholder="Your inquiry details..."
                  {...register('message')}
                />
              </FormField>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gradient"
                  size="xxl"
                  loading={isSubmitting}
                  className="w-full px-12 md:w-auto"
                >
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </GuestSection>
    </>
  )
}
