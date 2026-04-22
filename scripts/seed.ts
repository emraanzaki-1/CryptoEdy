/**
 * CryptoEdy seed script — Sprint 3
 *
 * Usage:
 *   npm run seed          — seed a clean database (skips if already seeded)
 *   npm run seed:reset    — drop all content and re-seed (dev only)
 *
 * Run after: npm run db:migrate
 */
// env is loaded via scripts/patch-next-env.cjs (preloaded with -r flag)
import { getPayload } from 'payload'
import config from '../payload.config'
import { getDb } from '../lib/db'
import { users, bookmarks } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateReferralCode } from '../lib/auth/referral'
import { faker } from '@faker-js/faker'

const IS_RESET = process.argv.includes('--reset')

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const PARENT_CATEGORIES = [
  {
    name: 'Research',
    slug: 'research',
    description: 'High-conviction picks, deep dives, and research reports.',
    weight: 0,
  },
  {
    name: 'Analysis',
    slug: 'analysis',
    description: 'Market updates, macro direction, and on-chain analysis.',
    weight: 1,
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Crypto School and structured trading courses.',
    weight: 2,
  },
]

// Child categories — `parentSlug` is resolved to an ID at seed time
const CHILD_CATEGORIES = [
  // Research children
  {
    name: 'Top Picks',
    slug: 'top-picks',
    parentSlug: 'research',
    description: 'High-conviction token picks with entry/exit targets and risk ratings.',
    weight: 0,
  },
  {
    name: 'Deep Dives',
    slug: 'deep-dives',
    parentSlug: 'research',
    description: 'In-depth protocol and project research reports.',
    weight: 1,
  },
  {
    name: 'Passive Income',
    slug: 'passive-income',
    parentSlug: 'research',
    description: 'Staking, yield farming, and passive crypto income strategies.',
    weight: 2,
  },
  {
    name: 'Airdrop Reports',
    slug: 'airdrop-reports',
    parentSlug: 'research',
    description: 'Curated guides for upcoming and active airdrop opportunities.',
    weight: 3,
  },
  {
    name: 'Memecoins',
    slug: 'memecoins',
    parentSlug: 'research',
    description: 'Analysis and picks in the memecoin sector.',
    weight: 4,
  },
  // Analysis children
  {
    name: 'Market Updates',
    slug: 'market-updates',
    parentSlug: 'analysis',
    description: 'Regular market condition updates and commentary.',
    weight: 0,
  },
  {
    name: 'Market Direction',
    slug: 'market-direction',
    parentSlug: 'analysis',
    description: 'Macro trend analysis and liquidity flow dashboards.',
    weight: 1,
  },
  {
    name: 'Market Pulse',
    slug: 'market-pulse',
    parentSlug: 'analysis',
    description: 'On-chain data and sentiment indicators.',
    weight: 2,
  },
  {
    name: 'Livestreams',
    slug: 'livestreams',
    parentSlug: 'analysis',
    description: 'Weekly interactive sessions and Q&A recordings.',
    weight: 3,
  },
  // Education children
  {
    name: 'Crypto School',
    slug: 'crypto-school',
    parentSlug: 'education',
    description: 'Beginner-friendly crypto education and learning resources.',
    weight: 0,
  },
  {
    name: 'Trading Course',
    slug: 'trading-course',
    parentSlug: 'education',
    description: 'Structured trading courses with modules and lessons.',
    weight: 1,
  },
]

// Grandchild categories — children of "Crypto School" (3rd level)
const GRANDCHILD_CATEGORIES = [
  {
    name: 'Simply Explained',
    slug: 'simply-explained',
    parentSlug: 'crypto-school',
    description: 'Complex crypto concepts explained in plain language.',
    weight: 0,
  },
  {
    name: 'Videos',
    slug: 'videos',
    parentSlug: 'crypto-school',
    description: 'Educational video content and tutorials.',
    weight: 1,
  },
  {
    name: 'Guides',
    slug: 'guides',
    parentSlug: 'crypto-school',
    description: 'Step-by-step guides for crypto tools and strategies.',
    weight: 2,
  },
  {
    name: 'Blueprint',
    slug: 'blueprint',
    parentSlug: 'crypto-school',
    description: 'Detailed frameworks and playbooks for crypto investing.',
    weight: 3,
  },
]

// ---------------------------------------------------------------------------
// Dummy media — one hero image per post, sourced from Picsum Photos.
// Slugs are used as Picsum seeds so images are deterministic across reseeds.
// ---------------------------------------------------------------------------

const MEDIA_ITEMS = [
  {
    postSlug: 'ethereum-everything-exchange',
    alt: 'Ethereum blockchain network visualization with glowing nodes',
  },
  {
    postSlug: 'solana-defi-season-picks',
    alt: 'Solana DeFi protocols growth chart in a vibrant dashboard',
  },
  {
    postSlug: 'layer2-arbitrage-scaling-wars',
    alt: 'Layer 2 scaling network diagram showing transaction throughput',
  },
  {
    postSlug: 'defi-lending-deep-dive',
    alt: 'DeFi lending protocol liquidity pools and yield analytics',
  },
  {
    postSlug: 'restaking-thesis-eigenlayer',
    alt: 'EigenLayer restaking architecture showing validator nodes',
  },
  {
    postSlug: 'weekly-market-update-btc-consolidates',
    alt: 'Bitcoin price consolidation chart with key support and resistance levels',
  },
  {
    postSlug: 'ethereum-etf-inflows-market-update',
    alt: 'Ethereum ETF institutional inflow data visualization',
  },
  {
    postSlug: 'market-direction-q3-macro-setup',
    alt: 'Global macro analysis chart with Fed policy and M2 supply overlay',
  },
  {
    postSlug: 'understanding-amm-defi-basics',
    alt: 'Automated Market Maker constant product formula diagram',
  },
  {
    postSlug: 'airdrop-report-five-protocols-q3',
    alt: 'Crypto airdrop protocols checklist and qualification guide',
  },
  // Top Picks
  {
    postSlug: 'chainlink-oracle-network-top-pick',
    alt: 'Chainlink oracle node network connecting blockchains to real-world data',
  },
  {
    postSlug: 'avalanche-subnet-model-analysis',
    alt: 'Avalanche subnet architecture diagram with validator nodes',
  },
  {
    postSlug: 'polkadot-interoperability-play',
    alt: 'Polkadot parachain relay chain interoperability visualization',
  },
  {
    postSlug: 'cosmos-atom-internet-of-blockchains',
    alt: 'Cosmos IBC protocol connecting blockchain hubs and zones',
  },
  {
    postSlug: 'xrp-institutional-settlement-layer',
    alt: 'XRP Ledger cross-border payment flow diagram',
  },
  // Deep Dives
  {
    postSlug: 'uniswap-v4-hooks-deep-dive',
    alt: 'Uniswap v4 hook architecture diagram with liquidity pools',
  },
  {
    postSlug: 'bitcoin-halving-historical-patterns',
    alt: 'Bitcoin halving cycle price chart showing four halvings',
  },
  {
    postSlug: 'decentralised-perps-gmx-dydx',
    alt: 'Perpetuals DEX open interest and volume comparison chart',
  },
  // Passive Income
  {
    postSlug: 'liquid-staking-eth-sol-bnb-yields',
    alt: 'Liquid staking yield comparison chart for ETH SOL and BNB',
  },
  {
    postSlug: 'real-yield-protocols-sustainable-apy',
    alt: 'Real yield protocol revenue and token buyback dashboard',
  },
  {
    postSlug: 'curve-wars-bribes-gauges',
    alt: 'Curve Finance gauge voting and bribe incentive flow diagram',
  },
  {
    postSlug: 'rwa-yield-tokenised-tbills',
    alt: 'Tokenised treasury bill yield comparison with DeFi stablecoin rates',
  },
  {
    postSlug: 'liquidity-mining-strategies-hedge',
    alt: 'Concentrated liquidity position range visualisation on Uniswap v3',
  },
  // Airdrop Reports
  {
    postSlug: 'airdrop-season-2025-under-the-radar',
    alt: 'Crypto airdrop opportunity radar with ten unlaunched protocols',
  },
  {
    postSlug: 'arbitrum-retroactive-airdrop-qualify',
    alt: 'Arbitrum on-chain activity checklist for airdrop qualification',
  },
  {
    postSlug: 'zk-protocol-airdrops-zksync-aztec',
    alt: 'ZK rollup ecosystem map showing ZKsync and Aztec protocols',
  },
  // Memecoins
  {
    postSlug: 'pepe-memecoin-anatomy-pump',
    alt: 'PEPE memecoin price pump anatomy with social sentiment overlay',
  },
  {
    postSlug: 'dogecoin-vs-wif-risk-reward',
    alt: 'Dogecoin versus WIF price chart and market cap comparison',
  },
  {
    postSlug: 'memecoin-season-playbook',
    alt: 'Memecoin season entry and exit signal dashboard',
  },
  {
    postSlug: 'solana-memecoins-bonk-wif-popcat',
    alt: 'Solana memecoin ecosystem map with BONK WIF and POPCAT tokens',
  },
  // Market Updates
  {
    postSlug: 'market-update-altcoin-season-green',
    alt: 'Altcoin season index flashing green with Bitcoin dominance declining',
  },
  {
    postSlug: 'market-update-bitcoin-etf-volume-ath',
    alt: 'Bitcoin ETF trading volume at all-time high bar chart',
  },
  {
    postSlug: 'market-wrap-fed-minutes-btc-lower',
    alt: 'Bitcoin price drop following Federal Reserve minutes release',
  },
  {
    postSlug: 'market-update-stablecoin-inflows',
    alt: 'Stablecoin inflow to exchanges chart signalling risk-on sentiment',
  },
  // Market Direction
  {
    postSlug: 'q4-2024-crypto-outlook-100k-bitcoin',
    alt: 'Bitcoin price projection model showing path to 100K USD',
  },
  {
    postSlug: 'bear-case-rate-cuts-delayed',
    alt: 'Federal Reserve dot plot and crypto market correlation bear scenario',
  },
  // Market Pulse
  {
    postSlug: 'onchain-bitcoin-dormancy-flow',
    alt: 'Bitcoin dormancy flow indicator chart showing long-term holder activity',
  },
  {
    postSlug: 'ethereum-nvt-ratio-overvalued',
    alt: 'Ethereum NVT ratio oscillator over 180-day moving average',
  },
  {
    postSlug: 'funding-rates-exchanges-analysis',
    alt: 'Cross-exchange perpetual funding rates heatmap',
  },
  // Livestreams
  {
    postSlug: 'livestream-altcoin-qa-replay',
    alt: 'CryptoEdy live session replay thumbnail with analyst on screen',
  },
  {
    postSlug: 'livestream-macro-tuesday-fed-dxy',
    alt: 'Macro Tuesday livestream showing DXY chart and crypto correlation',
  },
  // Simply Explained
  {
    postSlug: 'bitcoin-basics-utxo-explained',
    alt: 'Bitcoin UTXO model diagram showing inputs outputs and change',
  },
  {
    postSlug: 'how-to-read-crypto-whitepaper',
    alt: 'Crypto whitepaper review checklist with highlighted sections',
  },
  // Guides
  {
    postSlug: 'defi-toolkit-20-essential-tools',
    alt: 'DeFi tool logos arranged in an essential toolkit grid',
  },
  {
    postSlug: 'how-to-use-block-explorers',
    alt: 'Etherscan transaction detail page annotated with key fields',
  },
  {
    postSlug: 'crypto-tax-basics-2024',
    alt: 'Crypto tax calculation spreadsheet with cost basis columns',
  },
  // Simply Explained (Glossary-like)
  {
    postSlug: 'glossary-defi-terms',
    alt: 'DeFi glossary open book with blockchain terminology',
  },
  {
    postSlug: 'glossary-layer2-scaling-terminology',
    alt: 'Layer 2 scaling terminology reference card',
  },
]

const TAGS = [
  { name: 'Ethereum', slug: 'ethereum' },
  { name: 'Bitcoin', slug: 'bitcoin' },
  { name: 'Solana', slug: 'solana' },
  { name: 'DeFi', slug: 'defi' },
  { name: 'Layer 2', slug: 'layer-2' },
  { name: 'Airdrop', slug: 'airdrop' },
  { name: 'Staking', slug: 'staking' },
  { name: 'Memecoins', slug: 'memecoins' },
  { name: 'Macro', slug: 'macro' },
  { name: 'On-chain', slug: 'on-chain' },
]

// Payload CMS editor accounts (use /admin to log in)
const CMS_AUTHORS = [
  {
    email: 'admin@cryptoedy.com',
    password: 'password',
    displayName: 'CryptoEdy Admin',
    role: 'admin' as const,
  },
  {
    email: 'analyst@cryptoedy.com',
    password: 'Analyst123!',
    displayName: 'Lead Analyst',
    role: 'analyst' as const,
  },
]

// NextAuth app users (end-user accounts, use /login)
const APP_USERS = [
  {
    email: 'admin@cryptoedy.com',
    password: 'password',
    role: 'admin' as const,
    emailVerified: true,
    subscriptionExpiry: null,
  },
  {
    email: 'analyst@cryptoedy.com',
    password: 'Analyst123!',
    role: 'analyst' as const,
    emailVerified: true,
    subscriptionExpiry: null,
  },
  {
    email: 'pro@cryptoedy.com',
    password: 'Pro123!',
    role: 'pro' as const,
    emailVerified: true,
    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    email: 'free@cryptoedy.com',
    password: 'Free123!',
    role: 'free' as const,
    emailVerified: true,
    subscriptionExpiry: null,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Download an image from a URL and return it as a Buffer.
 * Uses Picsum Photos with a deterministic seed so the same slug always
 * resolves to the same image (idempotent reseeds).
 */
async function downloadImage(slug: string): Promise<Buffer> {
  // faker.image.urlPicsumPhotos() returns a URL like https://picsum.photos/...
  // We build our own deterministic URL so the same post always gets the same image.
  const url = faker.image.urlPicsumPhotos({ width: 1600, height: 900 })
  // Override with a seed-stable URL to guarantee idempotency
  const deterministicUrl = `https://picsum.photos/seed/${encodeURIComponent(slug)}/1600/900`
  void url // faker is imported so its tree-shaking footprint is explicit
  const response = await fetch(deterministicUrl)
  if (!response.ok)
    throw new Error(`[seed] Image fetch failed (${response.status}): ${deterministicUrl}`)
  return Buffer.from(await response.arrayBuffer())
}

function makeBody(paragraphs: string[]): object {
  return {
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.env.NODE_ENV === 'production' && IS_RESET) {
    console.error('[seed] seed:reset is not allowed in production.')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  if (IS_RESET) {
    console.log('[seed] Resetting — deleting all content...')
    for (const col of [
      'lessons',
      'modules',
      'courses',
      'posts',
      'media',
      'categories',
      'tags',
      'authors',
    ] as const) {
      const existing = await payload.find({ collection: col, limit: 1000, pagination: false })
      for (const doc of existing.docs) {
        await payload.delete({ collection: col, id: doc.id })
      }
    }
    // Reset app data in Drizzle (bookmarks first due to FK)
    await getDb().delete(bookmarks)
    await getDb().delete(users)
    console.log('[seed] Reset complete.')
  }

  // ---- Categories (parent-child hierarchy) ----
  console.log('[seed] Seeding categories...')
  const categoryIdMap: Record<string, string> = {}

  // Seed parent categories first (Research, Analysis, Education)
  for (const parent of PARENT_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: parent.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryIdMap[parent.slug] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: { name: parent.name, slug: parent.slug, description: parent.description },
    })
    categoryIdMap[parent.slug] = created.id as string
  }

  // Seed child categories with parent references
  for (const child of CHILD_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: child.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryIdMap[child.slug] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: {
        name: child.name,
        slug: child.slug,
        description: child.description,
        parent: categoryIdMap[child.parentSlug],
      },
    })
    categoryIdMap[child.slug] = created.id as string
  }

  // Seed grandchild categories (3rd level — children of Crypto School)
  for (const grandchild of GRANDCHILD_CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: grandchild.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryIdMap[grandchild.slug] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: {
        name: grandchild.name,
        slug: grandchild.slug,
        description: grandchild.description,
        parent: categoryIdMap[grandchild.parentSlug],
      },
    })
    categoryIdMap[grandchild.slug] = created.id as string
  }

  console.log(
    `[seed] Categories: ${Object.keys(categoryIdMap).length} ready (3 parents + children + grandchildren).`
  )

  // ---- Tags ----
  console.log('[seed] Seeding tags...')
  const tagIdMap: Record<string, string> = {}
  for (const tag of TAGS) {
    const existing = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      tagIdMap[tag.slug] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({ collection: 'tags', data: tag })
    tagIdMap[tag.slug] = created.id as string
  }
  console.log(`[seed] Tags: ${Object.keys(tagIdMap).length} ready.`)

  // ---- CMS Authors (Payload auth) ----
  console.log('[seed] Seeding CMS authors...')
  const authorIdMap: Record<string, string> = {}
  for (const author of CMS_AUTHORS) {
    const existing = await payload.find({
      collection: 'authors',
      where: { email: { equals: author.email } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      authorIdMap[author.email] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({
      collection: 'authors',
      data: {
        email: author.email,
        password: author.password,
        displayName: author.displayName,
        role: author.role,
      },
    })
    authorIdMap[author.email] = created.id as string
  }
  console.log(`[seed] Authors: ${Object.keys(authorIdMap).length} ready.`)

  // ---- Media ----
  console.log('[seed] Seeding media (downloading from Picsum Photos)...')
  const mediaIdMap: Record<string, string> = {}
  for (const item of MEDIA_ITEMS) {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: `${item.postSlug}.jpg` } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      mediaIdMap[item.postSlug] = existing.docs[0].id as string
      console.log(`[seed]   ↳ ${item.postSlug}.jpg already exists, skipping.`)
      continue
    }

    try {
      const imageBuffer = await downloadImage(item.postSlug)
      const created = await payload.create({
        collection: 'media',
        data: { alt: item.alt },
        file: {
          data: imageBuffer,
          mimetype: 'image/jpeg',
          name: `${item.postSlug}.jpg`,
          size: imageBuffer.byteLength,
        },
      })
      mediaIdMap[item.postSlug] = created.id as string
      console.log(
        `[seed]   ↳ ${item.postSlug}.jpg uploaded (${Math.round(imageBuffer.byteLength / 1024)} KB)`
      )
    } catch (err) {
      console.warn(`[seed]   ↳ Could not seed image for ${item.postSlug}:`, err)
    }
  }
  console.log(`[seed] Media: ${Object.keys(mediaIdMap).length}/${MEDIA_ITEMS.length} ready.`)

  // ---- App users (NextAuth / Drizzle) ----
  console.log('[seed] Seeding app users...')
  for (const appUser of APP_USERS) {
    const [existing] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, appUser.email))
      .limit(1)

    if (existing) continue

    const passwordHash = await bcrypt.hash(appUser.password, 12)
    await getDb().insert(users).values({
      email: appUser.email,
      passwordHash,
      role: appUser.role,
      emailVerified: appUser.emailVerified,
      subscriptionExpiry: appUser.subscriptionExpiry,
      referralCode: generateReferralCode(),
    })
  }
  console.log(`[seed] App users: ${APP_USERS.length} ready.`)

  // ---- Posts ----
  console.log('[seed] Seeding posts...')
  const adminAuthorId = authorIdMap['admin@cryptoedy.com']
  const analystAuthorId = authorIdMap['analyst@cryptoedy.com']

  const POSTS = [
    // 3 × Research / Top Picks (Pro, with risk ratings)
    {
      title: 'Ethereum: The Everything Exchange — Why ETH Remains the Top Pick',
      slug: 'ethereum-everything-exchange',
      excerpt:
        'Despite the noise, Ethereum continues to dominate DeFi TVL and developer activity. Here is why ETH is still the highest-conviction hold in our portfolio.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(7),
      riskRating: 'medium',
      author: adminAuthorId,
      tags: [tagIdMap['ethereum'], tagIdMap['defi']],
      content: makeBody([
        'Ethereum has cemented its position as the backbone of decentralised finance, hosting over $45 billion in total value locked across its ecosystem. Despite competition from alternative layer-1 blockchains, ETH continues to dominate on every metric that matters: developer activity, protocol revenue, and institutional adoption.',
        "The Dencun upgrade introduced EIP-4844, dramatically reducing transaction costs on Layer 2 networks. This directly benefits end users and accelerates the flywheel of activity that drives ETH fee burn — the core of ETH's deflationary supply mechanics.",
        'Our on-chain analysis shows that ETH exchange supply has hit a multi-year low. Long-term holders are not selling. Meanwhile, institutional inflows via ETH ETFs continue to absorb new supply at an accelerating pace.',
        'Entry zone: $2,400–$2,700. 12-month price target: $6,500. Stop loss: $1,900. Risk rating: Medium — execution risk exists from a prolonged risk-off macro environment, but the structural thesis remains intact.',
        'This is our highest-conviction position. Size accordingly and hold through volatility. The Ethereum roadmap, including Verkle trees and further scalability improvements, continues to de-risk the investment thesis.',
      ]),
    },
    {
      title: 'Solana DeFi Season: Three Picks With 5x–10x Potential',
      slug: 'solana-defi-season-picks',
      excerpt:
        "Solana's DeFi ecosystem is heating up. We have identified three undervalued protocols poised to capture disproportionate upside in the next 90 days.",
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(14),
      riskRating: 'high',
      author: analystAuthorId,
      tags: [tagIdMap['solana'], tagIdMap['defi']],
      content: makeBody([
        'Solana has quietly become the second-largest DeFi ecosystem by daily active users, surpassing Ethereum on several days in Q4. The low transaction fees and high throughput have attracted a new wave of retail participants who were previously priced out of Ethereum.',
        'Pick 1: Jupiter (JUP) — The dominant DEX aggregator on Solana with a rapidly expanding product suite including perpetuals and a launchpad. JUP is trading at a significant discount to comparable DEX aggregators on other chains. Target: $3.50.',
        'Pick 2: Raydium (RAY) — The AMM of choice for new token launches on Solana. With memecoin season driving unprecedented volume, Raydium fee revenue has surged. The token has not kept pace with fundamentals. Target: $8.00.',
        "Pick 3: Marinade Finance (MNDE) — Solana's largest liquid staking protocol with over 8 million SOL staked. As institutional interest in SOL grows, liquid staking derivatives will be a primary vehicle. Target: $0.35.",
        'Risk: High. Solana DeFi tokens are highly correlated and will sell off sharply in a bear market. Position sizing should reflect this — no single pick above 3% of portfolio.',
      ]),
    },
    {
      title: 'Layer 2 Arbitrage: Capturing Value in the ETH Scaling Wars',
      slug: 'layer2-arbitrage-scaling-wars',
      excerpt:
        'With five major Layer 2s competing for users and liquidity, significant mispricing exists. Our analysis identifies which L2 tokens are undervalued relative to their on-chain fundamentals.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(21),
      riskRating: 'speculative',
      author: adminAuthorId,
      tags: [tagIdMap['layer-2'], tagIdMap['ethereum']],
      content: makeBody([
        'The Layer 2 landscape has fragmented significantly in 2024, with Arbitrum, Optimism, Base, zkSync, and Starknet all competing for transaction volume and developer mindshare. This fragmentation has created genuine pricing inefficiencies.',
        'Our framework for evaluating L2 tokens: daily active addresses, TVL growth rate, fee revenue, and token float (circulating supply vs. total supply). Most L2 tokens trade on hype; we trade on fundamentals.',
        'Arbitrum (ARB) scores highest on fundamentals but trades at a relatively low multiple. The LTIPP incentive programme has permanently expanded its DeFi ecosystem. We expect re-rating as the market focuses on cash flows over narratives.',
        'Starknet (STRK) is the contrarian pick. The ZK-rollup technology is genuinely superior in the long run. The token suffered from a poor launch and heavy unlocks, creating a compressed entry point for patient investors.',
        'Warning: L2 tokens are highly speculative. Treat this as a thematic allocation, not core portfolio. The scaling wars are far from over and new entrants continue to emerge.',
      ]),
    },
    // 2 × Research / Deep Dives (Pro)
    {
      title: 'DeFi Lending Protocols: A Deep Dive Into Risk and Yield',
      slug: 'defi-lending-deep-dive',
      excerpt:
        'A comprehensive analysis of the four largest DeFi lending protocols — their risk models, yield mechanisms, and token value accrual.',
      category: categoryIdMap['deep-dives'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(10),
      riskRating: 'medium',
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'DeFi lending is a $25 billion market that has survived multiple market cycles, protocol exploits, and regulatory uncertainty. The protocols that remain — Aave, Compound, Morpho, and Euler — have emerged battle-tested and are growing again.',
        'Aave v3 introduced efficiency mode (eMode), cross-chain liquidity, and improved risk parameters. The protocol generates over $1 million per day in fees, of which a growing share is returned to staked AAVE holders. This is a genuine yield-bearing asset.',
        'Morpho Blue has disrupted the aggregator model with a minimalist, permissionless architecture. Its curated market approach allows sophisticated lenders to optimise for risk without being subject to governance overhead. TVL has grown 400% in six months.',
        'Risk assessment: Smart contract risk remains the primary concern in DeFi lending. We recommend diversifying exposure across at least two protocols. Oracle manipulation is the second risk — all four protocols use Chainlink, which creates a shared dependency.',
        'Token value accrual: AAVE and MORPHO have the clearest paths to value accrual via fee distribution. COMP has lagged due to governance dysfunction but remains a sleeper if the community activates fee switching. EUL is not yet recommended due to residual legal uncertainty.',
      ]),
    },
    {
      title: 'The Restaking Thesis: EigenLayer, Symbiotic, and the Future of Ethereum Security',
      slug: 'restaking-thesis-eigenlayer',
      excerpt:
        'Restaking could be the most significant primitive to emerge from Ethereum in years. We break down the mechanics, risks, and investment thesis.',
      category: categoryIdMap['deep-dives'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(18),
      riskRating: 'high',
      author: adminAuthorId,
      tags: [tagIdMap['ethereum'], tagIdMap['staking']],
      content: makeBody([
        'Restaking allows ETH stakers to simultaneously secure multiple Actively Validated Services (AVS) with the same capital. EigenLayer pioneered this model and has attracted over $15 billion in restaked ETH, making it one of the fastest-growing protocols in Ethereum history.',
        'The mechanics: validators opt into additional slashing conditions in exchange for additional yield. The AVSs — which include rollup sequencers, oracle networks, and bridge validators — pay for this security in their native tokens.',
        'EIGEN, the EigenLayer token, serves as the universal slashable token for inter-subjective faults — situations where objective on-chain proof of fault is impossible. This is a genuinely novel cryptoeconomic design.',
        'Competition from Symbiotic and Karak has intensified. Symbiotic is backed by Paradigm and allows any ERC-20 token to be restaked, not just ETH. This broader collateral universe may attract different capital than EigenLayer.',
        'Our verdict: The restaking thesis is compelling long-term, but EIGEN and its competitors are subject to extreme token unlock pressure in the next 12 months. We are accumulating on weakness rather than chasing strength. Position size: 2–3% of portfolio.',
      ]),
    },
    // 2 × Analysis / Market Updates (free)
    {
      title: 'Weekly Market Update: Bitcoin Consolidates as Macro Uncertainty Persists',
      slug: 'weekly-market-update-btc-consolidates',
      excerpt:
        'Bitcoin has traded sideways for 3 weeks as macro data sends mixed signals. Here is what to watch heading into the next Fed decision.',
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(3),
      author: analystAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['macro']],
      content: makeBody([
        'Bitcoin has been rangebound between $62,000 and $68,000 for the past three weeks, a period of consolidation after the sharp rally to all-time highs in March. This type of sideways action is historically healthy — it allows the market to absorb supply and build a base for the next move.',
        "The macro backdrop remains mixed. US CPI came in at 3.4%, above the Fed's 2% target, reducing the probability of a near-term rate cut. However, labour market data has begun softening, which typically precedes a dovish pivot.",
        'On-chain: long-term holder supply continues to grow. Short-term holders (< 155 days) have been the primary source of selling pressure. The realised price for short-term holders is approximately $58,000, which acts as a key support level.',
        'Altcoins have underperformed Bitcoin this week, with the total altcoin market cap declining 4% against BTC. This is typical mid-cycle behaviour — Bitcoin dominance rises before altcoins have their seasonal surge.',
        'Key levels to watch: $62,000 support and $68,500 resistance. A weekly close above $68,500 would signal the resumption of the uptrend. A break below $62,000 would require reassessment of the short-term thesis.',
      ]),
    },
    {
      title: 'Market Update: Ethereum ETF Inflows Accelerate — What This Means for ETH Price',
      slug: 'ethereum-etf-inflows-market-update',
      excerpt:
        "US Ethereum ETFs have recorded seven consecutive days of positive inflows. We break down the data and explain why this matters for ETH's price trajectory.",
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(6),
      author: adminAuthorId,
      tags: [tagIdMap['ethereum'], tagIdMap['macro']],
      content: makeBody([
        'US spot Ethereum ETFs have recorded seven consecutive days of net positive inflows, totalling $420 million over the period. This follows a period of muted demand in the weeks after launch, suggesting that institutional allocators are now actively building positions.',
        "BlackRock's iShares Ethereum Trust (ETHA) leads with $280 million of the seven-day total. Fidelity's FETH has also seen accelerating inflows. The Grayscale ETHE conversion product continues to see outflows but at a decelerating pace.",
        'Context matters: Bitcoin ETFs took approximately three months after launch to see sustained institutional inflows. Ethereum ETFs are following a similar adoption curve, suggesting we are entering the phase of sustained demand.',
        "Price impact: Basic supply/demand analysis suggests consistent daily inflows of $50–100 million against Ethereum's current sell pressure (approximately $30–50 million per day from miners and protocol sales) creates a structurally positive flow environment.",
        'Watch list: Total ETH ETF AUM (now $12.4 billion), daily flow data from Bloomberg, and the ETH/BTC ratio. A sustained move above 0.055 on ETH/BTC would confirm that ETH is outperforming and the narrative is shifting.',
      ]),
    },
    // 1 × Analysis / Market Direction (Pro)
    {
      title: 'Market Direction: Q3 Macro Setup — Risk On or Risk Off?',
      slug: 'market-direction-q3-macro-setup',
      excerpt:
        'Our comprehensive macro analysis for Q3. We examine liquidity cycles, Fed policy, and global capital flows to determine the optimal positioning for the next 90 days.',
      category: categoryIdMap['market-direction'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(12),
      author: adminAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['bitcoin']],
      content: makeBody([
        'Macro context has never mattered more for crypto investors. The correlation between crypto and risk assets has remained above 0.7 throughout 2024, meaning that getting the macro call right is as important as picking the right tokens.',
        'Our Q3 2024 macro framework rests on three pillars: Fed policy trajectory, global M2 money supply growth, and the US dollar index (DXY). All three are in a state of transition, which creates both opportunity and risk.',
        'Fed policy: The Federal Reserve has held rates at 5.25–5.50% for eight consecutive meetings. Our base case is one rate cut in September and one in December. This is broadly supportive of risk assets in the second half of the year.',
        'Global M2: Global M2 money supply, when measured in USD, has been expanding at approximately 3% annually. Historically, a 12-month lag exists between M2 expansion and crypto price appreciation. The current M2 trajectory points to a favourable crypto environment into late 2024 and early 2025.',
        'DXY: A weakening dollar is the single most important macro tailwind for crypto. The DXY has retreated from its 2022 highs but remains elevated. A sustained move below 102 would be materially positive for all risk assets, including crypto.',
        'Our Q3 positioning: 60% crypto core (BTC + ETH), 25% high-beta altcoins, 15% stable. This is more aggressive than Q2, reflecting our improving macro conviction. Adjust based on personal risk tolerance.',
      ]),
    },
    // 1 × Education / Simply Explained (free)
    {
      title: 'Understanding DeFi: How Automated Market Makers Work',
      slug: 'understanding-amm-defi-basics',
      excerpt:
        'Automated Market Makers replaced traditional order books in DeFi. This guide explains exactly how AMMs work, why they sometimes cause losses, and how to use them safely.',
      category: categoryIdMap['simply-explained'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(30),
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'Before DeFi, exchanging one cryptocurrency for another required a centralised exchange or an order book — a system where buyers and sellers post bids and offers until matched. Automated Market Makers (AMMs) replaced this model entirely.',
        'An AMM uses a mathematical formula — most commonly x * y = k (the constant product formula) — to price assets based on the ratio of two tokens in a liquidity pool. When you swap Token A for Token B, you add Token A to the pool and remove Token B, changing the ratio and therefore the price.',
        'Liquidity providers (LPs) deposit equal values of two tokens into a pool and receive LP tokens representing their share. They earn a percentage of every swap that occurs in the pool — typically 0.3% on Uniswap v2.',
        'Impermanent loss is the key risk for liquidity providers. When the price of one token in a pair changes significantly relative to the other, LPs end up with less value than if they had simply held both tokens. The loss is "impermanent" because it reverses if prices return to entry levels.',
        'How to protect yourself: focus on correlated pairs (ETH/stETH, USDC/USDT) to minimise impermanent loss. Ensure trading fees earned exceed IL before withdrawing. Use tools like Uniswap Analytics or DeFiLlama to track your position performance.',
        'AMMs are the foundation of DeFi. Understanding how they work is essential before providing liquidity or using any DeFi protocol that relies on them.',
      ]),
    },
    // 1 × Research / Airdrop Reports (Pro)
    {
      title: 'Airdrop Report: Five Protocols You Must Be Active On Right Now',
      slug: 'airdrop-report-five-protocols-q3',
      excerpt:
        'Five protocols with unconfirmed but highly probable token launches in the next 6 months. Step-by-step qualification checklist included.',
      category: categoryIdMap['airdrop-reports'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(5),
      author: analystAuthorId,
      tags: [tagIdMap['airdrop'], tagIdMap['layer-2'], tagIdMap['defi']],
      content: makeBody([
        'Airdrop farming remains one of the highest-return activities available to retail crypto participants. The key insight: most protocols reward early, active users disproportionately. Being present and active 6 months before a launch typically yields 5–10x more tokens than participating 1 month before.',
        'Protocol 1: Scroll — A ZK-EVM Layer 2 that has processed over 40 million transactions. No token announced but the team has explicitly discussed community distribution. Action: Bridge ETH to Scroll, use Ambient Finance and ScrollSwap weekly.',
        "Protocol 2: Linea — Consensys' Layer 2, backed by the creators of MetaMask. 18 million unique wallets. A token is widely expected in H2 2024. Action: Use Linea Voyage tasks on the official task portal. Bridge and swap at least monthly.",
        'Protocol 3: Hyperliquid — A high-performance perpetuals DEX with $1B+ daily volume. Points programme is live. Action: Trade perps on Hyperliquid. Even small weekly trades accumulate significant points.',
        'Protocol 4: Berachain — A novel blockchain using Proof of Liquidity consensus. Testnet is live and activity is being tracked. Action: Use the Berachain testnet faucet and interact with all testnet dApps weekly.',
        'Protocol 5: Monad — A high-performance EVM blockchain targeting 10,000 TPS. Testnet launch imminent. Action: Register for testnet access at monad.xyz and engage with community tasks when they launch.',
        'Disclaimer: Airdrop farming involves capital risk, bridge risk, and the possibility of no token launch. Never deploy capital you cannot afford to lose. This is a high-effort, high-reward strategy best suited to users with strong DeFi experience.',
      ]),
    },

    // ---- Research / Top Picks (5 more) ----
    {
      title: 'Chainlink: The Oracle Network Powering All of DeFi',
      slug: 'chainlink-oracle-network-top-pick',
      excerpt:
        'Chainlink is the unsexy backbone of DeFi — and that is exactly why it belongs in your core portfolio. Our analysis of LINK value accrual and the 2024 catalyst stack.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(25),
      riskRating: 'medium',
      author: adminAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'Over $20 trillion in transaction value has been secured by Chainlink oracle data across DeFi. Every major lending protocol, derivatives platform, and stablecoin issuer relies on LINK nodes to connect smart contracts to real-world prices. Without Chainlink, DeFi as it exists today would be impossible.',
        'The LINK staking model underwent a major upgrade with Staking v0.2. Node operators and community stakers now both earn LINK rewards for securing the network. This creates genuine token velocity and a direct link between network usage and token demand.',
        'The 2024 catalyst stack: CCIP (Cross-Chain Interoperability Protocol) is now live and being adopted by major banks for tokenised asset transfers. This is Chainlink entering TradFi infrastructure — a market 10x larger than DeFi.',
        "Functions, Automation, VRF, and Data Streams are expanding LINK's use cases beyond price feeds. Each new service category expands the addressable market for node operator fees paid in LINK.",
        'Entry zone: $12–$15. 12-month price target: $35. Stop loss: $9. Risk rating: Medium. LINK is a blue-chip infrastructure play — less volatile than most altcoins but with asymmetric upside as institutional blockchain adoption accelerates.',
      ]),
    },
    {
      title: 'Avalanche AVAX: Why the Subnet Model Creates Durable Value',
      slug: 'avalanche-subnet-model-analysis',
      excerpt:
        'Avalanche subnets are winning enterprise blockchain deals that Ethereum cannot. Here is why AVAX may be the most undervalued blue chip in this cycle.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(33),
      riskRating: 'medium',
      author: analystAuthorId,
      tags: [tagIdMap['layer-2'], tagIdMap['defi']],
      content: makeBody([
        "Avalanche's subnet architecture allows any enterprise or project to deploy its own custom blockchain that is secured by AVAX validators. Unlike Ethereum L2s, subnets can have custom gas tokens, privacy settings, and validator requirements — making them ideal for enterprise use cases.",
        'In 2024, Avalanche has signed subnet deals with a major South Korean gaming conglomerate, a global payments firm, and a sovereign wealth fund exploring tokenised assets. Each new subnet requires validators to stake AVAX, creating a demand floor independent of DeFi activity.',
        "AVAX's DeFi ecosystem is smaller than Ethereum's but growing fast. Trader Joe, GMX on Avax, and Benqi Finance collectively hold over $800 million in TVL. The low transaction fees make Avalanche the natural home for retail DeFi activity.",
        'Valuation: AVAX trades at a forward P/E of 28x based on fee revenue projections — significantly below Ethereum (45x) and Solana (62x). This discount is unjustified given the enterprise momentum.',
        'Entry zone: $28–$35. 12-month target: $75. Stop loss: $22. Risk: Medium. Catalyst: Avalanche9000 upgrade (major fee reduction for subnet creation) expected Q3 2024.',
      ]),
    },
    {
      title: 'Polkadot DOT: Undervalued Infrastructure for the Interoperable Future',
      slug: 'polkadot-interoperability-play',
      excerpt:
        'Polkadot has been left for dead by the market while quietly delivering a working cross-chain ecosystem. The upcoming JAM upgrade could rerate DOT significantly.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(40),
      riskRating: 'high',
      author: adminAuthorId,
      tags: [tagIdMap['layer-2'], tagIdMap['ethereum']],
      content: makeBody([
        "Polkadot has underperformed the broader market by 40% over the past 18 months. The narrative moved away from parachains toward Ethereum L2s. But the underlying technology — a heterogeneous, interoperable multi-chain — has matured significantly. The market simply hasn't noticed yet.",
        "The JAM (Join Accumulate Machine) upgrade, authored by Gavin Wood, is one of the most ambitious protocol redesigns in crypto history. It replaces the relay chain with a more efficient, Ethereum-compatible execution model while preserving Polkadot's shared security guarantees.",
        'DOT tokenomics have also improved. The burn mechanism introduced in RFC-0001 reduces DOT supply from on-chain operations. Combined with the OpenGov treasury spending cuts, DOT inflation is trending toward its lowest level ever.',
        'Ecosystem: Moonbeam (EVM compatibility), Acala (DeFi hub), and Hydration (DEX) are all live and growing. Cross-consensus messaging (XCM) has processed over 5 million cross-chain transfers.',
        'Entry zone: $6–$8. 12-month target: $18. Stop loss: $4.50. Risk: High — execution risk on JAM delivery and continued narrative competition from Ethereum L2s are the main concerns.',
      ]),
    },
    {
      title: 'Cosmos ATOM: The Internet of Blockchains Thesis Is Playing Out',
      slug: 'cosmos-atom-internet-of-blockchains',
      excerpt:
        'Cosmos was the original interoperability vision. With IBC now processing billions in daily transfers and ATOM 2.0 staking mechanics live, the market is finally catching up.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(45),
      riskRating: 'high',
      author: analystAuthorId,
      tags: [tagIdMap['staking'], tagIdMap['defi']],
      content: makeBody([
        'The Inter-Blockchain Communication (IBC) protocol processes over $2 billion in daily cross-chain transfers across 110 connected chains. Cosmos invented cross-chain communication years before it became a mainstream narrative — and now the ecosystem is reaping the benefits.',
        "The ATOM Economic Zone (AEZ) is Cosmos' answer to Ethereum's DeFi ecosystem. Neutron (smart contracts), Stride (liquid staking), and Osmosis (DEX) form the core. Each chain uses ATOM as its reserve asset and security layer.",
        'ATOM staking yields approximately 15% APY in native tokens. The introduction of Interchain Security (shared security for consumer chains) creates an additional demand vector — consumer chains pay ATOM stakers for security in ICS.',
        'The main risk: Cosmos lacks a dominant consumer-facing application. Osmosis is large but not in Uniswap\'s league. The ecosystem needs a "killer app" to attract retail liquidity at scale.',
        'Entry zone: $8–$10. 12-month target: $22. Stop loss: $6. Risk: High — this is a thesis play on ecosystem expansion and IBC adoption, not a short-term momentum trade.',
      ]),
    },
    {
      title: 'XRP: The Institutional Settlement Layer — Post-SEC Analysis',
      slug: 'xrp-institutional-settlement-layer',
      excerpt:
        'The SEC vs Ripple case has cleared. XRP is now the only major crypto with regulatory clarity in the US. Here is what institutional adoption looks like from here.',
      category: categoryIdMap['top-picks'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(50),
      riskRating: 'speculative',
      author: adminAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['bitcoin']],
      content: makeBody([
        "The US District Court's ruling that XRP is not a security when sold on secondary markets was a watershed moment for the crypto industry. It gave XRP the one thing no other major altcoin has: regulatory clarity in the world's largest capital market.",
        'Ripple has since signed payment corridor agreements with major banks in Japan, UAE, and Brazil. On-Demand Liquidity (ODL) — which uses XRP as a bridge currency for cross-border payments — is now processing over $15 billion in annualised volume.',
        'The XRP ETF applications from multiple issuers are pending. A decision is expected in late 2024. If approved, this would be the first altcoin ETF in the US — a structural demand event with no precedent to price in.',
        'XRPL (XRP Ledger) is also seeing DEX and AMM activity following the activation of Protocol Amendment 1.12. This diversifies XRP utility beyond pure settlement.',
        'Entry zone: $0.50–$0.65. 12-month target: $1.80. Stop loss: $0.38. Risk: Speculative — regulatory tailwinds are genuine but priced in partially. Upside is ETF-driven; downside is macro.',
      ]),
    },

    // ---- Research / Deep Dives (3 more) ----
    {
      title: 'Uniswap V4 Deep Dive: Hooks, Singleton Architecture, and the Fee Revolution',
      slug: 'uniswap-v4-hooks-deep-dive',
      excerpt:
        'Uniswap V4 is the most significant protocol upgrade since V2. Hooks enable custom logic on every pool action. We break down what this means for LPs and traders.',
      category: categoryIdMap['deep-dives'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(8),
      riskRating: 'medium',
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'Uniswap V4 introduces two architectural changes that will reshape DeFi: the singleton contract model and hooks. Together, they reduce gas costs by up to 99% for multi-hop swaps while enabling an entirely new category of customisable liquidity pools.',
        'Hooks are arbitrary smart contracts that execute at defined points in the pool lifecycle: before/after a swap, before/after liquidity is added or removed, and before/after a donate call. This means developers can build custom fee tiers, TWAMM orders, dynamic fees, on-chain limit orders, and MEV-capturing mechanisms — all without forking Uniswap.',
        'The singleton architecture stores all pool state in a single contract. Instead of deploying a new contract per pool (V2/V3), V4 uses transient storage and ERC-6909 multi-token accounting. The gas savings are substantial — complex arbitrage routes that previously cost $80 in gas now cost under $5.',
        'UNI token value accrual: The fee switch proposal has re-emerged. If governance activates protocol fees on V4 pools, UNI holders would receive a percentage of all swap fees. With $1.5T in annual Uniswap volume, even a 0.1% protocol fee generates $1.5B annually. This alone justifies a significant UNI rerating.',
        'Timeline: V4 mainnet deployment is expected Q3 2024 following security audits. The 12-month outlook for UNI: $15–$25 if fee switch activates; $8–$12 without. Risk: Medium — smart contract risk plus governance uncertainty on fee switch.',
      ]),
    },
    {
      title: 'Bitcoin Halving Deep Dive: Historical Patterns and the 2024 Setup',
      slug: 'bitcoin-halving-historical-patterns',
      excerpt:
        'The fourth Bitcoin halving reduced block rewards to 3.125 BTC. Every prior halving was followed by a bull market within 12–18 months. We examine whether history repeats.',
      category: categoryIdMap['deep-dives'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(55),
      riskRating: 'low',
      author: adminAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['macro']],
      content: makeBody([
        'On 20 April 2024, Bitcoin completed its fourth halving at block 840,000. The block subsidy dropped from 6.25 BTC to 3.125 BTC — reducing new daily Bitcoin issuance from approximately 900 BTC to 450 BTC. At current prices, this removes $28 million of daily sell pressure from miners.',
        'Historical context: The 2012 halving was followed by a 9,000% price increase to $1,100. The 2016 halving preceded the 2017 bull run to $20,000. The 2020 halving led to the 2021 peak of $69,000. In every case, the price was significantly higher 12–18 months after the halving.',
        'The 2024 setup is materially different from prior halvings in one key way: the Bitcoin spot ETFs. ETFs now absorb 5–10x more new Bitcoin supply than miners produce each day. This supply/demand imbalance is unprecedented.',
        "Stock-to-flow model: Post-halving, Bitcoin's stock-to-flow ratio surpasses gold's (approximately 120 vs gold's 58). The S2F model — controversial but historically accurate — projects BTC to $180,000–$220,000 in the 18 months following the halving.",
        'Risks to the bull thesis: Macro deterioration (rates staying high, risk-off sentiment), regulatory crackdowns, or miner capitulation. We treat the halving as a structural tailwind, not a guaranteed outcome. Risk: Low for long-term holders; Medium-High for leveraged positions.',
      ]),
    },
    {
      title: 'Decentralised Perpetuals: GMX, dYdX, and the Race for Derivatives Volume',
      slug: 'decentralised-perps-gmx-dydx',
      excerpt:
        'The on-chain derivatives market is exploding. GMX and dYdX are fighting for dominance with very different models. We analyse both — and which token has better upside.',
      category: categoryIdMap['deep-dives'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(19),
      riskRating: 'high',
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'Perpetual futures are the highest-volume product in all of crypto — centralised exchanges do $50–100B in perp volume daily. On-chain perps capture less than 5% of that. The protocols that grow this share from 5% to 15% over the next cycle will generate enormous fee revenue.',
        'GMX V2 uses a multi-asset liquidity pool model (GM pools). Liquidity providers take the other side of trades and earn 70% of trading fees. GMX V2 fixed the V1 problem of LPs always losing to large directional traders by introducing dynamic funding rates and oracle-based pricing. Daily fee revenue regularly exceeds $500K.',
        'dYdX V4 migrated to its own Cosmos-based appchain. Trading is orderbook-based (not AMM), making it the most CEX-like decentralised exchange. dYdX consistently ranks as the highest-volume decentralised derivatives venue. The token is used for staking and governance, with future fee distribution planned.',
        'Emerging competitors: Hyperliquid (fastest-growing, native L1), Synthetix Perps V3, and Vertex Protocol. The market is fragmenting but network effects will likely consolidate volume to 2–3 winners.',
        'Our view: GMX offers the best near-term yield play (high real fee revenue to stakers). dYdX offers the better long-term token upside if fee distribution activates. Both carry High risk due to smart contract complexity and regulatory uncertainty around derivatives.',
      ]),
    },

    // ---- Research / Passive Income (5 new) ----
    {
      title: 'Liquid Staking 101: ETH, SOL, and BNB Yields Compared',
      slug: 'liquid-staking-eth-sol-bnb-yields',
      excerpt:
        'Liquid staking lets you earn staking rewards while keeping your assets liquid for DeFi. We compare yields, risk, and token mechanics across the three largest liquid staking ecosystems.',
      category: categoryIdMap['passive-income'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(16),
      riskRating: 'low',
      author: analystAuthorId,
      tags: [tagIdMap['staking'], tagIdMap['ethereum']],
      content: makeBody([
        'Liquid staking is the most capital-efficient yield strategy in crypto. Instead of locking tokens in a validator for 12+ months, you receive a liquid receipt token (stETH, mSOL, BNBx) that earns staking rewards while remaining usable as DeFi collateral.',
        'Ethereum: Lido Finance (stETH) dominates with $30B+ TVL. stETH yields approximately 3.5% APY. The risk: Lido controls 32% of all staked ETH, raising centralisation concerns. Alternatives: Rocket Pool (rETH, 3.8% APY, more decentralised) and Frax Ether (frxETH, 4.1% APY with additional DeFi composability).',
        'Solana: Marinade Finance (mSOL) and Jito (jitoSOL) offer 6–8% APY. jitoSOL includes MEV rewards on top of base staking yield, making it the highest-yielding LST. The validator set on Solana is more decentralised than Ethereum, reducing concentration risk.',
        "BNB Chain: Ankr (aBNBc) and Lista DAO (slisBNB) offer 3–5% APY. BNB staking is simpler but carries higher centralisation risk given Binance's control over BNB Chain validators.",
        'Strategy: Layer liquid staking with DeFi protocols for additional yield. stETH in Aave earns ~3.5% base + ~2% lending yield. mSOL in Kamino Finance earns ~8% base + additional lending rewards. Risk: Low for base liquid staking; escalates with DeFi layering.',
      ]),
    },
    {
      title: 'Real Yield Protocols: Sustainable APY in Bear and Bull Markets',
      slug: 'real-yield-protocols-sustainable-apy',
      excerpt:
        'Fake yield (token emissions) dies in bear markets. Real yield (protocol revenue shared with stakers) does not. These five protocols generate genuine cash flows.',
      category: categoryIdMap['passive-income'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(22),
      riskRating: 'medium',
      author: adminAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['staking']],
      content: makeBody([
        'The 2022 bear market destroyed thousands of yield farms that relied entirely on token emissions. "10,000% APY" collapsed to zero when incentives dried up. Real yield protocols, by contrast, distribute actual protocol revenue — fees earned from genuine user activity. These yields persist regardless of market conditions.',
        'GMX (GLP/GMX staking): The original real yield protocol. Stakers earn 70% of all trading fees in WETH and USDC — not GMX tokens. At peak volume, GMX stakers have earned 25–40% APY in blue-chip assets.',
        'Gains Network (gDAI vault): The gDAI vault backs leveraged trading on Gains Network. Losses from traders flow into the vault as yield. Over 12 months, the vault has generated 8–14% APY in DAI.',
        'Synthetix (SNX staking): sUSD minters earn trading fees from Synthetix Perps V3. With fee revenue increasing 300% post-V3 launch, SNX stakers are now earning meaningful USDC yield.',
        'Camelot (xGRAIL): Camelot DEX on Arbitrum distributes 80% of protocol fees to xGRAIL stakers. The perpetual-lock model aligns incentives long-term. Current yield: 12–18% in paired tokens. Risk: Medium — protocol fee revenue is volume-dependent.',
      ]),
    },
    {
      title: 'Curve Wars Explained: Bribes, Gauges, and the $12B Stablecoin Prize',
      slug: 'curve-wars-bribes-gauges',
      excerpt:
        'Control Curve gauges, control DeFi stablecoin liquidity. The bribe economy has grown into a multi-billion dollar meta-game — and savvy investors can profit from it.',
      category: categoryIdMap['passive-income'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(38),
      riskRating: 'medium',
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['staking']],
      content: makeBody([
        'Curve Finance is the most important stablecoin DEX in DeFi, routing over $500 million in daily stablecoin swaps. Liquidity providers who stake in Curve pools earn trading fees — but the amount depends entirely on "gauge weights" set by CRV token holders.',
        'Gauge weights determine how much CRV emissions each pool receives. More CRV emissions attract more LPs. More LPs means lower slippage for stablecoin issuers. This gives CRV — specifically veCRV (vote-escrowed CRV) — enormous structural power.',
        'The bribe economy: Stablecoin issuers (Frax, LUSD, crvUSD, MIM) pay veCRV holders to vote their gauge up. These "bribes" are paid in the stablecoin issuer\'s token and aggregated through platforms like Votium and Hidden Hand. veCRV holders routinely earn $0.05–$0.10 per veCRV per week in bribe income.',
        "Convex Finance (CVX) is the dominant veCRV aggregator. Convex controls approximately 50% of all veCRV. Owning CVX effectively gives you leverage on veCRV governance power. CVX itself can be locked for vlCVX to direct Convex's gauge votes and earn a share of all bribes.",
        'Yield strategy: Lock CRV → earn base yield (3–8% in CRV + fees). Or buy CVX → lock as vlCVX → earn bribe income (typically 15–25% APY in mixed tokens). Risk: Medium — smart contract risk, CRV price risk, and bribe income is variable.',
      ]),
    },
    {
      title: 'RWA Yield: How Tokenised T-Bills Are Changing Stable Returns',
      slug: 'rwa-yield-tokenised-tbills',
      excerpt:
        'On-chain US Treasury yields are now available to anyone with a crypto wallet. Tokenised T-bills offer 4–5% APY with near-zero smart contract risk. Here is how to access them.',
      category: categoryIdMap['passive-income'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(28),
      riskRating: 'low',
      author: adminAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['macro']],
      content: makeBody([
        "Real-world asset (RWA) tokenisation has become DeFi's most successful bridge to traditional finance. Tokenised US Treasury bills now hold over $2 billion on-chain, offering retail access to institutional-grade yield with 24/7 liquidity.",
        'Ondo Finance (USDY, OUSG): USDY is a yield-bearing stablecoin backed by short-term US Treasuries and bank deposits. It yields approximately 5% APY and is redeemable for USDC within 24 hours. OUSG (Ondo Short-Term US Government Securities) is for accredited investors only — current yield: 5.2%.',
        'Franklin Templeton (BENJI): The $1.5 trillion asset manager has tokenised its money market fund on Stellar and Polygon. BENJI holders earn daily yield rebases. This is the first legacy TradFi fund available directly on-chain.',
        'Backed Finance: Tokenises iShares Treasury ETFs on-chain. bIB01 tracks the iShares $ Treasury Bond 0-1yr ETF. Available to non-US users without KYC restrictions.',
        'Use case: Replace stablecoin holdings in idle capital. Instead of holding USDC at 0%, hold USDY or bIB01 at 4.5–5.2%. Risk: Low — primary risk is TradFi counterparty risk (US Treasury default, which is near-zero) rather than smart contract risk.',
      ]),
    },
    {
      title: 'Concentrated Liquidity Strategies: How to Maximise LP Yield and Minimise IL',
      slug: 'liquidity-mining-strategies-hedge',
      excerpt:
        'Uniswap V3 and similar CLMMs let LPs concentrate capital in tight price ranges for 10x higher fees. The catch: impermanent loss is also magnified. Here are the strategies that work.',
      category: categoryIdMap['passive-income'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(35),
      riskRating: 'medium',
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        "Uniswap V3's concentrated liquidity model (CLMM) allows LPs to provide liquidity in a specific price range rather than across the full curve. A position in the 1900–2100 USDC/ETH range earns the same fees as a V2 position with 100x less capital — as long as price stays in range.",
        'The three main LP strategies: (1) Wide range — lower fees per dollar, lower IL, set and forget. Best for volatile pairs. (2) Narrow range — high fees, high IL risk, requires active rebalancing. Best for stable pairs or mean-reverting assets. (3) Single-sided — provide only one asset using Gamma or Arrakis Finance to auto-manage range.',
        'Active management platforms: Gamma Strategies, Arrakis Finance, and Ichi Vaults automatically rebalance CLMM positions when price goes out of range. They charge a management fee (typically 10% of yield) but eliminate manual rebalancing overhead.',
        'Hedging IL: Use a delta-neutral strategy — hold a short position on one of the LP assets equal to your net exposure. For ETH/USDC, short ETH on dYdX or GMX for the ETH component. This caps IL but also caps upside if ETH rallies.',
        'Target pairs for Q3 2024: ETH/USDC (Uniswap V3 on Arbitrum, 0.05% fee tier), SOL/USDC (Orca on Solana), and BTC/ETH (Uniswap V3 on mainnet). Current yields: 15–35% APY depending on volatility and range tightness. Risk: Medium.',
      ]),
    },

    // ---- Research / Airdrop Reports (3 more) ----
    {
      title: 'Airdrop Season 2025: Ten Protocols Still Under the Radar',
      slug: 'airdrop-season-2025-under-the-radar',
      excerpt:
        'The next wave of token launches is forming. Ten protocols with active testnets, VC backing, and no token yet — the qualification playbook for each.',
      category: categoryIdMap['airdrop-reports'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(9),
      author: analystAuthorId,
      tags: [tagIdMap['airdrop'], tagIdMap['layer-2']],
      content: makeBody([
        'After the Starknet, ZKsync, and Blast airdrop cycles, many farmers are exhausted. But the next generation of protocols is quietly building — and they are watching your on-chain activity right now. Early positioning in Q4 2024 will pay off in 2025.',
        'Protocol 1: Nillion — A privacy-focused computation network. Testnet live. Actions: Complete testnet tasks on app.nillion.com weekly. Protocol 2: Initia — A modular L1 with Move VM. Testnet open. Bridge, swap, and stake on the Initia testnet.',
        'Protocol 3: MegaETH — Ultra-low latency Ethereum L2 with real-time block production. Testnet signups open. Register and complete ecosystem quests. Protocol 4: Sophon — ZK L2 focused on entertainment. Testnet live with point farming quests.',
        'Protocol 5: Plume Network — RWA-focused L2. Testnet farming active. Bridge USDC and interact with testnet RWA protocols. Protocol 6: Humanity Protocol — Proof-of-human L2. Testnet with palm scan verification. Protocol 7: Elixir — Decentralised market-making network. Mainnet live, points farming active.',
        'Protocols 8–10: Nexus (proof-aggregation L1), Movement (Move-based L2), Sahara AI (AI inference network). All have testnets with documented activity tracking. Allocate 1–2 hours per week across all ten. The capital deployed is small; the potential upside is 10–100x the time invested.',
      ]),
    },
    {
      title: 'How to Qualify for the Next Major Arbitrum Airdrop',
      slug: 'arbitrum-retroactive-airdrop-qualify',
      excerpt:
        'Arbitrum has signalled a second distribution event. Historical data from ARB1 shows exactly what activity was rewarded — and what was filtered. Our qualification checklist.',
      category: categoryIdMap['airdrop-reports'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(42),
      author: adminAuthorId,
      tags: [tagIdMap['airdrop'], tagIdMap['layer-2'], tagIdMap['ethereum']],
      content: makeBody([
        "Arbitrum's first airdrop rewarded 625,000 addresses with 1.2 billion ARB tokens worth $1.8 billion at TGE. The distribution was highly meritocratic — on-chain activity, transaction count, and time-weighted engagement all determined allocation size. A second airdrop has been strongly hinted at by the Arbitrum Foundation.",
        'What was rewarded in ARB1: ≥4 transactions across ≥3 months, ≥$10K cumulative transaction value, ≥4 different smart contracts interacted with, and liquidity provision in Arbitrum DeFi protocols. Sybil wallets (low-value transactions across many wallets) were filtered and received nothing.',
        'What to do now: (1) Use Arbitrum every month — at least 4 transactions per month across multiple protocols. (2) Provide liquidity on GMX, Uniswap V3, and Camelot. (3) Participate in Arbitrum DAO governance — vote on proposals at tally.xyz. (4) Use the Arbitrum bridge rather than CEX deposits.',
        "High-value activity on Arbitrum: Camelot perpetuals trading, GMX V2 trading, Pendle yield trading (Arbitrum is Pendle's largest chain), and Radiant Capital lending.",
        'Budget: Gas on Arbitrum is negligible — typically under $0.10 per transaction. The main cost is bridging (Ethereum mainnet gas). Use the official Arbitrum bridge weekly. A $500 capital commitment across the protocols above is more than sufficient to qualify at meaningful allocation levels.',
      ]),
    },
    {
      title: 'ZK Protocol Airdrops: ZKsync, Aztec, and What to Expect',
      slug: 'zk-protocol-airdrops-zksync-aztec',
      excerpt:
        'ZKsync Era distributed $900M in ZK tokens. Aztec is next. We break down the ZK airdrop landscape, remaining opportunities, and how to position for the next wave.',
      category: categoryIdMap['airdrop-reports'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(62),
      author: analystAuthorId,
      tags: [tagIdMap['airdrop'], tagIdMap['layer-2']],
      content: makeBody([
        'The ZK technology wave produced some of the largest airdrops in crypto history: StarkNet (1.8B STRK, $2.4B at peak), ZKsync Era (3.6B ZK, $900M at TGE), and Scroll is still pending. Each distribution taught us more about how ZK teams think about community distribution.',
        'Key lesson from ZKsync: volume was less important than unique interactions. Wallets that had used 10+ different dApps and bridged multiple times received 5x more ZK than high-volume traders using only one protocol. Diversity of on-chain activity is the primary signal.',
        'Aztec Network — the most anticipated remaining ZK airdrop. Aztec is building a privacy-first ZK L2. The testnet (Aztec Sandbox) is live for developers. Consumer app access is expected in late 2024. Priority actions: Use the Aztec testnet, follow the GitHub for grant opportunities, and engage in Discord.',
        'Taiko — ZK L1 with Ethereum equivalence. Mainnet live since May 2024. Still no token. Bridge and transact on Taiko mainnet regularly. Bonadocs protocol uses Taiko for deployments.',
        'General ZK airdrop strategy: Prioritise protocols with VC backing and explicit community ownership language in their docs. Avoid farming with multiple wallets — ZK teams are better at sybil detection than any previous generation. One wallet, genuine activity, high protocol diversity.',
      ]),
    },

    // ---- Research / Memecoins (4 new) ----
    {
      title: 'PEPE: The Anatomy of a Memecoin Pump and How to Trade It',
      slug: 'pepe-memecoin-anatomy-pump',
      excerpt:
        'PEPE went from zero to $1.6 billion market cap in two weeks. Then it crashed 70%. Understanding the anatomy of the pump is the only way to profit and not become exit liquidity.',
      category: categoryIdMap['memecoins'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(27),
      riskRating: 'speculative',
      author: adminAuthorId,
      tags: [tagIdMap['memecoins'], tagIdMap['ethereum']],
      content: makeBody([
        'PEPE launched in April 2023 as a pure meme token with no utility, no team allocation, and no roadmap. Within two weeks it had a $1.6 billion market cap and was listed on Binance, Coinbase, and every major CEX. It subsequently dropped 70% and then re-pumped to $5B in 2024. PEPE is the quintessential memecoin case study.',
        'Phase 1 — Organic Discovery (Days 1–3): A small Twitter community notices PEPE. Early buyers are genuine meme enthusiasts. Price action is choppy. This is the last time PEPE is cheap — but it is impossible to identify in real time.',
        'Phase 2 — Influencer Amplification (Days 4–8): Crypto Twitter influencers post about 1000x gains. FOMO hits retail. Volume spikes 50x overnight. Binance listing rumours begin. This is the most dangerous entry point — you are buying from early holders who are selling.',
        'Phase 3 — CEX Listing (Days 8–14): Binance lists PEPE. Price pumps 200% in 24 hours on the listing. Retail pours in through CEX. This is where uninformed buyers become exit liquidity for everyone who bought in phases 1–2.',
        'The exit strategy: Set pre-defined profit targets BEFORE you enter any memecoin. Suggested structure: sell 33% at 3x, 33% at 7x, hold the final 33% for either 20x or zero. Never hold a memecoin for the long term. Risk: Speculative — treat this as entertainment capital only.',
      ]),
    },
    {
      title: 'Dogecoin vs WIF: Which Memecoin Has the Better Risk/Reward in This Cycle?',
      slug: 'dogecoin-vs-wif-risk-reward',
      excerpt:
        'Dogecoin has Elon Musk and brand recognition. WIF has Solana momentum and a smaller market cap. A quantitative comparison of risk-adjusted upside for both tokens.',
      category: categoryIdMap['memecoins'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(15),
      riskRating: 'speculative',
      author: analystAuthorId,
      tags: [tagIdMap['memecoins'], tagIdMap['solana']],
      content: makeBody([
        "Dogecoin ($DOGE) and dogwifhat ($WIF) represent two generations of memecoin. DOGE is the OG — 11 years old, $20B market cap, and Elon Musk's favourite. WIF launched in November 2023, reached $4B market cap within 6 months, and became the dominant Solana memecoin.",
        'Market cap comparison: DOGE at $20B requires a 5x to reach $100B. WIF at $3B requires a 33x to reach $100B. If both reach similar peak market caps in a full bull market, WIF offers significantly more upside. But DOGE has survived 4 full bear markets; WIF has survived one.',
        'Catalyst analysis — DOGE: X (formerly Twitter) payments integration, DOGE payments at Tesla, and Elon Musk government advisory role all provide genuine narrative catalysts. A DOGE payments announcement would be the biggest memecoin catalyst since Binance listed PEPE.',
        'Catalyst analysis — WIF: Solana ecosystem momentum, Coinbase listing (completed), and the WIF billboard at the Las Vegas Sphere (brilliant marketing). WIF benefits from the Solana DeFi flywheel — active users discover WIF through Jupiter and Raydium.',
        'Our verdict: For risk-adjusted upside, WIF offers better asymmetry at current prices. For lower volatility and brand safety, DOGE is the choice. Do not hold more than 2% of portfolio in either. Combined memecoin allocation: maximum 5%.',
      ]),
    },
    {
      title: 'Memecoin Season Playbook: Entry Signals, Rotation Chains, and Exit Rules',
      slug: 'memecoin-season-playbook',
      excerpt:
        'Memecoin season does not last forever — it lasts 6–10 weeks. Here is the complete playbook for entering early, rotating into winners, and exiting before the crash.',
      category: categoryIdMap['memecoins'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(20),
      riskRating: 'speculative',
      author: adminAuthorId,
      tags: [tagIdMap['memecoins'], tagIdMap['on-chain']],
      content: makeBody([
        'Memecoin season is a distinct phase of the crypto market cycle. It typically begins when Bitcoin dominance peaks and capital rotates into altcoins, then memecoins. In 2021, memecoin season lasted approximately 8 weeks (April–June). In 2024, the Solana memecoin cycle ran from January to March — also roughly 8 weeks.',
        'Entry signal: Bitcoin dominance drops below 52% AND the total altcoin market cap starts outperforming BTC. When these two conditions are met simultaneously, memecoin season is either active or imminent.',
        'Rotation chain: Capital does not flow from Bitcoin directly to memecoins. It flows through a predictable hierarchy: BTC → ETH → Large caps (SOL, BNB) → Mid caps → Small caps → Memecoins. Time your memecoin entry to when large cap altcoins are already up 50–100% — that is when rotation into memecoins begins.',
        'On-chain signals to watch: DEX volume on Solana (Jupiter) and Ethereum exceeding $3B/day, new memecoin launches exceeding 5,000/day on pump.fun, and social sentiment (LunarCrush) showing memecoin mentions exceeding Bitcoin mentions.',
        'Exit rules: (1) Exit when BTC dominance starts rising again from a local low. (2) Exit when the fear and greed index hits Extreme Greed (85+) for 3+ consecutive days. (3) Always sell into strength, not into weakness. Set alerts, not prayers.',
      ]),
    },
    {
      title: 'Solana Memecoins: BONK, WIF, POPCAT — The New Meta',
      slug: 'solana-memecoins-bonk-wif-popcat',
      excerpt:
        'Solana became the memecoin chain of 2024. BONK, WIF, and POPCAT each represent a different stage of the meta. We analyse what is next for the Solana memecoin ecosystem.',
      category: categoryIdMap['memecoins'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(11),
      riskRating: 'speculative',
      author: analystAuthorId,
      tags: [tagIdMap['memecoins'], tagIdMap['solana']],
      content: makeBody([
        "Solana's low transaction fees (under $0.001) and sub-second finality make it the perfect blockchain for memecoin launches. In 2024, Solana generated over 2 million new token launches via pump.fun — the vast majority of which went to zero. But the three that did not go to zero became the most watched tokens in all of crypto.",
        'BONK ($BONK) — The original Solana memecoin. Launched in December 2022 as an airdrop to Solana NFT holders and developers. BONK is now integrated into Solana mobile devices, Saga phones, and multiple DeFi protocols. It has the most utility of any Solana memecoin.',
        'dogwifhat ($WIF) — Launched November 2023. A dog with a hat. No utility, no team allocation. Reached $4B market cap entirely on community momentum and Solana ecosystem tailwinds. Listed on Coinbase, Binance, and most major CEXs.',
        'POPCAT ($POPCAT) — A cat popping. Also no utility. Reached $1.5B market cap. POPCAT demonstrates that the second wave of Solana memecoins can still reach meaningful valuations even without first-mover advantage.',
        'What is next: The pump.fun ecosystem is generating the next generation of Solana memecoins daily. The key filter: look for memecoins that survive the first 72 hours (most rug within 24 hours), have >5,000 holder wallets, and have organic Twitter/Telegram communities. These are the 0.1% that have staying power.',
      ]),
    },

    // ---- Analysis / Market Updates (4 more) ----
    {
      title: 'Weekly Market Update: Altcoin Season Indicators Flash Green',
      slug: 'market-update-altcoin-season-green',
      excerpt:
        'The altcoin season index hit 78 this week — the highest since Q1 2024. On-chain and technical indicators suggest the rotation is just getting started.',
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(4),
      author: analystAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['on-chain']],
      content: makeBody([
        'The CoinMarketCap Altcoin Season Index hit 78 this week, its highest reading since March 2024. A reading above 75 indicates that the majority of top-100 altcoins are outperforming Bitcoin over a 90-day period — the classic definition of altcoin season.',
        'Bitcoin dominance has fallen from 57% to 52% in the past three weeks. Historically, a decline of this magnitude and speed has preceded a significant altcoin rally. The BTC.D chart shows a clear lower high forming — a technical breakdown of BTC dominance would accelerate capital rotation.',
        'On-chain: Total DeFi TVL increased $4 billion this week to $105 billion — the highest in 18 months. Ethereum gas prices have risen, indicating genuine user activity rather than speculative bot traffic. NFT sales volume also ticked up 20% week-on-week.',
        'Outperformers this week: SOL (+18%), DOT (+22%), LINK (+15%), and the AI narrative tokens (WLD, TAO, FET). Underperformers: BNB, TRX, and NEAR — all large caps that typically lag the early altcoin rotation.',
        'Recommendation: Maintain altcoin exposure built during the consolidation phase. The rotation has begun but is not yet at euphoria stage. Risk management: trail stop losses up as positions appreciate. Do not add leverage at these levels.',
      ]),
    },
    {
      title: 'Market Update: Bitcoin ETF Volume Hits All-Time High',
      slug: 'market-update-bitcoin-etf-volume-ath',
      excerpt:
        'US Bitcoin ETFs recorded $4.2 billion in single-day trading volume — the highest since launch. We analyse what is driving institutional demand and the price implications.',
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(13),
      author: adminAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['macro']],
      content: makeBody([
        'Combined US Bitcoin spot ETF trading volume reached $4.2 billion on Tuesday — surpassing the previous record set on the first day of trading in January. This is a significant milestone: it indicates that institutional interest is not waning but accelerating months after the initial launch.',
        "BlackRock IBIT continues to dominate, accounting for $2.8 billion of the day's volume. Fidelity FBTC contributed $900 million. The remaining $500 million was distributed across ARK/21Shares, Bitwise, and others. Grayscale GBTC saw net outflows for the 12th consecutive day as fee-sensitive investors migrate to lower-cost products.",
        'Who is buying: ETF filings show the first major hedge fund disclosures. Millennium Management holds $1.9B in Bitcoin ETFs across multiple issuers. Schonfeld Strategic Advisors disclosed $479M. These are pure-play hedge funds — not crypto-native — making their first regulated Bitcoin allocation.',
        'Price impact: The ETFs collectively absorbed 12,000 BTC on Tuesday versus miner production of 450 BTC. This 26:1 demand-to-supply ratio is historically unprecedented and explains why Bitcoin has held above $60,000 despite significant profit-taking at this level.',
        'Short-term outlook: ETF volume spikes often precede price breakouts by 5–10 days as spot markets reprice to reflect institutional buying. Key resistance: $68,500. If broken on high ETF volume, the path to $75,000 is clear.',
      ]),
    },
    {
      title: 'Weekly Crypto Market Wrap: Fed Minutes Send BTC Lower',
      slug: 'market-wrap-fed-minutes-btc-lower',
      excerpt:
        'The Federal Reserve minutes revealed more hawkish sentiment than expected. Bitcoin fell 8% in 24 hours. We put the sell-off in context and explain what to watch next.',
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(24),
      author: analystAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['macro']],
      content: makeBody([
        'Bitcoin fell from $67,200 to $61,800 in 24 hours following the release of the Federal Reserve\'s May FOMC minutes. The minutes revealed that "several participants" believe additional rate hikes may be warranted if inflation remains elevated — a more hawkish tone than markets had priced in.',
        'This is not the first time crypto has reacted sharply to Fed language, and the pattern is consistent: a hawkish surprise causes a 5–15% sell-off, the market consolidates for 1–2 weeks, and then either resumes the uptrend (if underlying fundamentals remain strong) or forms a lower high (if the macro environment genuinely deteriorates).',
        'Context matters: This sell-off occurred from the $67,200 level — still significantly above the pre-halving price of $65,000 and the 200-day moving average at $52,000. The structural bull case (ETF inflows, post-halving supply reduction) remains intact.',
        "Altcoins sold off harder: The total altcoin market cap fell 12% versus Bitcoin's 8%. This is typical in risk-off events — altcoins are more sensitive to macro fear. The severity of altcoin drawdowns relative to BTC is a useful fear gauge.",
        'Action plan: No action required for long-term holders. For active traders: $62,000 support must hold on a daily close basis. A break below invites a retest of $58,000. If $62,000 holds, the range trade between $62K and $68.5K continues.',
      ]),
    },
    {
      title: 'Market Update: Stablecoin Inflows Signal Risk-On Return',
      slug: 'market-update-stablecoin-inflows',
      excerpt:
        'Over $2 billion in stablecoins flowed onto exchanges in the past 72 hours — historically one of the most reliable signals of an incoming risk-on move in crypto.',
      category: categoryIdMap['market-updates'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(31),
      author: adminAuthorId,
      tags: [tagIdMap['on-chain'], tagIdMap['macro']],
      content: makeBody([
        'On-chain data shows $2.1 billion in stablecoins (USDT, USDC, and BUSD) moved onto centralised exchanges in the past 72 hours. Stablecoin inflows to exchanges are the most reliable leading indicator of buying pressure in crypto — they represent capital that is ready to be deployed into risk assets.',
        'Historical context: The four largest stablecoin inflow events in the past 18 months (December 2023, January 2024, March 2024, and today) all preceded price pumps of 15–35% within 7–10 days. The current inflow event ranks as the third-largest in the dataset.',
        'Where are these inflows going? Glassnode data shows Bitcoin and Ethereum receiving the largest allocation of new stablecoin buying. However, the ratio of SOL perpetual open interest increase suggests significant allocation to Solana as well.',
        "Funding rates are positive but not extreme — below 0.05% per 8 hours across all major exchanges. This is a healthy sign. When stablecoin inflows coincide with elevated funding rates (>0.1%), it typically signals overleveraged longs and an impending correction. Today's setup is cleaner.",
        'Takeaway: The data supports a risk-on bias for the next 7–14 days. Focus on assets that have underperformed the recent consolidation (they have the most catch-up potential). Watch for funding rates: if they exceed 0.08%, begin reducing exposure.',
      ]),
    },

    // ---- Analysis / Market Direction (2 more) ----
    {
      title: 'Q4 2024 Crypto Outlook: The Bull Case for $100,000 Bitcoin',
      slug: 'q4-2024-crypto-outlook-100k-bitcoin',
      excerpt:
        'Our comprehensive Q4 2024 outlook. We lay out the bull case for a $100K Bitcoin year-end, the catalysts that could accelerate it, and the risks that could derail it.',
      category: categoryIdMap['market-direction'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(43),
      author: adminAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['macro']],
      content: makeBody([
        'Our base case for Q4 2024: Bitcoin reaches $100,000–$120,000 before year-end. This is not a forecast built on hope — it is built on quantifiable catalysts that have either already occurred or have a high probability of occurring in the next 90 days.',
        'Catalyst 1: ETF inflows. At the current rate of $200M+ per day in net inflows across all US Bitcoin ETFs, and with miner supply reduced 50% post-halving, the structural supply deficit will compound every week. Mathematical supply/demand analysis supports a 6-month price target of $90,000–$130,000.',
        'Catalyst 2: Rate cuts. The Fed is expected to cut rates in September and December. Lower rates increase the attractiveness of Bitcoin relative to Treasuries for institutional allocators. Even one rate cut of 25bps shifts the risk/reward calculation significantly.',
        'Catalyst 3: Election cycle. Regardless of which US political party wins the November election, both major candidates have made pro-crypto statements. A regulatory clarity win for the US (e.g., spot Ethereum ETF approval, stablecoin legislation) would be a $10,000+ catalyst for Bitcoin.',
        'Bear case risks: (1) Macro shock — unexpected credit event or systemic financial stress. (2) Regulatory reversal — unlikely but possible if a major exchange collapses. (3) On-chain miner capitulation — if hash rate drops 40%+, short-term selling pressure increases. Our Q4 portfolio: 45% BTC, 25% ETH, 20% high-conviction altcoins, 10% stable.',
      ]),
    },
    {
      title: 'The Bear Case: What Happens If Rate Cuts Are Delayed Until 2025?',
      slug: 'bear-case-rate-cuts-delayed',
      excerpt:
        'Not every macro scenario is bullish. If CPI remains sticky and the Fed delays cuts to 2025, here is the realistic downside scenario for crypto and how to position defensively.',
      category: categoryIdMap['market-direction'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(48),
      author: analystAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['bitcoin']],
      content: makeBody([
        'We present the bear case — not because we believe it is likely, but because every investor must understand the downside scenario before sizing positions. Overconfidence in bull cases is how most investors get destroyed in crypto.',
        'The macro bear scenario: CPI reaccelerates to 3.8%+ in July/August due to energy prices and shelter costs. The Fed signals "higher for longer" through year-end. Markets reprice a 50bps rate hike probability for November. The DXY rallies above 107. Gold falls. Bitcoin falls.',
        'In this scenario, our modelling suggests Bitcoin could retrace to $52,000–$56,000 — the 200-day moving average and pre-halving accumulation zone. Altcoins would fall 30–50% from current levels. DeFi TVL would drop to $65–75 billion.',
        "The counter-argument: ETF inflows have changed Bitcoin's macro sensitivity. Even in the 2022 rate hike cycle, Bitcoin bottomed at $15,600. With $20B+ in ETF AUM providing a structural bid, the downside in a hawkish macro scenario is meaningfully lower than 2022.",
        'How to position defensively: Increase stable allocation to 20–30%. Sell covered calls on BTC/ETH positions to generate income during sideways action. Reduce altcoin beta. Accumulate stablecoin yield via USDY or similar RWA yield products. Do not short into strength — time the reduction of longs instead.',
      ]),
    },

    // ---- Analysis / Market Pulse (3 new) ----
    {
      title: 'On-Chain Analysis: Bitcoin Dormancy Flow Hits 12-Month High',
      slug: 'onchain-bitcoin-dormancy-flow',
      excerpt:
        'Long-term Bitcoin holders are the most inactive they have been in 12 months. Bitcoin Dormancy Flow at historic highs signals conviction from the strongest hands.',
      category: categoryIdMap['market-pulse'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(2),
      author: adminAuthorId,
      tags: [tagIdMap['bitcoin'], tagIdMap['on-chain']],
      content: makeBody([
        'Bitcoin Dormancy Flow measures the average age of coins spent in transactions, expressed as a ratio to current market cap. When coins with high dormancy (old coins moved for the first time in years) are sold heavily, it signals distribution by long-term holders. When dormancy is low, it signals conviction and holding.',
        'This week, Bitcoin Dormancy Flow hit its lowest reading in 12 months — meaning the coins being spent are among the youngest in circulation. Long-term holders (coins unmoved for 1+ years) are not selling. The supply locked in these wallets now represents 74% of all circulating Bitcoin — an all-time high.',
        'The Illiquid Supply Ratio (the percentage of Bitcoin held in wallets that have never sold) also reached a new record this week at 76.2%. This structural reduction in available supply is one of the most bullish on-chain signals possible.',
        'Exchange balances continue declining: there are now 2.3 million BTC on exchanges — the lowest level since February 2018. This means the float available for immediate selling is historically thin. Even moderate ETF demand creates outsized price impact.',
        'Interpretation: The on-chain data is unambiguously bullish. The caveat is that these metrics are lagging — they tell you about past behaviour, not future decisions. But combined with the post-halving supply reduction and ETF demand, the weight of evidence strongly favours the upside scenario.',
      ]),
    },
    {
      title: 'Ethereum NVT Ratio: Is ETH Overvalued at Current Prices?',
      slug: 'ethereum-nvt-ratio-overvalued',
      excerpt:
        "Ethereum's NVT ratio — the on-chain equivalent of P/E — is showing mixed signals. We break down what the data says and whether ETH is cheap or expensive right now.",
      category: categoryIdMap['market-pulse'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(17),
      author: analystAuthorId,
      tags: [tagIdMap['ethereum'], tagIdMap['on-chain']],
      content: makeBody([
        "The Network Value to Transactions (NVT) ratio is crypto's equivalent of the price-to-earnings ratio. It compares a blockchain's market cap to the value of transactions settled on-chain over a 30-day period. A high NVT suggests the market is pricing in future growth; a low NVT suggests the network is undervalued relative to current usage.",
        "Ethereum's current NVT ratio is 47 — above the 2-year average of 38 but significantly below the 2021 peak of 120. Using a 90-day transaction volume smoothing (which removes short-term spikes), the NVT Signal (Willy Woo's refined version) reads 72 — in the Neutral zone, neither overbought nor oversold.",
        "Key consideration: Ethereum's on-chain transaction volume has been partially migrated to Layer 2 networks (Arbitrum, Base, Optimism). If you include L2 transaction volume in the denominator, Ethereum's network-wide NVT drops to approximately 22 — significantly below historical averages and indicating substantial undervaluation.",
        'Fee revenue comparison: Ethereum mainnet + L2 fee revenue combined is approximately $2B annually. At current ETH market cap of $350B, this implies a Price/Revenue of 175x. Comparable to Solana (210x) but below historical Ethereum peaks (400x+).',
        'Conclusion: ETH is not cheap, but it is not expensive by historical standards. The best risk/reward entry zone remains $2,400–$2,800. Above $3,500, the NVT ratios begin flashing caution. Current level: Neutral.',
      ]),
    },
    {
      title: 'Funding Rates Across Exchanges: What the Current Data Tells Us',
      slug: 'funding-rates-exchanges-analysis',
      excerpt:
        'Funding rates are the most real-time indicator of market sentiment. A cross-exchange analysis of BTC, ETH, and SOL funding — and what elevated rates have historically predicted.',
      category: categoryIdMap['market-pulse'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(7),
      author: analystAuthorId,
      tags: [tagIdMap['on-chain'], tagIdMap['bitcoin']],
      content: makeBody([
        'Perpetual futures funding rates are the clearest real-time indicator of whether the market is positioned long or short. When funding is positive, longs pay shorts — indicating more bullish bets. When funding is negative, shorts pay longs — indicating more bearish positioning. Extreme readings in either direction are mean-reversion signals.',
        'Current BTC funding rate: +0.031% per 8 hours (annualised: ~34%). This is elevated but not at the danger zone. In Q1 2024, BTC funding hit +0.10% per 8 hours — 3x current levels — and preceded a 20% correction. Current levels are consistent with healthy bull market positioning, not excess.',
        'ETH funding rate: +0.028% per 8 hours. Similar to BTC — elevated but not extreme. The ETH/BTC ratio in funding suggests that ETH longs are slightly less aggressive than BTC, which is unusual given ETH ETF expectations. This could indicate ETH is the contrarian long.',
        'SOL funding rate: +0.045% per 8 hours — the highest in our coverage universe. SOL has the most over-leveraged long positioning. In prior cycles, SOL funding above 0.05% consistently preceded corrections of 15–25% within 1–2 weeks. Monitor closely.',
        'Action: No change to core positions based on current funding. Watch for SOL funding approaching 0.05% as a signal to reduce SOL exposure or hedge with a small short. For BTC and ETH, current funding is consistent with continued trend-following longs.',
      ]),
    },

    // ---- Analysis / Livestreams (2 new) ----
    {
      title: 'Livestream Replay: Your Top Altcoin Questions Answered',
      slug: 'livestream-altcoin-qa-replay',
      excerpt:
        'Full replay of our weekly Q&A session. We covered the top 20 community questions on altcoin picks, entry strategies, and portfolio sizing for Q3.',
      category: categoryIdMap['livestreams'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(36),
      author: adminAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['defi']],
      content: makeBody([
        "This week's live session was our most attended ever — over 2,400 community members joined. The questions were excellent. We have compiled the top 20 answers here for community members who could not attend.",
        'Q: "Should I sell my altcoins and buy more BTC now?" — A: It depends on your time horizon. If you are 12+ months, stay in your high-conviction altcoins. If you are 3–6 months, increase BTC allocation to 50%+ and treat alts as satellites. Never let alts exceed your risk tolerance.',
        'Q: "Is it too late to buy SOL?" — A: At $150, SOL still has a credible path to $500+ this cycle based on DeFi TVL growth and institutional interest. It is not "cheap" but nor is it extended. Dollar-cost average rather than market-buy.',
        'Q: "What is your conviction on AI tokens?" — A: We are selective. WLD and TAO are the only two we hold with more than 1% portfolio weight. The AI narrative is real but most AI tokens are marketing, not infrastructure. The sector will consolidate.',
        'Q: "When will altcoin season properly start?" — A: It has technically started (altcoin index > 75). The next leg requires BTC dominance to break below 50%. We expect that to happen in Q3 2024, triggering the most aggressive altcoin rotation of the cycle. Patience.',
      ]),
    },
    {
      title: 'Macro Tuesday Replay: Fed, DXY, and Crypto Positioning',
      slug: 'livestream-macro-tuesday-fed-dxy',
      excerpt:
        'Replay of our Macro Tuesday session. We covered the Fed dot plot update, the DXY breakdown, and how to position your portfolio for the macro shift underway.',
      category: categoryIdMap['livestreams'],
      isProOnly: true,
      status: 'published',
      publishedAt: daysAgo(46),
      author: analystAuthorId,
      tags: [tagIdMap['macro'], tagIdMap['bitcoin']],
      content: makeBody([
        "This week's Macro Tuesday focused on three macro developments that will shape crypto through year-end: the Fed's updated dot plot, the US dollar index (DXY) technical breakdown, and global M2 money supply trajectory.",
        'Fed dot plot update: The median dot for 2024 moved from 3 cuts to 1 cut. Markets had priced in 2 cuts. The single-cut scenario is the new base case. This is mildly bearish for risk assets in the short term but does not change the 12-month outlook, which assumes the easing cycle begins regardless of pace.',
        'DXY technical breakdown: The DXY has broken below the 104 support level it held for 6 months. This is technically significant — a sustained break below 104 historically correlated with 30–50% Bitcoin rallies within 6 months. The DXY is now targeting 101–102.',
        'Global M2: Non-US central banks (ECB, PBoC, Bank of Japan) are all either cutting rates or maintaining loose policy. Global USD-denominated M2 is growing at 5.4% annually — the fastest pace since 2022. The 12-month lag on M2 and crypto prices points to Q4 2024 and Q1 2025 as the peak liquidity window.',
        'Portfolio implications from the session: Increase BTC allocation on DXY weakness. Keep ETH as the second core position. Reduce USD cash holdings as the dollar weakens — deploy into productive assets (liquid staking, RWA yield). Next session: Tuesday, same time. Submit your macro questions in the Discord #macro-questions channel.',
      ]),
    },

    // ---- Education / Simply Explained (2 more) ----
    {
      title: 'Bitcoin Basics: What Is a UTXO and Why Does It Matter?',
      slug: 'bitcoin-basics-utxo-explained',
      excerpt:
        "Bitcoin doesn't use accounts like banks do. It uses Unspent Transaction Outputs (UTXOs). Understanding this model is fundamental to understanding how Bitcoin actually works.",
      category: categoryIdMap['simply-explained'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(60),
      author: analystAuthorId,
      tags: [tagIdMap['bitcoin']],
      content: makeBody([
        'When you send Bitcoin, you are not deducting from a balance like a bank account. Instead, you are spending Unspent Transaction Outputs (UTXOs) — discrete chunks of Bitcoin from previous transactions — and creating new UTXOs as change.',
        'An analogy: imagine Bitcoin is physical cash. If you have a $50 note and want to pay $30, you hand over the $50 note and receive $20 in change. The $50 note is destroyed (spent UTXO), a $30 note is created (payment UTXO), and a $20 note is created (change UTXO). This is exactly how Bitcoin transactions work.',
        'Why UTXOs matter for users: Your Bitcoin "balance" is actually the sum of all UTXOs in your wallet. When you transact, the wallet software selects which UTXOs to spend — a process called "coin selection." Poor coin selection can unnecessarily increase transaction fees.',
        'UTXO consolidation: If your wallet contains many small UTXOs (from receiving many small payments or mining), your transaction fees will be higher because you need to include many inputs. During periods of low mempool congestion (low fees), consolidate your UTXOs: send your full balance to yourself to merge many small UTXOs into one large one.',
        'Privacy implications: Every UTXO spend is permanently recorded on the blockchain. UTXOs from different sources that get combined in one transaction reveal they are owned by the same person. Bitcoin privacy tools (CoinJoin, Lightning Network) exist specifically to break these linkages.',
      ]),
    },
    {
      title: 'How to Read a Crypto Whitepaper: A Step-by-Step Framework',
      slug: 'how-to-read-crypto-whitepaper',
      excerpt:
        "Most crypto investors never read whitepapers. The ones who do have a significant edge. Here's a practical framework for evaluating any whitepaper in under 30 minutes.",
      category: categoryIdMap['simply-explained'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(70),
      author: adminAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        "A whitepaper is a protocol's founding document — its technical specification, economic model, and value proposition all in one. Most investors skip them entirely. The ones who read them can identify genuine innovation versus marketing before the crowd, and spot red flags that prevent costly mistakes.",
        'Step 1 — Read the Abstract and Introduction (5 minutes): The abstract tells you what problem the protocol claims to solve and how. If you cannot understand what the protocol does after reading these two sections, it is either poorly designed or deliberately obfuscated. Both are red flags.',
        'Step 2 — Evaluate the problem statement (5 minutes): Is the problem real? Is it significant? Does the protocol have a genuine solution, or is it solving a problem that does not exist? Compare the problem statement to existing solutions. A good whitepaper acknowledges existing approaches and explains why they are insufficient.',
        'Step 3 — Tokenomics section (10 minutes): This is the most important section for investors. Look for: (1) Total supply and inflation rate. (2) Team and investor allocations — above 25% combined is a red flag. (3) Vesting schedules — short locks (under 12 months) are a warning sign. (4) Token utility — why does the ecosystem NEED this token? "Governance" alone is insufficient.',
        'Step 4 — Technical appendix and audit reports (5 minutes): You do not need to understand the mathematics, but check: Has the protocol been audited? By whom? Are the audit reports publicly available? Are there any open critical or high-severity issues? A protocol that has not been audited should not receive your capital.',
        'Step 5 — Red flags checklist: Anonymous team without verified track record. Plagiarised whitepaper (use Google Scholar to check). No clear token utility. Unrealistic performance claims. Missing or incomplete tokenomics. If two or more red flags are present, move on.',
      ]),
    },

    // ---- Education / Guides (3 new) ----
    {
      title: 'The Essential DeFi Toolkit: 20 Tools Every Crypto Investor Needs',
      slug: 'defi-toolkit-20-essential-tools',
      excerpt:
        'The right tools separate informed investors from those trading blind. From portfolio tracking to on-chain analytics, here are the 20 tools we use every day.',
      category: categoryIdMap['guides'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(52),
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['on-chain']],
      content: makeBody([
        'Portfolio tracking: (1) DeBank — the best multi-chain DeFi portfolio tracker. Shows all wallet positions across 30+ chains, including DeFi, NFTs, and LP positions. Free. (2) Zapper — similar to DeBank with a cleaner UI. Also shows historical performance. (3) Nansen Portfolio — paid tier adds wallet labels and token flow analysis.',
        'On-chain analytics: (4) Glassnode — the gold standard for Bitcoin and Ethereum on-chain metrics. Subscription required for most metrics. (5) CryptoQuant — alternative to Glassnode, stronger on exchange flow data. (6) Dune Analytics — community-built dashboards for any on-chain question. Most dashboards are free.',
        'Market data: (7) CoinGecko — price and market cap data, free. (8) TradingView — charting platform. Pine Script allows custom indicator building. (9) Coinglass — derivative data, funding rates, open interest, and liquidation maps. Free.',
        'DEX tools: (10) DeFiLlama — TVL rankings, protocol revenue, and chain comparisons. (11) GeckoTerminal — real-time DEX pair data across all chains. (12) DEX Screener — identify new token launches and liquidity pools in real time. (13) Jupiter — best DEX aggregator on Solana. (14) 1inch — best DEX aggregator on Ethereum.',
        'Security and research: (15) Etherscan / Solscan / BSCScan — block explorers for each chain. (16) Revoke.cash — revoke token approvals to reduce smart contract risk. (17) Token Sniffer — basic contract security scanner. (18) Messari — research reports and protocol profiles. (19) The Block — institutional crypto news and data. (20) LunarCrush — social sentiment analytics.',
      ]),
    },
    {
      title: 'How to Use Block Explorers: Etherscan, Solscan, and More',
      slug: 'how-to-use-block-explorers',
      excerpt:
        'Block explorers let you verify any transaction, check wallet balances, and read smart contracts. This guide explains how to use them — including the parts most investors ignore.',
      category: categoryIdMap['guides'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(58),
      author: adminAuthorId,
      tags: [tagIdMap['ethereum'], tagIdMap['bitcoin']],
      content: makeBody([
        'A block explorer is a search engine for a blockchain. Every transaction ever made, every wallet balance, and every smart contract interaction is publicly visible. Block explorers make this data human-readable. Etherscan (Ethereum), Solscan (Solana), Blockstream.info (Bitcoin), and BscScan (BNB Chain) are the most used.',
        'Looking up a transaction: Paste a transaction hash (txid) into the search bar. The result shows: sender address, receiver address, value transferred, gas fee paid, timestamp, and block confirmation count. "Pending" means the transaction is waiting to be included in a block. "Failed" means execution reverted — gas was still consumed.',
        'Checking a wallet address: Paste any wallet address to see its current balance and full transaction history. This is the foundation of on-chain research — you can track the movements of any known wallet (exchange wallets, VC funds, protocol treasuries, whale wallets).',
        'Reading a smart contract: On Etherscan, navigate to a contract address and click the "Contract" tab. If the code is verified, you can read the source code. The "Read Contract" section shows current state variables (useful for checking protocol parameters, TVL, or token balances). The "Write Contract" section lets you interact directly with the contract.',
        'Token approvals — the security use case: On Etherscan, click the "Token Approvals" option on any wallet address. This shows every smart contract that has been granted permission to spend tokens from your wallet. Revoke any approvals from protocols you no longer use. This is a critical security hygiene step that most users never do.',
      ]),
    },
    {
      title: 'Crypto Tax Basics for 2024: What Every Investor Needs to Know',
      slug: 'crypto-tax-basics-2024',
      excerpt:
        'Crypto tax is complex but unavoidable. This guide covers the basics: what is taxable, how to calculate gains, and the tools that can automate most of the work.',
      category: categoryIdMap['guides'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(65),
      author: analystAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['macro']],
      content: makeBody([
        'Important disclaimer: This is general educational information, not tax advice. Consult a qualified tax professional for your specific situation. Crypto tax laws vary significantly by jurisdiction.',
        'What is a taxable event in most jurisdictions: (1) Selling cryptocurrency for fiat currency. (2) Swapping one cryptocurrency for another. (3) Using cryptocurrency to purchase goods or services. (4) Receiving cryptocurrency as income (staking rewards, airdrops, salary). What is typically NOT taxable: buying crypto with fiat, holding crypto, transferring between your own wallets.',
        'Calculating gains: Capital gain = Sale price - Cost basis. Cost basis is what you paid for the asset, including fees. For FIFO (First In, First Out) accounting — the default in most countries — you calculate gains using the oldest coins first. Specific identification (choosing which coins to sell) can minimise tax but requires meticulous records.',
        'DeFi complications: Each swap in a DeFi protocol is typically a taxable event. Providing liquidity and removing it can trigger gains calculations. Staking rewards are generally taxed as income at the fair market value when received. Airdrops are typically income at receipt value.',
        'Tools that automate the work: Koinly (best overall), CoinTracker (good US support), Accointing (good EU support), and TaxBit (enterprise-grade for high-volume traders). Import your wallet addresses and exchange API keys. The tools reconstruct your full transaction history and generate tax forms automatically. Start using one now — retroactive reconstruction is painful.',
      ]),
    },

    // ---- Education / Simply Explained (2 more) ----
    {
      title: 'DeFi Glossary: The 50 Terms Every Investor Must Know',
      slug: 'glossary-defi-terms',
      excerpt:
        'From AMM to yield farming, DeFi has its own vocabulary. This reference glossary covers the 50 most important DeFi terms — plain language, no jargon.',
      category: categoryIdMap['simply-explained'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(75),
      author: adminAuthorId,
      tags: [tagIdMap['defi'], tagIdMap['ethereum']],
      content: makeBody([
        'AMM (Automated Market Maker): A smart contract that enables decentralised trading using a mathematical formula (typically x*y=k) instead of an order book. Examples: Uniswap, Curve, Trader Joe. APR vs APY: APR is Annual Percentage Rate (no compounding). APY is Annual Percentage Yield (with compounding). A 100% APR compounded daily = 171% APY. Always check which figure protocols quote.',
        'Collateralisation Ratio: The ratio of collateral value to borrowed value in a lending protocol. A 150% ratio means you must deposit $150 to borrow $100. Falling below the minimum triggers liquidation. Composability: The ability of DeFi protocols to interact and build on each other. Often called "money legos" — stETH can be collateral in Aave, which can be borrowed against on Maker.',
        'Flash Loan: An uncollateralised loan that must be borrowed and repaid in a single transaction. Used for arbitrage, liquidations, and collateral swaps. If not repaid in the same transaction, the entire operation reverts. Governance Token: A token that gives holders voting rights over protocol parameters (fees, interest rates, new features). Value depends entirely on the economic significance of what governance controls.',
        'Impermanent Loss (IL): The opportunity cost of providing liquidity in an AMM versus simply holding the assets. Occurs when the price ratio between the two assets in a pool changes. "Impermanent" because IL reverses if prices return to entry ratio. Liquidation: The automatic selling of collateral when a borrower\'s collateral ratio falls below the minimum. Protects lenders but results in losses for the borrower.',
        'Slippage: The difference between the expected price and the executed price of a trade. Higher slippage occurs in pools with less liquidity or larger trades. Set slippage tolerance carefully — too tight causes failed transactions; too loose enables sandwich attacks. TVL (Total Value Locked): The total dollar value of assets deposited in a DeFi protocol. The primary metric for comparing protocol size and adoption. Not to be confused with market cap.',
      ]),
    },
    {
      title: 'Layer 2 and Scaling Terminology: A Complete Reference',
      slug: 'glossary-layer2-scaling-terminology',
      excerpt:
        'Rollups, sequencers, data availability, and fraud proofs — Layer 2 scaling has its own dense vocabulary. This reference glossary explains every term clearly.',
      category: categoryIdMap['simply-explained'],
      isProOnly: false,
      status: 'published',
      publishedAt: daysAgo(80),
      author: analystAuthorId,
      tags: [tagIdMap['layer-2'], tagIdMap['ethereum']],
      content: makeBody([
        'Layer 1 (L1): The base blockchain — Ethereum, Bitcoin, Solana. Processes and secures all transactions. Layer 2 (L2): A system built on top of an L1 that processes transactions faster/cheaper, then posts results back to the L1 for security. Examples: Arbitrum, Optimism, Base, zkSync.',
        'Optimistic Rollup: A rollup that assumes transactions are valid by default ("optimistic") and uses a fraud proof mechanism to challenge incorrect state transitions. The challenge period (typically 7 days) introduces a withdrawal delay from L2 to L1. Examples: Arbitrum, Optimism, Base.',
        'ZK-Rollup (Zero-Knowledge Rollup): A rollup that generates a cryptographic proof (validity proof) for every batch of transactions. The proof mathematically guarantees correctness — no trust required and no challenge period. Faster L2→L1 withdrawals. More computationally intensive to generate. Examples: zkSync Era, Starknet, Polygon zkEVM.',
        'Sequencer: The entity that orders and processes transactions on an L2. Most L2s currently use a centralised sequencer (operated by the L2 team). Decentralised sequencers are an active area of development — a centralised sequencer can censor transactions or go offline.',
        'Data Availability (DA): Where the data for L2 transactions is stored. Most L2s post data to Ethereum (expensive but maximally secure). Alternatives include Celestia, EigenDA, and Avail — cheaper but with different security trade-offs. Blobs (EIP-4844): A new Ethereum transaction type introduced in the Dencun upgrade specifically for L2 data posting. Blobs are 10–100x cheaper than calldata and expire after ~18 days.',
      ]),
    },
  ]

  let seededCount = 0
  for (const post of POSTS) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: post.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) continue

    await payload.create({
      collection: 'posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags?.filter(Boolean) ?? [],
        author: post.author,
        status: post.status,
        publishedAt: post.publishedAt,
        isProOnly: post.isProOnly,
        riskRating: (post as { riskRating?: string }).riskRating ?? undefined,
        featuredImage: mediaIdMap[post.slug] ?? undefined,
      },
      context: { skipStatusGuard: true },
    })
    seededCount++
  }
  console.log(
    `[seed] Posts: ${seededCount} created, ${POSTS.length - seededCount} already existed.`
  )

  // ─── Courses, Modules & Lessons ───────────────────────────────────────────
  console.log('[seed] Seeding courses, modules & lessons...')

  const SEED_COURSES = [
    {
      title: 'Crypto Trading 101',
      slug: 'crypto-trading-101',
      excerpt:
        'Learn the foundations of cryptocurrency trading — from reading charts to placing your first trade.',
      difficulty: 'beginner' as const,
      estimatedDuration: '4 hours',
      isProOnly: false,
      status: 'published' as const,
      order: 0,
      modules: [
        {
          title: 'Getting Started',
          slug: 'getting-started',
          description: 'Set up your environment and understand the basics of crypto markets.',
          order: 0,
          status: 'published' as const,
          lessons: [
            {
              title: 'What Is Cryptocurrency Trading?',
              slug: 'what-is-crypto-trading',
              order: 0,
              estimatedDuration: 8,
              isFreePreview: true,
              status: 'published' as const,
              content: makeBody([
                'Cryptocurrency trading is the act of buying and selling digital assets on exchanges to profit from price movements.',
                'Unlike traditional stock markets, crypto markets operate 24/7, offering continuous trading opportunities across hundreds of tokens.',
                'In this lesson, we cover the basic mechanics: spot trading vs. derivatives, order types, and how exchanges match buyers with sellers.',
                'By the end, you will understand how trades execute and what makes crypto markets unique compared to equities or forex.',
              ]),
            },
            {
              title: 'Setting Up Your First Exchange Account',
              slug: 'setting-up-exchange-account',
              order: 1,
              estimatedDuration: 10,
              isFreePreview: true,
              status: 'published' as const,
              content: makeBody([
                'Before you can trade, you need an account on a cryptocurrency exchange. Popular choices include Binance, Coinbase, and Kraken.',
                'We walk through the sign-up process, KYC verification, enabling two-factor authentication, and funding your account with fiat or stablecoins.',
                'Security is paramount — never share your API keys, use a hardware wallet for long-term holdings, and enable withdrawal whitelists.',
                'Once your account is funded, you are ready to explore the trading interface and place your first order.',
              ]),
            },
            {
              title: 'Understanding Market vs. Limit Orders',
              slug: 'market-vs-limit-orders',
              order: 2,
              estimatedDuration: 7,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'A market order executes immediately at the best available price, while a limit order lets you specify the exact price you want.',
                'Market orders guarantee execution but not price — useful when speed matters. Limit orders guarantee price but not execution — useful when precision matters.',
                'Understanding the spread (the gap between the best bid and ask) helps you decide which order type to use in different market conditions.',
                'We also cover stop-loss orders and take-profit orders, which automate your exits and help manage risk.',
              ]),
            },
          ],
        },
        {
          title: 'Reading Charts',
          slug: 'reading-charts',
          description: 'Learn to read candlestick charts and identify basic patterns.',
          order: 1,
          status: 'published' as const,
          lessons: [
            {
              title: 'Introduction to Candlestick Charts',
              slug: 'intro-candlestick-charts',
              order: 0,
              estimatedDuration: 12,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'Candlestick charts originated in 18th-century Japanese rice trading and remain the most popular chart type in crypto.',
                'Each candle shows four data points: open, high, low, and close (OHLC). Green/white candles indicate the close was higher than the open; red/black candles indicate it was lower.',
                'The body shows the range between open and close, while the wicks (shadows) show the highest and lowest prices during that period.',
                'Learning to read candles at a glance is the first step toward technical analysis — you will start seeing supply and demand zones emerge naturally.',
              ]),
            },
            {
              title: 'Support and Resistance Levels',
              slug: 'support-and-resistance',
              order: 1,
              estimatedDuration: 10,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'Support is a price level where demand is strong enough to prevent further decline. Resistance is where supply prevents further advance.',
                'These levels are identified by looking at historical price action — areas where price has repeatedly bounced or reversed.',
                'The more times a level is tested, the stronger it becomes. When broken, support often becomes resistance and vice versa (role reversal).',
                'Plotting horizontal support and resistance lines on your chart is one of the simplest yet most effective techniques for timing entries and exits.',
              ]),
            },
            {
              title: 'Basic Chart Patterns',
              slug: 'basic-chart-patterns',
              order: 2,
              estimatedDuration: 15,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'Chart patterns are geometric shapes formed by price action that tend to resolve in predictable ways.',
                'Continuation patterns like flags, pennants, and wedges suggest the existing trend will resume after consolidation.',
                'Reversal patterns like double tops, double bottoms, and head-and-shoulders signal a potential trend change.',
                'While no pattern guarantees an outcome, combining pattern recognition with volume analysis and other indicators improves your probability of success.',
              ]),
            },
          ],
        },
        {
          title: 'Risk Management',
          slug: 'risk-management',
          description: 'Protect your capital with proven risk management strategies.',
          order: 2,
          status: 'published' as const,
          lessons: [
            {
              title: 'Position Sizing and the 1% Rule',
              slug: 'position-sizing-1-percent-rule',
              order: 0,
              estimatedDuration: 8,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'The number one rule in trading: never risk more than 1-2% of your total portfolio on a single trade.',
                'Position sizing determines how much capital you allocate to each trade based on your stop-loss distance and risk tolerance.',
                'For example, if your portfolio is $10,000 and you risk 1% per trade, your maximum loss per trade is $100. If your stop-loss is 5% below entry, your position size is $2,000.',
                'Consistent position sizing ensures that no single trade can significantly damage your portfolio, even during losing streaks.',
              ]),
            },
            {
              title: 'Setting Stop-Losses Correctly',
              slug: 'setting-stop-losses',
              order: 1,
              estimatedDuration: 10,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'A stop-loss is a predetermined price level at which you exit a losing trade. It removes emotion from the decision.',
                'Place stop-losses at technically significant levels — below support for longs, above resistance for shorts — not arbitrary percentages.',
                'Avoid placing stops at round numbers (e.g., $100.00) where many other traders cluster theirs, as market makers often hunt these levels.',
                'Trailing stop-losses can lock in profits as a trade moves in your favor, automatically adjusting the exit point upward.',
              ]),
            },
          ],
        },
      ],
    },
    {
      title: 'Advanced Technical Analysis',
      slug: 'advanced-technical-analysis',
      excerpt:
        'Master advanced TA concepts — indicators, volume profile, and multi-timeframe analysis for pro-level trading.',
      difficulty: 'advanced' as const,
      estimatedDuration: '8 hours',
      isProOnly: true,
      status: 'published' as const,
      order: 1,
      modules: [
        {
          title: 'Indicators & Oscillators',
          slug: 'indicators-oscillators',
          description:
            'Deep dive into RSI, MACD, Bollinger Bands, and how to combine them effectively.',
          order: 0,
          status: 'published' as const,
          lessons: [
            {
              title: 'RSI: Beyond Overbought and Oversold',
              slug: 'rsi-beyond-overbought-oversold',
              order: 0,
              estimatedDuration: 15,
              isFreePreview: true,
              status: 'published' as const,
              content: makeBody([
                'The Relative Strength Index (RSI) measures the speed and magnitude of recent price changes to evaluate overbought or oversold conditions.',
                'Most traders only look at the 30/70 levels, but RSI divergences — when price makes a new high but RSI does not — are far more powerful signals.',
                'In strong uptrends, RSI can stay above 70 for extended periods. Using the 40-80 range during bull markets and 20-60 during bear markets improves accuracy.',
                'Combine RSI with volume and price structure for confirmation rather than using it as a standalone signal.',
              ]),
            },
            {
              title: 'MACD: Trend and Momentum Combined',
              slug: 'macd-trend-momentum',
              order: 1,
              estimatedDuration: 12,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'The Moving Average Convergence Divergence (MACD) combines two exponential moving averages to reveal trend direction and momentum.',
                'A bullish signal occurs when the MACD line crosses above the signal line; bearish when it crosses below.',
                'The MACD histogram visualises the distance between the two lines — expanding bars mean increasing momentum, shrinking bars mean momentum is fading.',
                'Multi-timeframe MACD analysis — checking alignment on daily and 4-hour charts — significantly improves trade conviction.',
              ]),
            },
            {
              title: 'Bollinger Bands and Volatility Squeezes',
              slug: 'bollinger-bands-volatility',
              order: 2,
              estimatedDuration: 10,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'Bollinger Bands plot a moving average with upper and lower bands set at two standard deviations from the mean.',
                'When the bands contract (a "squeeze"), it indicates low volatility and often precedes a significant price move in either direction.',
                'Price walking the upper band during a trend is a sign of strength, not overbought conditions — context matters.',
                'Combining Bollinger Band width with RSI can help you time entries during squeeze breakouts.',
              ]),
            },
          ],
        },
        {
          title: 'Volume Profile Analysis',
          slug: 'volume-profile-analysis',
          description:
            'Use volume-at-price to identify key support, resistance, and high-probability trading zones.',
          order: 1,
          status: 'published' as const,
          lessons: [
            {
              title: 'What Is Volume Profile?',
              slug: 'what-is-volume-profile',
              order: 0,
              estimatedDuration: 10,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'Volume Profile displays the amount of trading activity at each price level over a specified time period, shown as a horizontal histogram.',
                'High-volume nodes (HVN) indicate prices where significant trading occurred — these act as magnets and often serve as support or resistance.',
                'Low-volume nodes (LVN) represent price levels where little trading happened — price tends to move quickly through these areas.',
                'The Point of Control (POC) is the price level with the highest volume — it represents the "fairest" price where most agreement occurred between buyers and sellers.',
              ]),
            },
            {
              title: 'Value Area and Trading Strategies',
              slug: 'value-area-strategies',
              order: 1,
              estimatedDuration: 14,
              isFreePreview: false,
              status: 'published' as const,
              content: makeBody([
                'The Value Area encompasses the price range where 70% of trading volume occurred — typically between the Value Area High (VAH) and Value Area Low (VAL).',
                'When price opens inside the value area, there is an 80% probability it will revisit the opposite boundary (the "80% rule").',
                'When price opens outside the value area and fails to re-enter within the first 30 minutes, it signals a potential trend day.',
                'Combining Volume Profile with traditional support/resistance and order flow gives you a three-dimensional view of market structure.',
              ]),
            },
          ],
        },
      ],
    },
  ]

  let coursesSeeded = 0
  let modulesSeeded = 0
  let lessonsSeeded = 0

  for (const courseData of SEED_COURSES) {
    // Check if course already exists
    const existingCourse = await payload.find({
      collection: 'courses',
      where: { slug: { equals: courseData.slug } },
      limit: 1,
    })

    let courseId: string | number
    if (existingCourse.docs.length > 0) {
      courseId = existingCourse.docs[0].id
    } else {
      const created = await payload.create({
        collection: 'courses',
        data: {
          title: courseData.title,
          slug: courseData.slug,
          excerpt: courseData.excerpt,
          difficulty: courseData.difficulty,
          estimatedDuration: courseData.estimatedDuration,
          isProOnly: courseData.isProOnly,
          status: courseData.status,
          order: courseData.order,
        },
      })
      courseId = created.id
      coursesSeeded++
    }

    // Seed modules for this course
    for (const modData of courseData.modules) {
      const existingModule = await payload.find({
        collection: 'modules',
        where: { slug: { equals: modData.slug } },
        limit: 1,
      })

      let moduleId: string | number
      if (existingModule.docs.length > 0) {
        moduleId = existingModule.docs[0].id
      } else {
        const created = await payload.create({
          collection: 'modules',
          data: {
            title: modData.title,
            slug: modData.slug,
            description: modData.description,
            course: courseId,
            order: modData.order,
            status: modData.status,
          },
        })
        moduleId = created.id
        modulesSeeded++
      }

      // Seed lessons for this module
      for (const lessonData of modData.lessons) {
        const existingLesson = await payload.find({
          collection: 'lessons',
          where: { slug: { equals: lessonData.slug } },
          limit: 1,
        })

        if (existingLesson.docs.length > 0) continue

        await payload.create({
          collection: 'lessons',
          data: {
            title: lessonData.title,
            slug: lessonData.slug,
            module: moduleId,
            content: lessonData.content,
            estimatedDuration: lessonData.estimatedDuration,
            isFreePreview: lessonData.isFreePreview,
            order: lessonData.order,
            status: lessonData.status,
          },
        })
        lessonsSeeded++
      }
    }
  }

  console.log(
    `[seed] Courses: ${coursesSeeded} created. Modules: ${modulesSeeded} created. Lessons: ${lessonsSeeded} created.`
  )

  // ─── FAQ Groups ──────────────────────────────────────────────────────────
  const FAQ_GROUPS = [
    {
      title: 'Homepage',
      slug: 'homepage',
      items: [
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
        {
          question: 'Who writes the research?',
          answer:
            'Our team includes former institutional analysts, on-chain researchers, and DeFi-native traders with a combined 30+ years in traditional and crypto markets.',
        },
        {
          question: 'Can I cancel anytime?',
          answer:
            'Yes. Cancel before your next billing cycle and you will retain access until the current period ends. No questions asked.',
        },
      ],
    },
    {
      title: 'Education',
      slug: 'education',
      items: [
        {
          question: 'Is the Academy for beginners?',
          answer:
            'Yes. Our curriculum is structured from foundational concepts to advanced strategies. Start with Crypto Trading 101 and progress at your own pace through increasingly sophisticated material.',
        },
        {
          question: 'What do Pro members get?',
          answer:
            'Pro members unlock the full course library, advanced modules, expert mentorship sessions, on-demand technical analysis, weekly alpha livestreams, and access to the private research archive.',
        },
        {
          question: 'Can I track my progress?',
          answer:
            'Absolutely. Your dashboard tracks completed lessons, current module progress, and overall course completion. Pick up exactly where you left off across any device.',
        },
        {
          question: 'Is the content self-paced?',
          answer:
            'Yes. All courses are entirely self-paced. There are no deadlines or scheduled sessions — learn when it suits you. Pro members also get access to weekly live sessions for real-time Q&A.',
        },
        {
          question: 'How is Crypto School different from the courses?',
          answer:
            'Crypto School is our library of standalone articles, guides, and explainers organized by topic. Trading Courses are structured, sequential curricula with modules and lessons designed to build skills progressively.',
        },
      ],
    },
    {
      title: 'Article',
      slug: 'article',
      items: [
        {
          question: 'How should I use this research?',
          answer:
            'Our reports are educational and informational. They are not financial advice. Always do your own research and consult a financial advisor before making investment decisions.',
        },
        {
          question: 'How often are articles updated?',
          answer:
            'Published articles are updated when material changes occur — price target hits, thesis invalidation, or new on-chain data. Updated articles are marked with a revision date.',
        },
        {
          question: 'Can I share articles with others?',
          answer:
            'Free articles can be shared freely. Pro articles are for subscribers only — sharing paywalled content violates our terms of service.',
        },
        {
          question: 'What does the risk rating mean?',
          answer:
            'Risk ratings (Low, Medium, High, Very High) reflect the volatility and uncertainty of the asset or thesis. Higher risk means larger potential swings in both directions. Position size accordingly.',
        },
      ],
    },
  ]

  let faqSeeded = 0
  for (const group of FAQ_GROUPS) {
    const existing = await payload.find({
      collection: 'faqs',
      where: { slug: { equals: group.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) continue

    await payload.create({
      collection: 'faqs',
      data: {
        title: group.title,
        slug: group.slug,
        items: group.items,
      },
    })
    faqSeeded++
  }
  console.log(
    `[seed] FAQ groups: ${faqSeeded} created, ${FAQ_GROUPS.length - faqSeeded} already existed.`
  )

  console.log('[seed] Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('[seed] Error:', err)
  process.exit(1)
})
