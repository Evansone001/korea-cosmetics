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
  disabled = false
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

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none bg-white ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
        >
          <option value="">{placeholder}</option>
          {availableCategories.map((cat: Category) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
          
          {/* Add "Create new category" option */}
          {!categoryExists && value && (
            <option value={value} className="text-blue-600 font-semibold bg-blue-50">
              📝 "{value}" (New Category)
            </option>
          )}
        </select>

        {/* Create new category button */}
        <button
          type="button"
          onClick={() => setShowAddCategory(true)}
          disabled={disabled}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          title="Create new category"
          aria-label="Create new category"
        >
          <Plus size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Create New Category
              </h3>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryName('')
                  setShowCreateOption(false)
                }}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Show existing similar categories */}
              {showCreateOption && newCategoryName.trim() && (
                <div className="text-sm text-slate-600">
                  {categories.some(cat => 
                    cat.name.toLowerCase().includes(newCategoryName.toLowerCase())
                  ) && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <AlertCircle size={14} />
                        <span className="font-medium">Similar categories exist:</span>
                      </div>
                      <ul className="mt-2 ml-6 space-y-1">
                        {categories
                          .filter(cat => 
                            cat.name.toLowerCase().includes(newCategoryName.toLowerCase())
                          )
                          .slice(0, 3)
                          .map(cat => (
                            <li key={cat.id} className="text-blue-600">
                              • {cat.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateCategory}
                  disabled={isCreating || !newCategoryName.trim()}
                  className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {isCreating ? 'Creating...' : 'Create Category'}
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false)
                    setNewCategoryName('')
                    setShowCreateOption(false)
                  }}
                  disabled={isCreating}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
