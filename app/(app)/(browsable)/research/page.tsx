import { renderCategoryHub, generateCategoryHubMetadata } from '@/lib/categories/categoryHub'

export async function generateMetadata() {
  return generateCategoryHubMetadata('research')
}

export default function ResearchPage() {
  return renderCategoryHub('research', '/research')
}
