'use client'

import { ChevronDown } from 'lucide-react'

const FAQS = [
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
] as const

export function FAQSection() {
  return (
    <section className="bg-surface-container-low flex flex-col gap-10 rounded-2xl px-6 py-14 md:flex-row md:gap-16 md:px-10">
      {/* Left — trust headline */}
      <div className="flex flex-col gap-3 md:sticky md:top-24 md:max-w-xs md:self-start md:pt-2">
        <span className="text-primary text-xs font-semibold tracking-[0.05em] uppercase">FAQ</span>
        <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
          Trusted by 5,000+ investors.
        </h2>
        <p className="text-on-surface-variant mt-1 text-sm leading-relaxed">
          Still unsure? The team replies personally to every inquiry. Reach out anytime.
        </p>
      </div>

      {/* Right — accordion */}
      <div className="flex flex-1 flex-col gap-3">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="bg-surface-container-lowest group cursor-pointer rounded-2xl p-5 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="text-on-surface flex items-center justify-between text-sm font-bold outline-none">
              {faq.question}
              <ChevronDown className="text-on-surface-variant size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
