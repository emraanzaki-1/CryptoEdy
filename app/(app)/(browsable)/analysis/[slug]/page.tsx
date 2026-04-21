import { renderCategoryChild, generateCategoryChildMetadata } from '@/lib/categories/categoryHub'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return generateCategoryChildMetadata('analysis', slug)
}

export default async function AnalysisChildPage({ params }: Props) {
  const { slug } = await params
  return renderCategoryChild('analysis', slug, '/analysis')
}
