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
    <section className="bg-surface-container-low mb-16 rounded-xl px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-on-surface mb-2 text-2xl font-bold">Trusted by 5,000+ Investors</h2>
        <p className="text-on-surface-variant text-sm">
          Frequently asked questions about CryptoEdy Pro.
        </p>
      </div>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {FAQS.map((faq) => (
          <details
            key={faq.question}
            className="group bg-surface-container-lowest cursor-pointer rounded-xl p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="text-on-surface flex items-center justify-between text-base font-bold outline-none">
              {faq.question}
              <ChevronDown className="text-on-surface-variant size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p className="text-on-surface-variant mt-4 text-sm leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
