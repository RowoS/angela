'use client'

import { useState, type ReactNode } from 'react'
import { useTicketCategories } from '@/hooks/use-ticket-categories'

interface CategorySelectProps {
  onCategorySelected: (categoryId: string) => void
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-600">*</span>}
    </label>
  )
}

export function CategorySelector({ onCategorySelected }: CategorySelectProps) {
  const { parentCategories, subCategories, selectedParentId, setSelectedParentId, isLoading, error } =
    useTicketCategories()

  // Controlled locally so the visible selection actually clears when the
  // parent changes. The previous version used `defaultValue=""` on the
  // subcategory <select>, which is uncontrolled — React won't re-force
  // that value after mount, so switching categories left a stale
  // subcategory label on screen even though the parent-id logic below
  // was already falling back correctly.
  const [selectedSubId, setSelectedSubId] = useState('')

  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (isLoading) return <div className="animate-pulse text-sm text-slate-400">Loading categories...</div>

  const hasSubcategories = subCategories.length > 0
  const hasParentSelected = Boolean(selectedParentId) 
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <div>
        <FieldLabel required>Category</FieldLabel>
        <select
          id="parentCategory"
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          value={selectedParentId || ''}
          onChange={(e) => {
            const newParentId = e.target.value
            setSelectedParentId(newParentId)
            setSelectedSubId('')
            onCategorySelected(newParentId)
          }}
        >
          <option value="" disabled>Select a primary category...</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.code})
            </option>
          ))}
        </select>
      </div>

<div>
        <FieldLabel>Subcategory</FieldLabel>
        <select
          id="subCategory"
          className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75"
          value={selectedSubId}
          disabled={!hasParentSelected || !hasSubcategories} // Lock if no parent OR no subcategories
          onChange={(e) => {
            const value = e.target.value
            setSelectedSubId(value)
            onCategorySelected(value || selectedParentId || '')
          }}
        >
          <option value="">
            {/* Dynamic placeholder text based on current state */}
            {!hasParentSelected 
              ? 'Select a primary category first' 
              : hasSubcategories 
                ? '-- General / No Subcategory --' 
                : 'No subcategories for this category'}
          </option>
          
          {subCategories.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name} ({sub.code})
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}