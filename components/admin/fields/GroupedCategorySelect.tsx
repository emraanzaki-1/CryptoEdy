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
 * Custom field component for the `category` relationship field.
 * Renders a native <select> with <optgroup> headers for each parent category,
 * so editors can instantly see which parent a child belongs to.
 * Only leaf categories (children / grandchildren) are selectable.
 */
export default function GroupedCategorySelect() {
  const { value, setValue, showError, errorMessage, path } = useField<
    number | string | { id: number | string }
  >({
    path: 'category',
  })

  // Normalize — value can be a raw ID or a populated object
  const selectedId =
    value && typeof value === 'object' && 'id' in value
      ? String((value as { id: number | string }).id)
      : value != null
        ? String(value)
        : ''
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?limit=200&depth=1&sort=weight')
      const data = await res.json()
      const docs: CategoryOption[] = data.docs ?? []

      // Separate parents (no parent field) and children (have parent)
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

      // Build grouped structure — children grouped under their parent label
      // Also handle grandchildren: if a child itself is a parent of others, nest them
      const built: Group[] = []

      for (const parent of parents) {
        const children = childrenByParent[String(parent.id)] ?? []
        if (children.length === 0) continue

        // Check if any children are themselves parents of grandchildren
        const leafOptions: CategoryOption[] = []
        for (const child of children) {
          const grandchildren = childrenByParent[String(child.id)]
          if (grandchildren && grandchildren.length > 0) {
            // This child has grandchildren — create a sub-group
            built.push({
              label: `${parent.name} › ${child.name}`,
              options: grandchildren,
            })
          } else {
            leafOptions.push(child)
          }
        }

        if (leafOptions.length > 0) {
          built.push({
            label: parent.name,
            options: leafOptions,
          })
        }
      }

      setGroups(built)
    } catch {
      // Silently fail — field still works, just no grouping
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
        Category<span className="required">*</span>
      </label>
      <div
        style={{
          position: 'relative',
        }}
      >
        <select
          id={`field-${path}`}
          value={selectedId}
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
          <option value="">{loading ? 'Loading categories…' : '— Select a category —'}</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {showError && errorMessage && (
        <div
          style={{
            color: 'var(--theme-error-500)',
            fontSize: '12px',
            marginTop: '4px',
          }}
        >
          {errorMessage}
        </div>
      )}
      <div
        style={{
          color: 'var(--theme-elevation-400)',
          fontSize: '12px',
          marginTop: '4px',
        }}
      >
        Primary content category. Determines URL path and feed filter pill.
      </div>
    </div>
  )
}
