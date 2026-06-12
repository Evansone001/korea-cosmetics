'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Check, X, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  parent_id?: string
  is_subcategory?: boolean
}

interface CategorySelectorProps {
  value: string
  onChange: (value: string) => void
  categories: Category[]
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  disabled?: boolean
  onCategoryCreated?: () => void
}

export default function CategorySelector({
  value,
  onChange,
  categories,
  placeholder = "Select a category",
  required = false,
  error,
  hint,
  className = "",
  disabled = false,
  onCategoryCreated
}: CategorySelectorProps) {
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateOption, setShowCreateOption] = useState(false)

  // Check if current value exists in categories
  const categoryExists = categories.some(cat => cat.name === value)

  // Filter out the current value to show "Create new" option
  const availableCategories = categories.filter(cat => cat.name !== value)

  const handleCreateCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === newCategoryName.toLowerCase()
    )
    
    if (existingCategory) {
      toast.error(`Category "${existingCategory.name}" already exists`)
      return
    }

    setIsCreating(true)
    try {
      const response = await apiClient.request('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCategoryName.trim()
        })
      })

      if (response && (response as any).data) {
        const newCategory = (response as any).data.category
        onChange(newCategory.name)
        setNewCategoryName('')
        setShowAddCategory(false)
        setShowCreateOption(false)
        toast.success(`Category "${newCategory.name}" created successfully!`)
        // Trigger parent to refresh categories
        if (onCategoryCreated) {
          onCategoryCreated()
        }
      }
    } catch (error: any) {
      console.error('Error creating category:', error)
      if (error.response?.status === 403) {
        toast.error('Only administrators can create categories')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to create category')
      }
    } finally {
      setIsCreating(false)
    }
  }, [newCategoryName, categories, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreateCategory()
    }
  }, [handleCreateCategory])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setNewCategoryName(inputValue)
    
    // Show create option if user types something that doesn't match existing categories
    if (inputValue.trim()) {
      const exactMatch = categories.some(cat => 
        cat.name.toLowerCase() === inputValue.toLowerCase()
      )
      setShowCreateOption(!exactMatch)
    } else {
      setShowCreateOption(false)
    }
  }, [categories])

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Category {required && <span className="text-red-500">*</span>}
        {hint && (
          <div className="text-xs text-slate-500 mb-1">
            💡 {hint}
          </div>
        )}
      </label>

      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
        >
          <option value="">{placeholder}</option>
          {categories.map((cat: Category) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Create new category button */}
        <button
          type="button"
          onClick={() => setShowAddCategory(v => !v)}
          disabled={disabled}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title="Create new category"
          aria-label="Create new category"
        >
          <Plus size={14} strokeWidth={2} />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Inline Create Category Panel */}
      {showAddCategory && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">New Category</span>
            <button
              type="button"
              onClick={() => {
                setShowAddCategory(false)
                setNewCategoryName('')
                setShowCreateOption(false)
              }}
              className="p-0.5 hover:bg-slate-200 rounded"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Category name, then Enter"
              className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreating || !newCategoryName.trim()}
              className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
            >
              {isCreating ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check size={13} />
              )}
              {isCreating ? 'Creating…' : 'Create'}
            </button>
          </div>

          {/* Similar categories warning */}
          {showCreateOption && newCategoryName.trim() && categories.some(cat =>
            cat.name.toLowerCase().includes(newCategoryName.toLowerCase())
          ) && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium mb-1">
                <AlertCircle size={12} />
                Similar categories already exist:
              </div>
              <ul className="ml-4 space-y-0.5">
                {categories
                  .filter(cat => cat.name.toLowerCase().includes(newCategoryName.toLowerCase()))
                  .slice(0, 3)
                  .map(cat => (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onChange(cat.name)
                          setShowAddCategory(false)
                          setNewCategoryName('')
                          setShowCreateOption(false)
                        }}
                        className="text-xs text-amber-700 hover:text-amber-900 hover:underline"
                      >
                        Use "{cat.name}" instead →
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
