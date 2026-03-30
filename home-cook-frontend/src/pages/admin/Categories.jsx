import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = !!category
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: category || { is_active: true, sort_order: 0 }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) await api.put(`/admin/categories/${category.id}`, data)
      else await api.post('/admin/categories', data)
      toast.success(isEdit ? 'Category updated' : 'Category created')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl text-espresso">{isEdit ? 'Edit category' : 'Add category'}</h2>
          <button onClick={onClose}><FiX size={18} className="text-brand-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Category name</label>
            <input {...register('name', { required: 'Name is required' })} className="input-field" placeholder="Cookware" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Description</label>
            <textarea rows={3} {...register('description')} className="input-field resize-none" placeholder="Brief description…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Sort order</label>
              <input type="number" {...register('sort_order')} className="input-field" defaultValue={0} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_active')} className="accent-terracotta w-4 h-4" />
                <span className="text-sm text-brand-600">Active</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-brand-100">
            <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5 text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 text-xs">
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories-full'],
    queryFn: () => api.get('/admin/categories').then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => { toast.success('Category deleted'); qc.invalidateQueries(['admin-categories-full']); setDeleteId(null) },
    onError: () => toast.error('Delete failed'),
  })

  const onSaved = () => { setModal(null); qc.invalidateQueries(['admin-categories-full']); qc.invalidateQueries(['admin-categories']) }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso">Categories</h1>
          <p className="text-sm text-brand-400 mt-0.5">{categories?.length || 0} categories</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2 py-2.5 text-xs">
          <FiPlus size={14} /> Add category
        </button>
      </div>

      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['Category', 'Slug', 'Products', 'Order', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-brand-50">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-brand-50 animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : categories?.map(cat => (
              <tr key={cat.id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div>
                    <p className="text-xs font-medium text-espresso">{cat.name}</p>
                    {cat.description && <p className="text-[11px] text-brand-400 mt-0.5 truncate max-w-48">{cat.description}</p>}
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-brand-400">{cat.slug}</td>
                <td className="px-5 py-4 text-xs text-brand-500">{cat.products_count}</td>
                <td className="px-5 py-4 text-xs text-brand-400">{cat.sort_order}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] px-2.5 py-1 ${cat.is_active ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-400'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setModal(cat)} className="text-brand-400 hover:text-terracotta transition-colors">
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteId(cat.id)} className="text-brand-400 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <CategoryModal
          category={Object.keys(modal).length > 0 ? modal : null}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl text-espresso mb-2">Delete category?</h3>
            <p className="text-sm text-brand-400 mb-6">All products in this category will also be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost py-3 text-xs">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteId)} className="flex-1 bg-red-500 text-white text-xs py-3 tracking-widest uppercase hover:bg-red-600">
                {deleteMut.isLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
