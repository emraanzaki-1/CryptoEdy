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

  // Build tree: parents (no parent field), children grouped by parent ID,
  // and grandchildren grouped by child ID (3-level hierarchy)
  const parents: Category[] = []
  const childrenMap: Record<string, Category[]> = {}
  const grandchildrenMap: Record<string, Category[]> = {}

  // First pass: identify top-level parents
  const parentIds = new Set<string>()
  for (const cat of allCategories) {
    const parentId = typeof cat.parent === 'object' && cat.parent ? cat.parent.id : cat.parent
    if (!parentId) {
      parents.push(cat)
      parentIds.add(String(cat.id))
    }
  }

  // Second pass: separate children (parent is a top-level) from grandchildren (parent is a child)
  for (const cat of allCategories) {
    const parentId = typeof cat.parent === 'object' && cat.parent ? cat.parent.id : cat.parent
    if (!parentId) continue // skip top-level parents

    const key = String(parentId)
    if (parentIds.has(key)) {
      // This is a direct child of a top-level parent
      if (!childrenMap[key]) childrenMap[key] = []
      childrenMap[key].push(cat)
    } else {
      // This is a grandchild (parent is itself a child)
      if (!grandchildrenMap[key]) grandchildrenMap[key] = []
      grandchildrenMap[key].push(cat)
    }
  }

  return (
    <CategoriesListClient
      initialParents={parents}
      initialChildrenMap={childrenMap}
      initialGrandchildrenMap={grandchildrenMap}
    />
  )
}
