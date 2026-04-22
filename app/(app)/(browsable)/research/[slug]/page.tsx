import { renderCategoryChild, generateCategoryChildMetadata } from '@/lib/categories/categoryHub'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return generateCategoryChildMetadata('research', slug, `research/${slug}`)
}

export default async function ResearchChildPage({ params }: Props) {
  const { slug } = await params
  return renderCategoryChild('research', slug, '/research')
}
