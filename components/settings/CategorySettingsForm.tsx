'use client'

import { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  createCategory,
  updateCategory,
  deleteCategory
} from '@/lib/actions/category-actions'
import type { TicketPriority, CategoryRow, CategoryWithChildren } from '@/lib/utils/category-utils'
import type { SlaRow } from '@/lib/utils/sla-utils'

const PRIORITIES: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 6,
  border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit',
  outline: 'none', color: '#0f172a', boxSizing: 'border-box',
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
  borderRadius: 7, border: 'none', backgroundColor: '#4f46e5', color: '#fff',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}

interface CategorySettingsFormProps {
  initialCategories: CategoryWithChildren[]
  slas: SlaRow[]
}

export function CategorySettingsForm({ initialCategories, slas }: CategorySettingsFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingRoot, setAddingRoot] = useState(false)

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e8ecf2', overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Categories</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Manage ticket categories, subcategories, and their defaults</div>
        </div>
        <button style={primaryButtonStyle} onClick={() => setAddingRoot((v) => !v)}>
          <Plus size={13} /> {addingRoot ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {addingRoot && (
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbff' }}>
          <CategoryForm
            slas={slas}
            onCancel={() => setAddingRoot(false)}
            onSubmit={async (values) => {
              await createCategory(values)
              setAddingRoot(false)
            }}
          />
        </div>
      )}

      {initialCategories.length === 0 && !addingRoot && (
        <div style={{ padding: '32px 22px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
          No categories yet.
        </div>
      )}

      {initialCategories.map((cat) => (
        <CategoryRowItem
          key={cat.id}
          category={cat}
          slas={slas}
          expanded={expandedId === cat.id}
          onToggleExpand={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
        />
      ))}
    </div>
  )
}

function CategoryRowItem({
  category,
  slas,
  expanded,
  onToggleExpand,
}: {
  category: CategoryWithChildren
  slas: SlaRow[]
  expanded: boolean
  onToggleExpand: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [addingSub, setAddingSub] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const slaName = slas.find((s) => s.id === category.default_sla_id)?.name ?? '—'

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteCategory(category.id)
        setConfirmOpen(false)
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to delete category.')
      }
    })
  }

  if (editing) {
    return (
      <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbff' }}>
        <CategoryForm
          slas={slas}
          initial={category}
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateCategory(category.id, values)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={onToggleExpand}
        style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9', cursor: 'pointer', backgroundColor: expanded ? '#fafbff' : '#fff' }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{category.name}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{category.subcategories.length} subcategories</span>
        <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '2px 9px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
          Default: {category.default_priority}
        </span>
        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{slaName}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
          >
            <Edit2 size={13} />
          </button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger
              render={
                <button
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 4 }}
                >
                  <Trash2 size={13} />
                </button>
              }
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{category.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone
                  {category.subcategories.length > 0 ? ` and removes ${category.subcategories.length} subcategor${category.subcategories.length === 1 ? 'y' : 'ies'} with it` : ''}.
                  Categories still referenced by existing tickets can&apos;t be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                  {isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {expanded && (
        <div style={{ backgroundColor: '#fafbff', padding: '10px 22px 14px 44px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Subcategories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {category.subcategories.map((sub) => (
              <SubcategoryRow key={sub.id} subcategory={sub} slas={slas} parentId={category.id} />
            ))}
          </div>

          {addingSub ? (
            <div style={{ marginTop: 10, padding: 12, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <CategoryForm
                slas={slas}
                compact
                defaultPriority={category.default_priority}
                onCancel={() => setAddingSub(false)}
                onSubmit={async (values) => {
                  await createCategory({ ...values, parent_id: category.id })
                  setAddingSub(false)
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setAddingSub(true)}
              style={{ marginTop: 10, padding: '4px 10px', backgroundColor: '#eef2ff', border: '1px dashed #818cf8', borderRadius: 6, fontSize: 12, color: '#4f46e5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Plus size={11} /> Add Subcategory
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SubcategoryRow({
  subcategory,
  slas,
  parentId,
}: {
  subcategory: CategoryRow
  slas: SlaRow[]
  parentId: string
}) {
  const [editing, setEditing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      try {
        await deleteCategory(subcategory.id)
        setConfirmOpen(false)
      } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Failed to delete subcategory.')
      }
    })
  }

  if (editing) {
    return (
      <div style={{ padding: 12, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}>
        <CategoryForm
          slas={slas}
          initial={subcategory}
          compact
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateCategory(subcategory.id, values)
            setEditing(false)
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, color: '#475569' }}>
        <span style={{ flex: 1 }}>{subcategory.name}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8', fontSize: 11 }}>{subcategory.code}</span>
        <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
          <Edit2 size={11} />
        </button>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger
            render={
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 0, display: 'flex' }}>
                <Trash2 size={11} />
              </button>
            }
          />
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{subcategory.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Subcategories still referenced by existing tickets can&apos;t be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </span>
    </div>
  )
}

// Shared add/edit form for both root categories and subcategories.
// `compact` drops the priority/SLA fields for subcategories, which
// inherit those defaults from the parent rather than setting their own.
function CategoryForm({
  slas,
  initial,
  compact = false,
  defaultPriority,
  onSubmit,
  onCancel,
}: {
  slas: SlaRow[]
  initial?: CategoryRow
  compact?: boolean
  defaultPriority?: TicketPriority
  onSubmit: (values: { name: string; code: string; default_priority: TicketPriority; default_sla_id: string | null }) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [priority, setPriority] = useState<TicketPriority>(initial?.default_priority ?? defaultPriority ?? 'medium')
  const [slaId, setSlaId] = useState(initial?.default_sla_id ?? '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      try {
        await onSubmit({ name, code, default_priority: priority, default_sla_id: slaId || null })
      } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage || 'Failed to save.')
      }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 2 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} style={inputStyle} placeholder="e.g. Hardware" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} disabled={isPending} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} placeholder="e.g. HW" maxLength={10} />
        </div>
      </div>

      {!compact && (
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Default Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} disabled={isPending} style={{ ...inputStyle, cursor: 'pointer' }}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Default SLA</label>
            <select value={slaId} onChange={(e) => setSlaId(e.target.value)} disabled={isPending} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">None</option>
              {slas.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !name.trim() || !code.trim()}
          style={{ padding: '6px 16px', borderRadius: 7, border: 'none', backgroundColor: '#4f46e5', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          style={{ padding: '6px 16px', borderRadius: 7, border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Cancel
        </button>
        {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      </div>
    </div>
  )
}