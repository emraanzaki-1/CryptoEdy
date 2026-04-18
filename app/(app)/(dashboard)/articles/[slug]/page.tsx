import { Share, Bookmark, Clock } from 'lucide-react'
import Image from 'next/image'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { PaywallGate } from '@/components/article/paywall-gate'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Mock article data — will be replaced with CMS fetch
const ARTICLE = {
  title: 'The Everything Exchange: Why Digital Assets are Re-pricing the World',
  category: 'Research Report',
  isPro: true,
  author: 'CryptoEdy Research Desk',
  date: 'Oct 24, 2024',
  readTime: '18 min read',
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDQd8AZr3kuL0Gg2xoxakaTaJ4IM9SN8Y1ag5PQQeh3VaLe4VoZ0nIbf_avWKP2szhENY7bklhBhL4Mu3iLULDzT13c0740sCI0GSATd6aMb0YC4PclfXwwdfk0e2phogC3RwMlW2Ci2ays0pBMWNVOIA3NwjxFCyxLkY8Z4hiSt0gCf6ppGWZFWvbOFm6vNoaFxiAHuSWxSacuvKw6B5XD1XzxAcnt8O2tMcaR_SXXWsc-U-OdE7qyg9XyBg0NF5IvnzKA91N3_M6g',
  hookParagraph:
    'The structural mechanics of global liquidity are undergoing a profound, irreversible shift. As traditional safe havens fragment under demographic and fiscal pressures, a new asymmetric asset class is absorbing the overflow.',
  bodyParagraphs: [
    'To understand the current cycle, we must first abandon the outdated models of the 2010s. The introduction of spot ETFs was not merely a regulatory milestone; it fundamentally altered the market\'s microstructure. We are no longer operating in an isolated speculative sandbox. We have entered the era of the "Everything Exchange."',
    'Our proprietary on-chain models indicate that the "smart money" accumulation phase ended in late Q2. What we are witnessing now is the systematic re-allocation of risk capital across major financial institutions.',
  ],
  isLocked: true,
}

export default async function ArticleDetailPage() {
  await sleep(1500)
  return (
    <article className="mx-auto max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/feed' },
          { label: 'Research', href: '/feed' },
          { label: ARTICLE.title },
        ]}
        className="mb-8"
      />

      {/* Header */}
      <header className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          {ARTICLE.isPro && <Badge variant="pro">PRO</Badge>}
          <span className="text-primary text-sm font-semibold tracking-wide uppercase">
            {ARTICLE.category}
          </span>
        </div>

        <h1 className="text-on-background mb-6 text-[2.5rem] leading-[1.1] font-black tracking-[-0.04em] md:text-[3rem]">
          {ARTICLE.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="border-outline-variant/15 bg-surface-container-high text-primary flex size-12 items-center justify-center rounded-full border font-bold">
              CE
            </div>
            <div>
              <div className="text-on-background font-bold">{ARTICLE.author}</div>
              <div className="text-outline mt-1 flex items-center gap-3 text-sm">
                <span>{ARTICLE.date}</span>
                <span className="bg-outline-variant size-1 rounded-full" />
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {ARTICLE.readTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Share"
              className="border-outline-variant/15 bg-surface text-on-surface-variant hover:bg-surface-container-low flex size-10 items-center justify-center rounded-full border transition-colors"
            >
              <Share className="size-5" />
            </button>
            <button
              aria-label="Bookmark"
              className="border-outline-variant/15 bg-surface text-on-surface-variant hover:bg-surface-container-low flex size-10 items-center justify-center rounded-full border transition-colors"
            >
              <Bookmark className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="border-outline-variant/15 relative mb-10 h-[400px] w-full overflow-hidden rounded-2xl border shadow-[0_32px_64px_-12px_rgba(11,28,48,0.06)]">
        <Image
          alt="Digital assets visualization"
          className="object-cover"
          src={ARTICLE.imageUrl}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
        />
      </div>

      {/* Content */}
      <section className="prose prose-lg text-on-surface-variant max-w-none leading-[1.6]">
        <p className="border-primary/40 text-on-background mb-8 border-l-[3px] py-2 pl-6 text-xl leading-relaxed font-medium">
          {ARTICLE.hookParagraph}
        </p>

        {ARTICLE.bodyParagraphs.map((paragraph, i) => (
          <p key={i} className="mb-6">
            {paragraph}
          </p>
        ))}

        {/* Paywall gate */}
        {ARTICLE.isLocked && <PaywallGate />}
      </section>
    </article>
  )
}
