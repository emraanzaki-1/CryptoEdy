import React from 'react'
import type { ListViewServerProps } from 'payload'
import CategoriesListClient from './CategoriesListClient'

type Category = {
  id: string | number
  name: string
  slug: string
  description?: string | null
  parent?: { id: string | number } | string | number | null
  weight: number
}

export default async function CategoriesListView(props: ListViewServerProps) {
  const { payload } = props

  // Fetch all categories sorted by weight (collection defaultSort = 'weight')
  const result = await payload.find({
    collection: 'categories',
    sort: 'weight',
    limit: 200,
    depth: 0,
  })

  const allCategories = result.docs as unknown as Category[]

  // Build tree: parents (no parent field) and children grouped by parent ID
  const parents: Category[] = []
  const childrenMap: Record<string, Category[]> = {}

  for (const cat of allCategories) {
    const parentId = typeof cat.parent === 'object' && cat.parent ? cat.parent.id : cat.parent
    if (!parentId) {
      parents.push(cat)
    } else {
      const key = String(parentId)
      if (!childrenMap[key]) childrenMap[key] = []
      childrenMap[key].push(cat)
    }
  }

  return <CategoriesListClient initialParents={parents} initialChildrenMap={childrenMap} />
}
