'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'

type Category = {
  id: string | number
  name: string
  slug: string
  description?: string | null
  parent?: { id: string | number } | string | number | null
  weight: number
}

type Props = {
  initialParents: Category[]
  initialChildrenMap: Record<string, Category[]>
  initialGrandchildrenMap: Record<string, Category[]>
}

// ── Inline styles (Payload admin tokens) ─────────────────────────────────────

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    paddingTop: '20px',
    paddingBottom: '20px',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    gap: '12px',
  } as React.CSSProperties,
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--theme-text)',
    margin: 0,
  } as React.CSSProperties,
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    background: 'var(--theme-elevation-150)',
    color: 'var(--theme-text)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    borderRadius: '6px',
    overflow: 'hidden',
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--theme-elevation-600)',
    borderBottom: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-elevation-50)',
  } as React.CSSProperties,
  row: (isDragOver: boolean) =>
    ({
      borderBottom: '1px solid var(--theme-elevation-100)',
      background: isDragOver ? 'var(--theme-elevation-100)' : 'transparent',
      transition: 'background 0.15s ease',
    }) as React.CSSProperties,
  dragHandle: {
    cursor: 'grab',
    padding: '4px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--theme-elevation-400)',
    userSelect: 'none' as const,
    fontSize: '16px',
  } as React.CSSProperties,
  cell: {
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--theme-text)',
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
  nameLink: {
    color: 'var(--theme-text)',
    textDecoration: 'none',
    fontWeight: 500,
  } as React.CSSProperties,
  slug: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 6px',
    fontSize: '14px',
    color: 'var(--theme-elevation-500)',
    transition: 'transform 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 600,
    background: 'var(--theme-elevation-100)',
    color: 'var(--theme-elevation-600)',
    marginLeft: '8px',
  } as React.CSSProperties,
  childIndent: {
    paddingLeft: '40px',
  } as React.CSSProperties,
  saving: {
    fontSize: '12px',
    color: 'var(--theme-elevation-500)',
    fontStyle: 'italic' as const,
  } as React.CSSProperties,
}

// ── Drag handle icon (grip dots) ────────────────────────────────────────────

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  )
}

// ── Chevron icon ─────────────────────────────────────────────────────────────

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <path d="M5 3l4 4-4 4" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CategoriesListClient({
  initialParents,
  initialChildrenMap,
  initialGrandchildrenMap,
}: Props) {
  const [parents, setParents] = useState<Category[]>(initialParents)
  const [childrenMap, setChildrenMap] = useState<Record<string, Category[]>>(initialChildrenMap)
  const [grandchildrenMap, setGrandchildrenMap] =
    useState<Record<string, Category[]>>(initialGrandchildrenMap)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Drag state
  const dragItemRef = useRef<{
    id: string | number
    level: 'parent' | 'child' | 'grandchild'
    parentId?: string
  } | null>(null)
  const [dragOverId, setDragOverId] = useState<string | number | null>(null)

  // ── Toggle expand ──────────────────────────────────────────────────────

  const toggleExpand = useCallback((id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      const key = String(id)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // ── Reorder API call ───────────────────────────────────────────────────

  const saveOrder = useCallback(async (items: Array<{ id: string | number; weight: number }>) => {
    setSaving(true)
    try {
      await fetch('/api/categories-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } finally {
      setSaving(false)
    }
  }, [])

  // ── Drag handlers ──────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string | number, level: 'parent' | 'child', parentId?: string) => {
      dragItemRef.current = { id, level, parentId }
      e.dataTransfer.effectAllowed = 'move'
      // Transparent drag image
      const el = e.currentTarget as HTMLElement
      e.dataTransfer.setDragImage(el, 0, 0)
    },
    []
  )

  const handleDragOver = useCallback((e: React.DragEvent, id: string | number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(id)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverId(null)
  }, [])

  const handleDropParent = useCallback(
    (e: React.DragEvent, targetId: string | number) => {
      e.preventDefault()
      setDragOverId(null)
      const drag = dragItemRef.current
      if (!drag || drag.level !== 'parent' || drag.id === targetId) return

      const newParents = [...parents]
      const fromIdx = newParents.findIndex((p) => p.id === drag.id)
      const toIdx = newParents.findIndex((p) => p.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return

      const [moved] = newParents.splice(fromIdx, 1)
      newParents.splice(toIdx, 0, moved)

      // Assign new weights
      const updates = newParents.map((p, i) => ({ ...p, weight: i }))
      setParents(updates)
      saveOrder(updates.map((p) => ({ id: p.id, weight: p.weight })))
      dragItemRef.current = null
    },
    [parents, saveOrder]
  )

  const handleDropChild = useCallback(
    (e: React.DragEvent, targetId: string | number, parentId: string) => {
      e.preventDefault()
      setDragOverId(null)
      const drag = dragItemRef.current
      if (!drag || drag.level !== 'child' || drag.id === targetId || drag.parentId !== parentId)
        return

      const children = [...(childrenMap[parentId] ?? [])]
      const fromIdx = children.findIndex((c) => c.id === drag.id)
      const toIdx = children.findIndex((c) => c.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return

      const [moved] = children.splice(fromIdx, 1)
      children.splice(toIdx, 0, moved)

      // Assign new weights
      const updates = children.map((c, i) => ({ ...c, weight: i }))
      setChildrenMap((prev) => ({ ...prev, [parentId]: updates }))
      saveOrder(updates.map((c) => ({ id: c.id, weight: c.weight })))
      dragItemRef.current = null
    },
    [childrenMap, saveOrder]
  )

  const handleDropGrandchild = useCallback(
    (e: React.DragEvent, targetId: string | number, childId: string) => {
      e.preventDefault()
      setDragOverId(null)
      const drag = dragItemRef.current
      if (!drag || drag.level !== 'grandchild' || drag.id === targetId || drag.parentId !== childId)
        return

      const grandchildren = [...(grandchildrenMap[childId] ?? [])]
      const fromIdx = grandchildren.findIndex((gc) => gc.id === drag.id)
      const toIdx = grandchildren.findIndex((gc) => gc.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return

      const [moved] = grandchildren.splice(fromIdx, 1)
      grandchildren.splice(toIdx, 0, moved)

      const updates = grandchildren.map((gc, i) => ({ ...gc, weight: i }))
      setGrandchildrenMap((prev) => ({ ...prev, [childId]: updates }))
      saveOrder(updates.map((gc) => ({ id: gc.id, weight: gc.weight })))
      dragItemRef.current = null
    },
    [grandchildrenMap, saveOrder]
  )

  const handleDragEnd = useCallback(() => {
    dragItemRef.current = null
    setDragOverId(null)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="gutter--left gutter--right" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={styles.title}>Categories</h2>
          {saving && <span style={styles.saving}>Saving…</span>}
        </div>
        <Link href="/admin/collections/categories/create" style={styles.createBtn}>
          + Create New
        </Link>
      </div>

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: '40px' }}></th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Slug</th>
            <th style={{ ...styles.th, width: '80px' }}>Weight</th>
            <th style={{ ...styles.th, width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {parents.map((parent) => {
            const pid = String(parent.id)
            const isExpanded = expandedIds.has(pid)
            const children = childrenMap[pid] ?? []

            return (
              <ParentRow
                key={parent.id}
                parent={parent}
                isExpanded={isExpanded}
                childCount={children.length}
                isDragOver={dragOverId === parent.id}
                onToggle={() => toggleExpand(parent.id)}
                onDragStart={(e) => handleDragStart(e, parent.id, 'parent')}
                onDragOver={(e) => handleDragOver(e, parent.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropParent(e, parent.id)}
                onDragEnd={handleDragEnd}
              >
                {isExpanded &&
                  children.map((child) => {
                    const cid = String(child.id)
                    const grandchildren = grandchildrenMap[cid] ?? []
                    const isChildExpanded = expandedIds.has(cid)
                    return (
                      <ChildRow
                        key={child.id}
                        child={child}
                        isDragOver={dragOverId === child.id}
                        grandchildCount={grandchildren.length}
                        isExpanded={isChildExpanded}
                        onToggle={() => toggleExpand(child.id)}
                        onDragStart={(e) => handleDragStart(e, child.id, 'child', pid)}
                        onDragOver={(e) => handleDragOver(e, child.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDropChild(e, child.id, pid)}
                        onDragEnd={handleDragEnd}
                      >
                        {isChildExpanded &&
                          grandchildren.map((gc) => (
                            <GrandchildRow
                              key={gc.id}
                              grandchild={gc}
                              isDragOver={dragOverId === gc.id}
                              onDragStart={(e) => handleDragStart(e, gc.id, 'grandchild', cid)}
                              onDragOver={(e) => handleDragOver(e, gc.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDropGrandchild(e, gc.id, cid)}
                              onDragEnd={handleDragEnd}
                            />
                          ))}
                      </ChildRow>
                    )
                  })}
              </ParentRow>
            )
          })}
        </tbody>
      </table>

      {parents.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--theme-elevation-500)',
            fontSize: '14px',
          }}
        >
          No categories found.{' '}
          <Link href="/admin/collections/categories/create" style={{ color: 'var(--theme-text)' }}>
            Create one
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Parent row ───────────────────────────────────────────────────────────────

function ParentRow({
  parent,
  isExpanded,
  childCount,
  isDragOver,
  onToggle,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  children,
}: {
  parent: Category
  isExpanded: boolean
  childCount: number
  isDragOver: boolean
  onToggle: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  children?: React.ReactNode
}) {
  return (
    <>
      <tr
        style={styles.row(isDragOver)}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <td style={styles.cell}>
          <span style={styles.dragHandle}>
            <GripIcon />
          </span>
        </td>
        <td style={styles.cell}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {childCount > 0 && (
              <button
                type="button"
                style={styles.expandBtn}
                onClick={onToggle}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronIcon expanded={isExpanded} />
              </button>
            )}
            <Link
              href={`/admin/collections/categories/${parent.id}`}
              style={{ ...styles.nameLink, fontWeight: 600 }}
            >
              {parent.name}
            </Link>
            {childCount > 0 && <span style={styles.badge}>{childCount}</span>}
          </div>
        </td>
        <td style={styles.cell}>
          <span style={styles.slug}>{parent.slug}</span>
        </td>
        <td style={styles.cell}>{parent.weight}</td>
        <td style={styles.cell}>
          <Link
            href={`/admin/collections/categories/${parent.id}`}
            style={{
              color: 'var(--theme-elevation-500)',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            Edit
          </Link>
        </td>
      </tr>
      {children}
    </>
  )
}

// ── Child row ────────────────────────────────────────────────────────────────

function ChildRow({
  child,
  isDragOver,
  grandchildCount,
  isExpanded,
  onToggle,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  children,
}: {
  child: Category
  isDragOver: boolean
  grandchildCount: number
  isExpanded: boolean
  onToggle: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
  children?: React.ReactNode
}) {
  return (
    <>
      <tr
        style={{
          ...styles.row(isDragOver),
          background: isDragOver ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-50)',
        }}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
      >
        <td style={styles.cell}>
          <span style={{ ...styles.dragHandle, ...styles.childIndent }}>
            <GripIcon />
          </span>
        </td>
        <td style={styles.cell}>
          <div style={{ paddingLeft: '24px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {grandchildCount > 0 && (
              <button
                type="button"
                style={styles.expandBtn}
                onClick={onToggle}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronIcon expanded={isExpanded} />
              </button>
            )}
            <Link href={`/admin/collections/categories/${child.id}`} style={styles.nameLink}>
              {child.name}
            </Link>
            {grandchildCount > 0 && <span style={styles.badge}>{grandchildCount}</span>}
          </div>
        </td>
        <td style={styles.cell}>
          <span style={styles.slug}>{child.slug}</span>
        </td>
        <td style={styles.cell}>{child.weight}</td>
        <td style={styles.cell}>
          <Link
            href={`/admin/collections/categories/${child.id}`}
            style={{
              color: 'var(--theme-elevation-500)',
              fontSize: '12px',
              textDecoration: 'none',
            }}
          >
            Edit
          </Link>
        </td>
      </tr>
      {children}
    </>
  )
}

// ── Grandchild row ───────────────────────────────────────────────────────────

function GrandchildRow({
  grandchild,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: {
  grandchild: Category
  isDragOver: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onDragEnd: () => void
}) {
  return (
    <tr
      style={{
        ...styles.row(isDragOver),
        background: isDragOver ? 'var(--theme-elevation-100)' : 'var(--theme-elevation-75)',
      }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <td style={styles.cell}>
        <span style={{ ...styles.dragHandle, paddingLeft: '40px' }}>
          <GripIcon />
        </span>
      </td>
      <td style={styles.cell}>
        <div style={{ paddingLeft: '56px' }}>
          <Link href={`/admin/collections/categories/${grandchild.id}`} style={styles.nameLink}>
            {grandchild.name}
          </Link>
        </div>
      </td>
      <td style={styles.cell}>
        <span style={styles.slug}>{grandchild.slug}</span>
      </td>
      <td style={styles.cell}>{grandchild.weight}</td>
      <td style={styles.cell}>
        <Link
          href={`/admin/collections/categories/${grandchild.id}`}
          style={{ color: 'var(--theme-elevation-500)', fontSize: '12px', textDecoration: 'none' }}
        >
          Edit
        </Link>
      </td>
    </tr>
  )
}
