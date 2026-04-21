import { ChevronDown } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function ArticleFAQ() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'faqs',
      where: { slug: { equals: 'article' } },
      limit: 1,
    })

    const group = result.docs[0]
    if (!group?.items || group.items.length === 0) return null

    return (
      <section className="mt-10 pt-10">
        <h2 className="text-on-background text-subtitle mb-6 font-bold">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-3">
          {group.items.map((item: { question: string; answer: string }) => (
            <details
              key={item.question}
              className="bg-surface-container-low group cursor-pointer rounded-2xl p-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="text-on-surface text-body-sm flex items-center justify-between font-bold outline-none">
                {item.question}
                <ChevronDown className="text-on-surface-variant size-4 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-on-surface-variant text-body-sm mt-3">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    )
  } catch {
    return null
  }
}
