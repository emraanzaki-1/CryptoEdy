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
  const event: PostPublishedEvent = {
    postId: post.id as string,
    title: post.title as string,
    category: post.category as string,
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
