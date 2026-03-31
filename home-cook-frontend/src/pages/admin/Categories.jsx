import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// ── Image Upload Preview ────────────────────────────────────────────────────
function ImageUpload({ current, onFileChange, onRemove }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setPreview(URL.createObjectURL(file))
    onFileChange(file)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
    onRemove()
  }

  const displaySrc = preview || (current ? `http://localhost:8000/storage/${current}` : null)

  return (
    <div>
      <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
        Category image
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed cursor-pointer transition-colors group
          ${displaySrc ? 'border-brand-200' : 'border-brand-200 hover:border-terracotta'}`}
        style={{ height: 140 }}
      >
        {displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white flex items-center justify-center text-red-500 shadow transition-colors"
            >
              <FiX size={13} />
            </button>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-xs tracking-wider uppercase bg-black/50 px-3 py-1.5 transition-opacity">
                Change image
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-300 group-hover:text-terracotta transition-colors">
            <FiImage size={28} className="mb-2" />
            <span className="text-xs">Click to upload image</span>
            <span className="text-[10px] mt-0.5 text-brand-300">PNG, JPG up to 2MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
function CategoryModal({ category, allCategories, onClose, onSaved }) {
  const isEdit = !!category
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: category
      ? {
          name:        category.name,
          description: category.description || '',
          parent_id:   category.parent_id || '',
          sort_order:  category.sort_order ?? 0,
          is_active:   category.is_active ?? true,
        }
      : { is_active: true, sort_order: 0, parent_id: '' }
  })

  // Filter out this category and its children from parent options
  const parentOptions = (allCategories || []).filter(c => {
    if (!category) return true           // creating: all top-level are valid
    if (c.id === category.id) return false
    if (c.parent_id === category.id) return false // direct children
    return true
  }).filter(c => !c.parent_id) // only show root categories as parent options

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name',        data.name)
      formData.append('description', data.description || '')
      formData.append('sort_order',  data.sort_order  || 0)
      formData.append('is_active',   data.is_active ? '1' : '0')
      if (data.parent_id) formData.append('parent_id', data.parent_id)
      if (imageFile)       formData.append('image', imageFile)
      if (removeImage)     formData.append('remove_image', 'true')

      if (isEdit) {
        formData.append('_method', 'PUT')
        await api.post(`/admin/categories/${category.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.post('/admin/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      toast.success(isEdit ? 'Category updated' : 'Category created')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
      <div className="bg-white w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl text-espresso">
            {isEdit ? 'Edit category' : 'Add category'}
          </h2>
          <button onClick={onClose}><FiX size={18} className="text-brand-400" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Image */}
          <ImageUpload
            current={category?.image || null}
            onFileChange={setImageFile}
            onRemove={() => { setRemoveImage(true); setImageFile(null) }}
          />

          {/* Name */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
              Category name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field"
              placeholder="e.g. Cookware, Stainless Steel"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Parent category */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
              Parent category
              <span className="text-brand-300 normal-case tracking-normal ml-1">(leave blank for top-level)</span>
            </label>
            <select {...register('parent_id')} className="input-field bg-white">
              <option value="">— Top-level category —</option>
              {parentOptions.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-[11px] text-brand-400 mt-1">
              e.g. "Stainless Steel" under parent "Cookware"
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              {...register('description')}
              className="input-field resize-none"
              placeholder="Brief description of this category…"
            />
          </div>

          {/* Sort order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
                Sort order
              </label>
              <input
                type="number"
                {...register('sort_order')}
                className="input-field"
                defaultValue={0}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="accent-terracotta w-4 h-4"
                />
                <span className="text-sm text-brand-600">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-brand-100">
            <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 text-xs">
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Category row (supports sub-row indent) ───────────────────────────────────
function CategoryRow({ cat, onEdit, onDelete, depth = 0, expandedIds, toggleExpand }) {
  const hasChildren = cat.children && cat.children.length > 0
  const isExpanded  = expandedIds.has(cat.id)

  return (
    <>
      <tr className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3" style={{ paddingLeft: depth * 20 }}>
            {/* Expand/collapse toggle */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(cat.id)}
                className="text-brand-300 hover:text-terracotta transition-colors flex-shrink-0"
              >
                {isExpanded
                  ? <FiChevronDown size={13} />
                  : <FiChevronRight size={13} />}
              </button>
            ) : (
              <span className="w-[13px] flex-shrink-0" />
            )}

            {/* Image */}
            <div className="w-10 h-10 bg-brand-100 flex-shrink-0 overflow-hidden">
              {cat.image
                ? <img
                    src={`http://localhost:8000/storage/${cat.image}`}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                : <div className="w-full h-full flex items-center justify-center">
                    <FiImage size={14} className="text-brand-300" />
                  </div>
              }
            </div>

            <div>
              <p className={`font-medium text-espresso text-xs ${depth > 0 ? 'text-brand-700' : ''}`}>
                {cat.name}
              </p>
              {cat.description && (
                <p className="text-[11px] text-brand-400 mt-0.5 truncate max-w-48">
                  {cat.description}
                </p>
              )}
            </div>
          </div>
        </td>

        <td className="px-5 py-4 font-mono text-xs text-brand-400">{cat.slug}</td>

        <td className="px-5 py-4 text-xs text-brand-500">
          {depth === 0 && cat.parent
            ? <span className="text-brand-300">—</span>
            : depth === 0
              ? <span className="text-[10px] bg-brand-100 text-brand-600 px-2 py-0.5">Root</span>
              : <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5">Sub</span>
          }
        </td>

        <td className="px-5 py-4 text-xs text-brand-500">
          {cat.products_count}
          {hasChildren && (
            <span className="text-brand-300 ml-1">
              +{cat.children.reduce((s, c) => s + (c.products_count || 0), 0)} sub
            </span>
          )}
        </td>

        <td className="px-5 py-4 text-xs text-brand-400">{cat.sort_order}</td>

        <td className="px-5 py-4">
          <span className={`text-[10px] px-2.5 py-1 ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-400'}`}>
            {cat.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>

        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit(cat)}
              className="text-brand-400 hover:text-terracotta transition-colors"
              title="Edit"
            >
              <FiEdit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="text-brand-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Render children when expanded */}
      {hasChildren && isExpanded && cat.children.map(child => (
        <CategoryRow
          key={child.id}
          cat={child}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
        />
      ))}
    </>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const qc = useQueryClient()
  const [modal,      setModal]      = useState(null)   // null = closed, {} = new, {...} = edit
  const [deleteId,   setDeleteId]   = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories-full'],
    queryFn: () => api.get('/admin/categories').then(r => r.data),
  })

  // Build tree: top-level items with children attached
  const rootCategories = (categories || [])
    .filter(c => !c.parent_id)
    .map(c => ({
      ...c,
      children: (categories || []).filter(ch => ch.parent_id === c.id),
    }))

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const expandAll = () =>
    setExpandedIds(new Set(rootCategories.filter(c => c.children?.length).map(c => c.id)))

  const collapseAll = () => setExpandedIds(new Set())

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted')
      qc.invalidateQueries(['admin-categories-full'])
      qc.invalidateQueries(['admin-categories'])
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const onSaved = () => {
    setModal(null)
    qc.invalidateQueries(['admin-categories-full'])
    qc.invalidateQueries(['admin-categories'])
    qc.invalidateQueries(['categories'])
  }

  const totalSubcategories = (categories || []).filter(c => c.parent_id).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso">Categories</h1>
          <p className="text-sm text-brand-400 mt-0.5">
            {rootCategories.length} top-level
            {totalSubcategories > 0 && ` · ${totalSubcategories} subcategories`}
          </p>
        </div>
        <button
          onClick={() => setModal({})}
          className="btn-primary flex items-center gap-2 py-2.5 text-xs"
        >
          <FiPlus size={14} /> Add category
        </button>
      </div>

      {/* Expand/collapse controls */}
      {rootCategories.some(c => c.children?.length > 0) && (
        <div className="flex gap-3 text-xs">
          <button onClick={expandAll}   className="text-terracotta hover:underline">Expand all</button>
          <span className="text-brand-200">|</span>
          <button onClick={collapseAll} className="text-terracotta hover:underline">Collapse all</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['Category', 'Slug', 'Type', 'Products', 'Order', 'Status', 'Actions'].map(h => (
                <th
                  key={h}
                  className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-brand-50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-brand-50 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : rootCategories.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-brand-400 text-sm">
                      No categories yet. Add your first one!
                    </td>
                  </tr>
                )
                : rootCategories.map(cat => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    onEdit={setModal}
                    onDelete={setDeleteId}
                    depth={0}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <CategoryModal
          category={modal && Object.keys(modal).length > 0 ? modal : null}
          allCategories={categories || []}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl text-espresso mb-2">Delete category?</h3>
            <p className="text-sm text-brand-400 mb-6">
              Subcategories will be promoted to the same level. Products in this
              category will not be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 btn-ghost py-3 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
                className="flex-1 bg-red-500 text-white text-xs py-3 tracking-widest uppercase hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
