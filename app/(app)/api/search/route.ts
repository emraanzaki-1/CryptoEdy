import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { getCategoryVisibility } from '@/lib/categories/visibility'
import { rateLimit } from '@/lib/auth/rate-limit'

const MAX_LIMIT = 20
const DEFAULT_LIMIT = 8
const MAX_QUERY_LENGTH = 100

/** Strip all HTML except <mark> tags to prevent XSS from ts_headline output */
function sanitizeHighlight(html: string): string {
  return html
    .replace(/<mark>/gi, '\x00MARK_OPEN\x00')
    .replace(/<\/mark>/gi, '\x00MARK_CLOSE\x00')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\x00MARK_OPEN\x00/g, '<mark>')
    .replace(/\x00MARK_CLOSE\x00/g, '</mark>')
}

export type SearchResultType = 'post' | 'course' | 'lesson'

export interface SearchResult {
  id: string
  type: SearchResultType
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
  /** Course slug — present on lessons for routing to /learn/courses/[courseSlug]/[lessonSlug] */
  courseSlug: string | null
  /** Difficulty level — present on courses */
  difficulty: string | null
  /** Whether lesson is free preview — present on lessons */
  isFreePreview: boolean | null
}

export async function GET(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 30, windowSec: 60 })
  if (blocked) return blocked

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
    const pool = getPool() // shared singleton — no duplicate connections
    const visibility = await getCategoryVisibility()
    const disabledIds = visibility.disabledIds.map(Number).filter((n) => !isNaN(n))

    // Build disabled category clause for posts
    const disabledClause =
      disabledIds.length > 0
        ? `AND p.category_id NOT IN (${disabledIds.map((_, i) => `$${i + 3}`).join(', ')})`
        : ''
    const postsParams = [q, limit, ...disabledIds]

    // --- Posts ---
    const postsQuery = pool.query<{
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
      rank: number
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
        m.alt AS featured_image_alt,
        ts_rank(p.search_vector, plainto_tsquery('english', $1)) AS rank
      FROM payload.posts p
      LEFT JOIN payload.categories c ON p.category_id = c.id
      LEFT JOIN payload.media m ON p.featured_image_id = m.id
      WHERE p.search_vector @@ plainto_tsquery('english', $1)
        AND p.status = 'published'
        ${disabledClause}
      ORDER BY rank DESC
      LIMIT $2
      `,
      postsParams
    )

    // --- Courses ---
    const coursesQuery = pool.query<{
      id: number
      title: string
      highlighted_title: string
      excerpt: string | null
      highlighted_excerpt: string | null
      slug: string
      is_pro_only: boolean
      difficulty: string | null
      cover_image_url: string | null
      cover_image_alt: string | null
      rank: number
    }>(
      `
      SELECT
        co.id,
        co.title,
        ts_headline('english', co.title, plainto_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=50') AS highlighted_title,
        co.excerpt,
        ts_headline('english', COALESCE(co.excerpt, ''), plainto_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=30') AS highlighted_excerpt,
        co.slug,
        co.is_pro_only,
        co.difficulty,
        m.url AS cover_image_url,
        m.alt AS cover_image_alt,
        ts_rank(co.search_vector, plainto_tsquery('english', $1)) AS rank
      FROM payload.courses co
      LEFT JOIN payload.media m ON co.cover_image_id = m.id
      WHERE co.search_vector @@ plainto_tsquery('english', $1)
        AND co.status = 'published'
      ORDER BY rank DESC
      LIMIT $2
      `,
      [q, limit]
    )

    // --- Lessons (join through modules → courses to get courseSlug) ---
    const lessonsQuery = pool.query<{
      id: number
      title: string
      highlighted_title: string
      slug: string
      is_free_preview: boolean
      course_slug: string | null
      course_is_pro_only: boolean
      rank: number
    }>(
      `
      SELECT
        l.id,
        l.title,
        ts_headline('english', l.title, plainto_tsquery('english', $1),
          'StartSel=<mark>, StopSel=</mark>, MaxFragments=1, MaxWords=50') AS highlighted_title,
        l.slug,
        l.is_free_preview,
        co.slug AS course_slug,
        co.is_pro_only AS course_is_pro_only,
        ts_rank(l.search_vector, plainto_tsquery('english', $1)) AS rank
      FROM payload.lessons l
      JOIN payload.modules mo ON l.module_id = mo.id
      JOIN payload.courses co ON mo.course_id = co.id
      WHERE l.search_vector @@ plainto_tsquery('english', $1)
        AND l.status = 'published'
        AND co.status = 'published'
      ORDER BY rank DESC
      LIMIT $2
      `,
      [q, limit]
    )

    const [postsResult, coursesResult, lessonsResult] = await Promise.all([
      postsQuery,
      coursesQuery,
      lessonsQuery,
    ])

    const postResults: SearchResult[] = postsResult.rows.map((row) => ({
      id: String(row.id),
      type: 'post' as const,
      title: row.title,
      highlightedTitle: sanitizeHighlight(row.highlighted_title),
      excerpt: row.excerpt ?? '',
      highlightedExcerpt: sanitizeHighlight(row.highlighted_excerpt ?? ''),
      slug: row.slug,
      category: row.category_name,
      publishedAt: row.published_at,
      isProOnly: row.is_pro_only ?? false,
      featuredImageUrl: row.featured_image_url,
      featuredImageAlt: row.featured_image_alt,
      courseSlug: null,
      difficulty: null,
      isFreePreview: null,
    }))

    const courseResults: SearchResult[] = coursesResult.rows.map((row) => ({
      id: String(row.id),
      type: 'course' as const,
      title: row.title,
      highlightedTitle: sanitizeHighlight(row.highlighted_title),
      excerpt: row.excerpt ?? '',
      highlightedExcerpt: sanitizeHighlight(row.highlighted_excerpt ?? ''),
      slug: row.slug,
      category: null,
      publishedAt: null,
      isProOnly: row.is_pro_only ?? false,
      featuredImageUrl: row.cover_image_url,
      featuredImageAlt: row.cover_image_alt,
      courseSlug: null,
      difficulty: row.difficulty,
      isFreePreview: null,
    }))

    const lessonResults: SearchResult[] = lessonsResult.rows.map((row) => ({
      id: String(row.id),
      type: 'lesson' as const,
      title: row.title,
      highlightedTitle: sanitizeHighlight(row.highlighted_title),
      excerpt: '',
      highlightedExcerpt: '',
      slug: row.slug,
      category: null,
      publishedAt: null,
      isProOnly: row.course_is_pro_only ?? false,
      featuredImageUrl: null,
      featuredImageAlt: null,
      courseSlug: row.course_slug,
      difficulty: null,
      isFreePreview: row.is_free_preview ?? false,
    }))

    // Combine and sort all results by rank (flat ranking — most relevant first)
    const allWithRank = [
      ...postsResult.rows.map((r, i) => ({ rank: r.rank, result: postResults[i] })),
      ...coursesResult.rows.map((r, i) => ({ rank: r.rank, result: courseResults[i] })),
      ...lessonsResult.rows.map((r, i) => ({ rank: r.rank, result: lessonResults[i] })),
    ]
    allWithRank.sort((a, b) => b.rank - a.rank)

    const results = allWithRank.slice(0, limit).map((item) => item.result)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('[Search API]', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
