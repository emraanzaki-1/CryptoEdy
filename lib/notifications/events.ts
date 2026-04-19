// Sprint 3 stub — full notification engine built in Sprint 10.
// Fires when a Post transitions to published status.

export interface PostPublishedEvent {
  postId: string
  title: string
  category: string
  isProOnly: boolean
  authorId: string
  publishedAt: string
}

export async function onPostPublished(post: Record<string, unknown>): Promise<void> {
  // Resolve category name from populated relationship or string fallback
  let categoryName = 'Unknown'
  if (post.category && typeof post.category === 'object' && post.category !== null) {
    categoryName = ((post.category as Record<string, unknown>).name as string) ?? 'Unknown'
  } else if (typeof post.category === 'string') {
    categoryName = post.category
  }

  const event: PostPublishedEvent = {
    postId: post.id as string,
    title: post.title as string,
    category: categoryName,
    isProOnly: post.isProOnly as boolean,
    authorId:
      typeof post.author === 'object' && post.author !== null
        ? ((post.author as Record<string, unknown>).id as string)
        : (post.author as string),
    publishedAt: post.publishedAt as string,
  }

  // Sprint 10: replace this with real notification dispatch
  console.log('[CryptoEdy] Post published event:', event)
}
