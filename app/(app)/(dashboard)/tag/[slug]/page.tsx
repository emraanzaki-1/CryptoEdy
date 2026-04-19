import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TagClient } from '@/components/feed/tag-client'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { auth } from '@/lib/auth'

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const { docs: tagDocs } = await payload.find({
    collection: 'tags',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const tag = tagDocs[0]
  if (!tag) notFound()

  const tagName = (tag as unknown as { name: string }).name

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      tags: { contains: tag.id },
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 50,
    overrideAccess: true,
  })

  const session = await auth()
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <div>
        <Link
          href="/feed"
          className="text-on-surface-variant hover:text-on-surface mb-4 inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to feed
        </Link>
        <h1 className="text-on-surface text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          #{tagName}
        </h1>
      </div>

      <TagClient tagName={tagName} articles={articles} />
    </div>
  )
}
