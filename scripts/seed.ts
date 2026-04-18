/**
 * CryptoEdy seed script — Sprint 3
 *
 * Usage:
 *   npm run seed          — seed a clean database (skips if already seeded)
 *   npm run seed:reset    — drop all content and re-seed (dev only)
 *
 * Run after: npm run db:migrate
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { getDb } from '../lib/db'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateReferralCode } from '../lib/auth/referral'

const IS_RESET = process.argv.includes('--reset')

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const CATEGORIES = [
  // Research
  {
    name: 'Top Picks',
    slug: 'top-picks',
    type: 'research' as const,
    description: 'High-conviction token picks with entry/exit targets and risk ratings.',
  },
  {
    name: 'Deep Dives',
    slug: 'deep-dives',
    type: 'research' as const,
    description: 'In-depth protocol and project research reports.',
  },
  {
    name: 'Passive Income',
    slug: 'passive-income',
    type: 'research' as const,
    description: 'Staking, yield farming, and passive crypto income strategies.',
  },
  {
    name: 'Airdrop Reports',
    slug: 'airdrop-reports',
    type: 'research' as const,
    description: 'Curated guides for upcoming and active airdrop opportunities.',
  },
  {
    name: 'Memecoins',
    slug: 'memecoins',
    type: 'research' as const,
    description: 'Analysis and picks in the memecoin sector.',
  },
  // Analysis
  {
    name: 'Market Updates',
    slug: 'market-updates',
    type: 'analysis' as const,
    description: 'Regular market condition updates and commentary.',
  },
  {
    name: 'Market Direction',
    slug: 'market-direction',
    type: 'analysis' as const,
    description: 'Macro trend analysis and liquidity flow dashboards.',
  },
  {
    name: 'Market Pulse',
    slug: 'market-pulse',
    type: 'analysis' as const,
    description: 'On-chain data and sentiment indicators.',
  },
  {
    name: 'Livestreams',
    slug: 'livestreams',
    type: 'analysis' as const,
    description: 'Weekly interactive sessions and Q&A recordings.',
  },
  // Education
  {
    name: 'Courses',
    slug: 'courses',
    type: 'education' as const,
    description: 'Structured learning paths from crypto basics to advanced trading.',
  },
  {
    name: 'Resource Hub',
    slug: 'resource-hub',
    type: 'education' as const,
    description: 'Tutorials, guides, and curated resources.',
  },
  {
    name: 'Glossary',
    slug: 'glossary',
    type: 'education' as const,
    description: 'Plain-language definitions of crypto and DeFi terms.',
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
    password: 'Admin123!',
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
    password: 'Admin123!',
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
    for (const col of ['posts', 'categories', 'tags', 'authors'] as const) {
      const existing = await payload.find({ collection: col, limit: 1000, pagination: false })
      for (const doc of existing.docs) {
        await payload.delete({ collection: col, id: doc.id })
      }
    }
    // Reset app users in Drizzle
    await getDb().delete(users)
    console.log('[seed] Reset complete.')
  }

  // ---- Categories ----
  console.log('[seed] Seeding categories...')
  const categoryIdMap: Record<string, string> = {}
  for (const cat of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      categoryIdMap[cat.slug] = existing.docs[0].id as string
      continue
    }
    const created = await payload.create({ collection: 'categories', data: cat })
    categoryIdMap[cat.slug] = created.id as string
  }
  console.log(`[seed] Categories: ${Object.keys(categoryIdMap).length} ready.`)

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
      category: 'top-picks',
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
      category: 'top-picks',
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
      category: 'top-picks',
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
      category: 'deep-dives',
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
      category: 'deep-dives',
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
      category: 'market-updates',
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
      category: 'market-updates',
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
      category: 'market-direction',
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
    // 1 × Education / Crypto School (free)
    {
      title: 'Understanding DeFi: How Automated Market Makers Work',
      slug: 'understanding-amm-defi-basics',
      excerpt:
        'Automated Market Makers replaced traditional order books in DeFi. This guide explains exactly how AMMs work, why they sometimes cause losses, and how to use them safely.',
      category: 'courses',
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
      category: 'airdrop-reports',
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
      },
    })
    seededCount++
  }
  console.log(
    `[seed] Posts: ${seededCount} created, ${POSTS.length - seededCount} already existed.`
  )

  console.log('[seed] Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error('[seed] Error:', err)
  process.exit(1)
})
