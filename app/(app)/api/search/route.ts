import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const MAX_LIMIT = 20
const DEFAULT_LIMIT = 6
const MAX_QUERY_LENGTH = 100

let _pool: Pool | null = null
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return _pool
}

export interface SearchResult {
  id: string
  title: string
  highlightedTitle: string
  excerpt: string
  highlightedExcerpt: string
  slug: string
  category: string | null
  publishedAt: string | null
  isProOnly: boolean
  featuredImageUrl: string | null
  featuredImageAlt: string | null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get('q') ?? '').trim()
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  if (q.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Query must be ${MAX_QUERY_LENGTH} characters or fewer` },
      { status: 400 }
    )
  }

  try {
    const pool = getPool()

    const { rows } = await pool.query<{
      id: number
      title: string
      highlighted_title: string
      excerpt: string | null
      highlighted_excerpt: string | null
      slug: string
      category_name: string | null
      published_at: string | null
      is_pro_only: boolean
      featured_image_url: string | null
      featured_image_alt: string | null
    }>(
      `
      SELECT
        p.id,
        p.title,
        ts_headline('english', p.title, plainto_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=50') AS highlighted_title,
        p.excerpt,
        ts_headline('english', COALESCE(p.excerpt, ''), plainto_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=30') AS highlighted_excerpt,
        p.slug,
        c.name AS category_name,
        p.published_at,
        p.is_pro_only,
        m.url AS featured_image_url,
        m.alt AS featured_image_alt
      FROM payload.posts p
      LEFT JOIN payload.categories c ON p.category_id = c.id
      LEFT JOIN payload.media m ON p.featured_image_id = m.id
      WHERE p.search_vector @@ plainto_tsquery('english', $1)
        AND p.status = 'published'
      ORDER BY ts_rank(p.search_vector, plainto_tsquery('english', $1)) DESC
      LIMIT $2
      `,
      [q, limit]
    )

    const results: SearchResult[] = rows.map((row) => ({
      id: String(row.id),
      title: row.title,
      highlightedTitle: row.highlighted_title,
      excerpt: row.excerpt ?? '',
      highlightedExcerpt: row.highlighted_excerpt ?? '',
      slug: row.slug,
      category: row.category_name,
      publishedAt: row.published_at,
      isProOnly: row.is_pro_only ?? false,
      featuredImageUrl: row.featured_image_url,
      featuredImageAlt: row.featured_image_alt,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[Search API]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
