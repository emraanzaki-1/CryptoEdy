'use client'

import { useField } from '@payloadcms/ui'
import { useEffect, useState, useCallback } from 'react'

type CategoryOption = {
  id: number | string
  name: string
  slug: string
  parent?: { id: number | string; name: string } | null
}

type Group = {
  label: string
  options: CategoryOption[]
}

/**
 * Custom field component for the `parent` relationship on the Categories collection.
 * Renders a grouped <select> showing top-level parents as optgroup headers,
 * and their children as selectable options under each group.
 * Top-level parents are also directly selectable (for creating L2 children).
 */
export default function GroupedParentSelect() {
  const { value, setValue, showError, errorMessage, path } = useField<number | string>({
    path: 'parent',
  })
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?limit=200&depth=1&sort=weight')
      const data = await res.json()
      const docs: CategoryOption[] = data.docs ?? []

      const parents: CategoryOption[] = []
      const childrenByParent: Record<string, CategoryOption[]> = {}

      for (const cat of docs) {
        if (!cat.parent) {
          parents.push(cat)
        } else {
          const parentId =
            typeof cat.parent === 'object' ? String(cat.parent.id) : String(cat.parent)
          if (!childrenByParent[parentId]) childrenByParent[parentId] = []
          childrenByParent[parentId].push(cat)
        }
      }

      // Build groups: each top-level parent is a group header,
      // with itself + its children as selectable options
      const built: Group[] = []

      // Top-level group — selecting these makes the new category an L2 child
      built.push({
        label: 'Top-Level Parents',
        options: parents,
      })

      // Only Crypto School supports L3 grandchildren
      for (const parent of parents) {
        const children = childrenByParent[String(parent.id)] ?? []
        for (const child of children) {
          if (child.slug !== 'crypto-school') continue
          built.push({
            label: `${parent.name} > ${child.name}`,
            options: [child],
          })
          break
        }
      }

      setGroups(built)
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <div className="field-type relationship" style={{ marginBottom: 0 }}>
      <label className="field-label" htmlFor={`field-${path}`}>
        Parent
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id={`field-${path}`}
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setValue(v ? Number(v) : null)
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            lineHeight: '20px',
            backgroundColor: 'var(--theme-input-bg, var(--theme-elevation-0))',
            color: 'var(--theme-elevation-800)',
            border: `1px solid ${showError ? 'var(--theme-error-500)' : 'var(--theme-elevation-150)'}`,
            borderRadius: '4px',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '12px',
            paddingRight: '32px',
          }}
        >
          <option value="">{loading ? 'Loading…' : '— None (top-level parent) —'}</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {showError && errorMessage && (
        <div style={{ color: 'var(--theme-error-500)', fontSize: '12px', marginTop: '4px' }}>
          {errorMessage}
        </div>
      )}
      <div style={{ color: 'var(--theme-elevation-400)', fontSize: '12px', marginTop: '4px' }}>
        Parent category for hierarchy. Leave empty for top-level. Select a top-level parent to
        create an L2 child, or select an L2 child to create an L3 grandchild.
      </div>
    </div>
  )
}
