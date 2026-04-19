import { getPayload } from 'payload'
import configPromise from '@payload-config'

// ─── Types ────────────────────────────────────────────────────────────────────

type Post = {
  id: string | number
  title?: string | null
  status?: string | null
  publishedAt?: string | null
  author?: { name?: string | null } | string | number | null
  category?: string | null
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getDashboardData() {
  const payload = await getPayload({ config: configPromise })

  // Use Promise.allSettled so a single failing query never crashes the dashboard.
  // Status counts come from a single find() call (avoids enum issues with
  // per-status count() queries when versions.drafts is enabled).
  const [allPostsResult, authorsResult, mediaResult, tagsResult, recentPostsResult] =
    await Promise.allSettled([
      payload.find({ collection: 'posts', limit: 1000, depth: 0, select: { status: true } }),
      payload.count({ collection: 'authors' }),
      payload.count({ collection: 'media' }),
      payload.count({ collection: 'tags' }),
      payload.find({ collection: 'posts', limit: 6, sort: '-updatedAt', depth: 1 }),
    ])

  const allPosts =
    allPostsResult.status === 'fulfilled' ? (allPostsResult.value.docs as Post[]) : []

  const published = allPosts.filter((p) => p.status === 'published').length
  const drafts = allPosts.filter((p) => p.status === 'draft').length
  const inReview = allPosts.filter((p) => p.status === 'review').length

  return {
    stats: {
      published,
      drafts,
      inReview,
      authors: authorsResult.status === 'fulfilled' ? authorsResult.value.totalDocs : 0,
      media: mediaResult.status === 'fulfilled' ? mediaResult.value.totalDocs : 0,
      tags: tagsResult.status === 'fulfilled' ? tagsResult.value.totalDocs : 0,
      total: published + drafts + inReview,
    },
    recentPosts:
      recentPostsResult.status === 'fulfilled' ? (recentPostsResult.value.docs as Post[]) : [],
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  accent,
  href,
}: {
  label: string
  value: number
  accent?: boolean
  href: string
}) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '18px 20px',
        background: 'var(--theme-elevation-100)',
        border: '1px solid var(--theme-border-color)',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'border-color 150ms ease',
      }}
    >
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: accent ? '#f7931a' : 'var(--theme-elevation-800)',
          lineHeight: 1,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--theme-elevation-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {label}
      </div>
    </a>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    published: { label: 'Published', bg: 'rgba(247,147,26,0.15)', color: '#f7931a' },
    draft: {
      label: 'Draft',
      bg: 'var(--theme-elevation-150)',
      color: 'var(--theme-elevation-600)',
    },
    review: { label: 'In Review', bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  }
  const s = map[status] ?? map.draft
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        fontFamily: 'system-ui, sans-serif',
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

function QuickAction({
  href,
  label,
  icon,
  primary,
}: {
  href: string
  label: string
  icon: string
  primary?: boolean
}) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '9px 16px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        textDecoration: 'none',
        border: primary ? 'none' : '1px solid var(--theme-border-color)',
        background: primary ? '#f7931a' : 'var(--theme-elevation-100)',
        color: primary ? '#0d1117' : 'var(--theme-elevation-800)',
        transition: 'opacity 150ms ease',
      }}
    >
      <span style={{ fontSize: '14px' }}>{icon}</span>
      {label}
    </a>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  const { stats, recentPosts } = await getDashboardData()

  const adminBase = '/admin'

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', marginBottom: '32px' }}>
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect
              x="16"
              y="2"
              width="20"
              height="20"
              rx="3"
              transform="rotate(45 16 2)"
              fill="#f7931a"
            />
            <text
              x="16"
              y="20"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#0d1117"
              fontFamily="system-ui,sans-serif"
            >
              ₿
            </text>
          </svg>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--theme-elevation-800)',
                letterSpacing: '-0.02em',
              }}
            >
              Content Studio
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
              CryptoEdy ·{' '}
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <QuickAction
            href={`${adminBase}/collections/posts/create`}
            label="New Post"
            icon="✏️"
            primary
          />
          <QuickAction
            href={`${adminBase}/collections/media/create`}
            label="Upload Media"
            icon="🖼️"
          />
          <QuickAction
            href={`${adminBase}/collections/authors/create`}
            label="New Author"
            icon="👤"
          />
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          label="Published"
          value={stats.published}
          accent
          href={`${adminBase}/collections/posts?where[status][equals]=published`}
        />
        <StatCard
          label="In Review"
          value={stats.inReview}
          href={`${adminBase}/collections/posts?where[status][equals]=review`}
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          href={`${adminBase}/collections/posts?where[status][equals]=draft`}
        />
        <StatCard label="Authors" value={stats.authors} href={`${adminBase}/collections/authors`} />
        <StatCard label="Media" value={stats.media} href={`${adminBase}/collections/media`} />
        <StatCard label="Tags" value={stats.tags} href={`${adminBase}/collections/tags`} />
      </div>

      {/* ── Recent Posts ── */}
      <div
        style={{
          background: 'var(--theme-elevation-100)',
          border: '1px solid var(--theme-border-color)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid var(--theme-border-color)',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
            Recently Updated
          </span>
          <a
            href={`${adminBase}/collections/posts`}
            style={{
              fontSize: '12px',
              color: '#f7931a',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            View all →
          </a>
        </div>

        {/* Rows */}
        {recentPosts.length === 0 ? (
          <div
            style={{
              padding: '32px 20px',
              textAlign: 'center',
              color: 'var(--theme-elevation-400)',
              fontSize: '13px',
            }}
          >
            No posts yet.{' '}
            <a
              href={`${adminBase}/collections/posts/create`}
              style={{ color: '#f7931a', textDecoration: 'none' }}
            >
              Create your first post →
            </a>
          </div>
        ) : (
          recentPosts.map((post, i) => {
            const authorName =
              post.author && typeof post.author === 'object' && 'name' in post.author
                ? post.author.name
                : null

            return (
              <a
                key={post.id}
                href={`${adminBase}/collections/posts/${post.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom:
                    i < recentPosts.length - 1 ? '1px solid var(--theme-border-color)' : 'none',
                  textDecoration: 'none',
                  gap: '12px',
                }}
              >
                {/* Title + meta */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--theme-elevation-800)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {post.title ?? 'Untitled'}
                  </div>
                  {authorName && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--theme-elevation-500)',
                        marginTop: '2px',
                      }}
                    >
                      {authorName}
                      {post.category && (
                        <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                          ·{' '}
                          {typeof post.category === 'object' && post.category !== null
                            ? ((post.category as Record<string, unknown>).name as string)
                            : post.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <StatusBadge status={post.status ?? 'draft'} />
              </a>
            )
          })
        )}
      </div>
    </div>
  )
}
