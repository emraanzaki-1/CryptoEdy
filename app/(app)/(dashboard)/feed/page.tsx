'use client'

import { useState, useEffect } from 'react'
import { FilterChip } from '@/components/ui/filter-chip'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { ArticleCardList } from '@/components/feed/article-card-list'
import { FeedGridSkeleton, FeedListSkeleton } from '@/components/feed/article-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

const FILTERS = ['All', 'Research', 'Analysis', 'News'] as const

const ARTICLES = [
  {
    title: 'Institutional Adoption: The Next Wave of Bitcoin Accumulation',
    excerpt:
      'An in-depth analysis of Q3 institutional inflows, ETF volume dynamics, and on-chain accumulation patterns pointing towards a supply squeeze.',
    category: 'Research Report',
    readTime: '18 min read',
    date: 'Today',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFtf81vbiTwf7Oj1uOITLZVkhvRPxSZ6LEXDfuaqbMgrZT9zcMeV6hCE1gB0y-XGfNuw_EYokVybYONjztiuUJJDQU78mOynIPWltbmQWKC-hiv3J1G7YVS7jsXLif3bYV-7hU5jzZPoPo7A7_YitEmqjJuYRg39DE2PTmByf4BVBc2kv1n-Mf8T3rwszNOiP3eozChvcfd4JXRmRVYYG3OlHol6IYoefNzxMLhv8yYhgw_sUlz9BKPGQpUiW4qNYiNsbm6g7bfML3',
    imageAlt: 'Abstract 3D rendering of gold Bitcoin coins floating against a dark background',
    isPro: true,
    slug: 'institutional-adoption-bitcoin',
  },
  {
    title: 'Ethereum L2 Ecosystem: Value Accrual Models',
    excerpt:
      'Evaluating fee generation, sequencer profitability, and the long-term impact of EIP-4844 on leading Layer 2 networks.',
    category: 'Analysis',
    readTime: '12 min read',
    date: 'Yesterday',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJC3iwSAK4uIwMtAzBNx53zUU5gd-A1jPR07EEVRJmFSEvHPbG1jCmQAozThLYy5ecybp21mTkmMu5zsOmQcoZrhJVwQQJwrGd6EEQOLOOE0zGPxwhLWAhmg8tm7rFfVtwccwhQ75il-wqyR_GZAy1iL6LoC_A5QZqu8s-y7hNnm69q3MtLd_nAo1b7hwoo507giwH4D3AIhBjDk9aIYtmpRsePGjLUJiIxzJzqblr6ZfL2hY2SMMGsv54X6J0usMogV8hscFu-UMQ',
    imageAlt: 'Glowing blue Ethereum logo with interconnected network nodes',
    isPro: true,
    slug: 'ethereum-l2-value-accrual',
  },
  {
    title: 'Macro Weekly: Rates Divergence and Crypto Correlation',
    excerpt:
      'How shifting central bank policies are breaking traditional equity-crypto correlations in the current quarter.',
    category: 'Market Update',
    readTime: '5 min read',
    date: '2 days ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlBXGoluDG6DlSePaZ2o7YnnZbEqYNButalR7P69pOlmwqyMJyFiADUVPNHMmOlKRR3lDN2gCRJ1p5X-0XUcH68TrHn8GXKjgMZjugU2tLEIP3VBVxtjnj9KKeAtqk1z8NL755RCbZVfqcF2ZSWV-SeJy6hN0m1iRwoXYaw6srmkEmSB3_aGiLumvMPrwiPsBTiy0p60-9UZaXc8Ydm8lj6-oj7ogqd78SEhJaG39tASET5_GdCDordaCE8UJ9LL4ddyq5ruFB7UKK',
    imageAlt: 'Financial trading charts with candlestick patterns on a dark blue background',
    isPro: false,
    slug: 'macro-weekly-rates-divergence',
  },
  {
    title: 'DeFi Lending Protocols: Risk Assessment Framework',
    excerpt:
      'A comprehensive review of the security models, liquidation engines, and collateral ratios of top decentralized lending platforms.',
    category: 'Research Report',
    readTime: '15 min read',
    date: '3 days ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFtf81vbiTwf7Oj1uOITLZVkhvRPxSZ6LEXDfuaqbMgrZT9zcMeV6hCE1gB0y-XGfNuw_EYokVybYONjztiuUJJDQU78mOynIPWltbmQWKC-hiv3J1G7YVS7jsXLif3bYV-7hU5jzZPoPo7A7_YitEmqjJuYRg39DE2PTmByf4BVBc2kv1n-Mf8T3rwszNOiP3eozChvcfd4JXRmRVYYG3OlHol6IYoefNzxMLhv8yYhgw_sUlz9BKPGQpUiW4qNYiNsbm6g7bfML3',
    imageAlt: 'Abstract 3D rendering of gold Bitcoin coins',
    isPro: true,
    slug: 'defi-lending-risk-framework',
  },
  {
    title: 'Tokenomics Review: Sustainable Yield Generation',
    excerpt:
      'Analyzing mechanisms for long-term value creation and the shift away from inflationary reward emission schedules.',
    category: 'Analysis',
    readTime: '10 min read',
    date: '4 days ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJC3iwSAK4uIwMtAzBNx53zUU5gd-A1jPR07EEVRJmFSEvHPbG1jCmQAozThLYy5ecybp21mTkmMu5zsOmQcoZrhJVwQQJwrGd6EEQOLOOE0zGPxwhLWAhmg8tm7rFfVtwccwhQ75il-wqyR_GZAy1iL6LoC_A5QZqu8s-y7hNnm69q3MtLd_nAo1b7hwoo507giwH4D3AIhBjDk9aIYtmpRsePGjLUJiIxzJzqblr6ZfL2hY2SMMGsv54X6J0usMogV8hscFu-UMQ',
    imageAlt: 'Glowing blue Ethereum logo with network nodes',
    isPro: true,
    slug: 'tokenomics-sustainable-yield',
  },
  {
    title: 'Regulatory Landscape: MiCA Framework Implementation',
    excerpt:
      'Understanding the impending compliance requirements and their potential impact on European crypto asset service providers.',
    category: 'Market Update',
    readTime: '6 min read',
    date: '5 days ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlBXGoluDG6DlSePaZ2o7YnnZbEqYNButalR7P69pOlmwqyMJyFiADUVPNHMmOlKRR3lDN2gCRJ1p5X-0XUcH68TrHn8GXKjgMZjugU2tLEIP3VBVxtjnj9KKeAtqk1z8NL755RCbZVfqcF2ZSWV-SeJy6hN0m1iRwoXYaw6srmkEmSB3_aGiLumvMPrwiPsBTiy0p60-9UZaXc8Ydm8lj6-oj7ogqd78SEhJaG39tASET5_GdCDordaCE8UJ9LL4ddyq5ruFB7UKK',
    imageAlt: 'Financial trading charts on dark background',
    isPro: false,
    slug: 'regulatory-mica-framework',
  },
  {
    title: 'Zero-Knowledge Rollups: Scaling the Future',
    excerpt:
      'A deep dive into ZK-EVM architectures, privacy implications, and the performance trade-offs of next-generation scaling solutions.',
    category: 'Research Report',
    readTime: '22 min read',
    date: '1 week ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFtf81vbiTwf7Oj1uOITLZVkhvRPxSZ6LEXDfuaqbMgrZT9zcMeV6hCE1gB0y-XGfNuw_EYokVybYONjztiuUJJDQU78mOynIPWltbmQWKC-hiv3J1G7YVS7jsXLif3bYV-7hU5jzZPoPo7A7_YitEmqjJuYRg39DE2PTmByf4BVBc2kv1n-Mf8T3rwszNOiP3eozChvcfd4JXRmRVYYG3OlHol6IYoefNzxMLhv8yYhgw_sUlz9BKPGQpUiW4qNYiNsbm6g7bfML3',
    imageAlt: 'Abstract 3D rendering of gold Bitcoin coins',
    isPro: true,
    slug: 'zk-rollups-scaling',
  },
  {
    title: 'Real World Asset Tokenization Trends',
    excerpt:
      'Examining the infrastructure and institutional demand driving the tokenization of traditional financial assets on public blockchains.',
    category: 'Analysis',
    readTime: '14 min read',
    date: '1 week ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDJC3iwSAK4uIwMtAzBNx53zUU5gd-A1jPR07EEVRJmFSEvHPbG1jCmQAozThLYy5ecybp21mTkmMu5zsOmQcoZrhJVwQQJwrGd6EEQOLOOE0zGPxwhLWAhmg8tm7rFfVtwccwhQ75il-wqyR_GZAy1iL6LoC_A5QZqu8s-y7hNnm69q3MtLd_nAo1b7hwoo507giwH4D3AIhBjDk9aIYtmpRsePGjLUJiIxzJzqblr6ZfL2hY2SMMGsv54X6J0usMogV8hscFu-UMQ',
    imageAlt: 'Glowing blue Ethereum logo with network nodes',
    isPro: true,
    slug: 'rwa-tokenization-trends',
  },
  {
    title: 'Stablecoin Supply Dynamics and Market Liquidity',
    excerpt:
      'How changes in total stablecoin market capitalization serve as a leading indicator for broader market volatility and liquidity.',
    category: 'Market Update',
    readTime: '8 min read',
    date: '2 weeks ago',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlBXGoluDG6DlSePaZ2o7YnnZbEqYNButalR7P69pOlmwqyMJyFiADUVPNHMmOlKRR3lDN2gCRJ1p5X-0XUcH68TrHn8GXKjgMZjugU2tLEIP3VBVxtjnj9KKeAtqk1z8NL755RCbZVfqcF2ZSWV-SeJy6hN0m1iRwoXYaw6srmkEmSB3_aGiLumvMPrwiPsBTiy0p60-9UZaXc8Ydm8lj6-oj7ogqd78SEhJaG39tASET5_GdCDordaCE8UJ9LL4ddyq5ruFB7UKK',
    imageAlt: 'Financial trading charts on dark background',
    isPro: false,
    slug: 'stablecoin-supply-dynamics',
  },
]

export default function FeedPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeFilter, setActiveFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-48 rounded-xl" />
            <Skeleton className="h-5 w-72 rounded" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        {view === 'grid' ? <FeedGridSkeleton /> : <FeedListSkeleton />}
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-on-surface text-[2.5rem] leading-tight font-bold tracking-[-0.04em] lg:text-[3.5rem]">
            Your feed
          </h1>
          <p className="text-on-surface-variant mt-2 text-base">
            Curated financial intelligence and market analysis.
          </p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>

      {/* Feed */}
      {view === 'grid' ? (
        <div className="flex flex-col gap-6">
          {/* Hero — first article full width */}
          {ARTICLES[0] && <ArticleCard {...ARTICLES[0]} hero />}
          {/* Rest in grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
            {ARTICLES.slice(1).map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ARTICLES.map((article) => (
            <ArticleCardList key={article.slug} {...article} />
          ))}
        </div>
      )}
    </div>
  )
}
