import { ChevronDown } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { LAYOUT } from '@/lib/config/layout'
import { getPayload } from 'payload'
import config from '@payload-config'

const FALLBACK_FAQS = [
  {
    question: 'How often do you publish reports?',
    answer:
      'We publish comprehensive deep-dives bi-weekly, alongside shorter, timely macro updates every Monday. Trade alerts are sent as opportunities arise.',
  },
  {
    question: 'What is the 3X Value Guarantee?',
    answer:
      'If you follow our documented high-conviction calls with standard risk management for a full year and do not realize at least 3x the cost of your subscription in profit, we will refund your year or grant another year free.',
  },
  {
    question: 'Can I pay with cryptocurrency?',
    answer:
      'Yes. We accept USDC and USDT on Ethereum, Arbitrum, and Solana networks via our secure checkout portal.',
  },
]

interface FAQSectionProps {
  /** Payload FAQ group slug to fetch. Defaults to 'homepage'. */
  slug?: string
  /** Overline text above heading. Defaults to 'FAQ'. */
  overline?: string
  /** Section heading content. Defaults to 'Trusted by 5,000+ investors.' */
  heading?: React.ReactNode
  /** Subtitle below heading. */
  subtitle?: string
}

export async function FAQSection({
  slug = 'homepage',
  overline = 'FAQ',
  heading = 'Trusted by 5,000+ investors.',
  subtitle = 'Still unsure? The team replies personally to every inquiry. Reach out anytime.',
}: FAQSectionProps = {}) {
  let faqs = FALLBACK_FAQS

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'faqs',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const group = result.docs[0]
    if (group?.items && group.items.length > 0) {
      faqs = group.items.map((item: { question: string; answer: string }) => ({
        question: item.question,
        answer: item.answer,
      }))
    }
  } catch {
    // Fall back to hardcoded FAQs
  }

  return (
    <section
      className={`bg-surface-container-low flex flex-col gap-10 rounded-2xl md:flex-row md:gap-16 ${LAYOUT.spacing.section}`}
    >
      {/* Left — trust headline */}
      <SectionHeading
        variant="landing"
        overline={overline}
        subtitle={subtitle}
        className="md:sticky md:top-24 md:max-w-xs md:self-start md:pt-2"
      >
        {heading}
      </SectionHeading>

      {/* Right — accordion */}
      <div className="flex flex-1 flex-col gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className={`bg-surface-container-lowest group cursor-pointer rounded-2xl shadow-sm [&_summary::-webkit-details-marker]:hidden ${LAYOUT.spacing.card}`}
          >
            <summary className="text-on-surface text-body-sm flex items-center justify-between font-bold outline-none">
              {faq.question}
              <ChevronDown className="text-on-surface-variant size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-on-surface-variant text-body-sm mt-3">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
