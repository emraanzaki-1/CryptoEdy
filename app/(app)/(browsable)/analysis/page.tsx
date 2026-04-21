import { renderCategoryHub, generateCategoryHubMetadata } from '@/lib/categories/categoryHub'

export async function generateMetadata() {
  return generateCategoryHubMetadata('analysis')
}

export default function AnalysisPage() {
  return renderCategoryHub('analysis', '/analysis')
}
