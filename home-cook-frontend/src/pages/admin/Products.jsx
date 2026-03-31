import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiToggleLeft, FiToggleRight, FiImage, FiX } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(
    product?.image ? `http://localhost:8000/storage/${product.image}` : null
  )

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      ...product,
      category_id: product.category_id,
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_bestseller: product.is_bestseller,
    } : { is_active: true, is_featured: false, is_new_arrival: false, is_bestseller: false }
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          formData.append(key, typeof val === 'boolean' ? (val ? '1' : '0') : val)
        }
      })
      if (imageFile) formData.append('image', imageFile)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      if (isEdit) {
        // Laravel doesn't support PUT with FormData, use POST + _method spoofing
        formData.append('_method', 'PUT')
        await api.post(`/admin/products/${product.id}`, formData, config)
      } else {
        await api.post('/admin/products', formData, config)
      }
      toast.success(isEdit ? 'Product updated' : 'Product created')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setLoading(false) }
  }

  const F = ({ label, error, children }) => (
    <div>
      <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-white w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl text-espresso">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button onClick={onClose} className="text-brand-400 hover:text-espresso transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* ── Image upload ── */}
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-2">
              Product image
            </label>
            <div className="flex items-start gap-4">
              {/* Preview box */}
              <div className="relative w-28 h-28 flex-shrink-0 border-2 border-dashed border-brand-200 bg-brand-50 overflow-hidden group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={10} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-brand-300">
                    <FiImage size={22} />
                    <span className="text-[10px] mt-1">No image</span>
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="btn-ghost inline-flex items-center gap-2 text-xs py-2.5 px-4">
                    <FiImage size={13} />
                    {imagePreview ? 'Change image' : 'Upload image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-brand-400 mt-2 leading-relaxed">
                  Accepted: JPG, PNG, WebP<br />
                  Max size: 5MB<br />
                  Recommended: 600 × 800 px (portrait)
                </p>
                {isEdit && !imageFile && product?.image && (
                  <p className="text-[11px] text-green-600 mt-1">✓ Current image will be kept if no new file is selected</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Core fields ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <F label="Product name" error={errors.name?.message}>
                <input {...register('name', { required: 'Required' })} className="input-field" placeholder="Enamelled Cast Iron Pot" />
              </F>
            </div>

            <F label="Category" error={errors.category_id?.message}>
              <select {...register('category_id', { required: 'Required' })} className="input-field bg-white">
                <option value="">Select…</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </F>

            <F label="SKU">
              <input {...register('sku')} className="input-field" placeholder="HAC-001" />
            </F>

            <F label="Price (₹)" error={errors.price?.message}>
              <input type="number" step="0.01" {...register('price', { required: 'Required', min: 0 })} className="input-field" placeholder="12499" />
            </F>

            <F label="Sale price (₹)">
              <input type="number" step="0.01" {...register('sale_price')} className="input-field" placeholder="Optional" />
            </F>

            <F label="Stock" error={errors.stock?.message}>
              <input type="number" {...register('stock', { required: 'Required', min: 0 })} className="input-field" placeholder="50" />
            </F>

            <F label="Material">
              <input {...register('material')} className="input-field" placeholder="Cast Iron" />
            </F>

            <F label="Weight">
              <input {...register('weight')} className="input-field" placeholder="3.2 kg" />
            </F>

            <F label="Dimensions">
              <input {...register('dimensions')} className="input-field" placeholder="30 × 20 × 15 cm" />
            </F>

            <div className="col-span-2">
              <F label="Short description">
                <input {...register('short_description')} className="input-field" placeholder="One line summary" />
              </F>
            </div>

            <div className="col-span-2">
              <F label="Full description">
                <textarea rows={3} {...register('description')} className="input-field resize-none" placeholder="Detailed product description…" />
              </F>
            </div>

            {/* Flags */}
            <div className="col-span-2">
              <p className="text-xs tracking-wider uppercase text-brand-500 mb-3">Product flags</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ['is_active',      'Active'],
                  ['is_featured',    'Featured'],
                  ['is_new_arrival', 'New arrival'],
                  ['is_bestseller',  'Bestseller'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register(key)} className="accent-terracotta w-4 h-4" />
                    <span className="text-sm text-brand-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-brand-100">
            <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5 text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 text-xs">
              {loading ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const qc = useQueryClient()
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null)
  const [page,     setPage]     = useState(1)
  const [deleteId, setDeleteId] = useState(null)

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn:  () => api.get('/admin/categories').then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn:  () => api.get('/admin/products', { params: { search, page } }).then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted')
      qc.invalidateQueries(['admin-products'])
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const toggleMut = useMutation({
    mutationFn: (id) => api.patch(`/admin/products/${id}/toggle`),
    onSuccess:  () => qc.invalidateQueries(['admin-products']),
  })

  const onSaved = () => {
    setModal(null)
    qc.invalidateQueries(['admin-products'])
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso">Products</h1>
          <p className="text-sm text-brand-400 mt-0.5">{data?.total || 0} products total</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2 py-2.5 text-xs">
          <FiPlus size={14} /> Add product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-brand-100 p-4 flex gap-3">
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or SKU…"
            className="input-field pl-9 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-brand-50">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-brand-50 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data?.map(p => (
              <tr key={p.id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Product image thumbnail */}
                    <div className="w-12 h-12 bg-brand-100 flex-shrink-0 overflow-hidden border border-brand-100">
                      {p.image ? (
                        <img
                          src={`http://localhost:8000/storage/${p.image}`}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-300">
                          <FiImage size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-espresso text-xs">{p.name}</p>
                      <p className="text-[11px] text-brand-400 font-mono">{p.sku}</p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-brand-600 text-xs">{p.category?.name}</td>

                <td className="px-5 py-4">
                  <span className="text-terracotta font-medium">
                    ₹{Number(p.sale_price || p.price).toLocaleString('en-IN')}
                  </span>
                  {p.sale_price && (
                    <p className="text-[11px] text-brand-300 line-through">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 ${
                    p.stock === 0
                      ? 'bg-red-50 text-red-600'
                      : p.stock <= 10
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                  }`}>
                    {p.stock === 0 ? 'Out of stock' : p.stock <= 10 ? `${p.stock} (low)` : p.stock}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button onClick={() => toggleMut.mutate(p.id)} className="flex items-center gap-1.5 text-xs">
                    {p.is_active
                      ? <><FiToggleRight size={18} className="text-green-500" /><span className="text-green-600">Active</span></>
                      : <><FiToggleLeft  size={18} className="text-brand-300" /><span className="text-brand-400">Inactive</span></>
                    }
                  </button>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setModal(p)}
                      className="text-brand-400 hover:text-terracotta transition-colors"
                      title="Edit product"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="text-brand-400 hover:text-red-500 transition-colors"
                      title="Delete product"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {data?.last_page > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-brand-100">
            {[...Array(data.last_page)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-xs transition-colors ${
                  page === i + 1
                    ? 'bg-terracotta text-cream'
                    : 'border border-brand-200 text-espresso hover:border-terracotta'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal !== null && (
        <ProductModal
          product={Object.keys(modal).length > 0 ? modal : null}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl text-espresso mb-2">Delete product?</h3>
            <p className="text-sm text-brand-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost py-3 text-xs">Cancel</button>
              <button
                onClick={() => deleteMut.mutate(deleteId)}
                className="flex-1 bg-red-500 text-white text-xs py-3 tracking-widest uppercase hover:bg-red-600 transition-colors"
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
