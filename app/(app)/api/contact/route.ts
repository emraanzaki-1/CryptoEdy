import { NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.enum(['Editorial Inquiry', 'Technical Support', 'Partnership', 'Other']),
  message: z.string().min(10).max(5000),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // TODO: integrate email sending (e.g. Resend, SendGrid)
    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message.slice(0, 50) + (data.message.length > 50 ? '…' : ''),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data.', details: err.flatten().fieldErrors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
