import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiTrash2, FiX, FiTag, FiCopy } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function CouponModal({ onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'fixed', is_active: true, min_order_amount: 0 }
  })
  const type = watch('type')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/admin/coupons', data)
      toast.success('Coupon created')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl text-espresso">Create coupon</h2>
          <button onClick={onClose}><FiX size={18} className="text-brand-400" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Coupon code <span className="text-brand-300">(leave blank to auto-generate)</span></label>
            <input {...register('code')} className="input-field uppercase" placeholder="SUMMER20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Discount type</label>
              <select {...register('type')} className="input-field bg-white">
                <option value="fixed">Fixed amount (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
                Value ({type === 'percent' ? '%' : '₹'})
              </label>
              <input type="number" step="1" {...register('value', { required: 'Required', min: 1 })} className="input-field" placeholder={type === 'percent' ? '10' : '100'} />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Min order (₹)</label>
              <input type="number" {...register('min_order_amount')} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Usage limit</label>
              <input type="number" {...register('usage_limit')} className="input-field" placeholder="Unlimited" />
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Expires at</label>
            <input type="date" {...register('expires_at')} className="input-field" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="accent-terracotta w-4 h-4" />
            <span className="text-sm text-brand-600">Active</span>
          </label>

          <div className="flex justify-end gap-3 pt-2 border-t border-brand-100">
            <button type="button" onClick={onClose} className="btn-ghost px-6 py-2.5 text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 text-xs">
              {loading ? 'Creating…' : 'Create coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId]   = useState(null)

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => api.get('/admin/coupons').then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => { toast.success('Coupon deleted'); qc.invalidateQueries(['admin-coupons']); setDeleteId(null) },
  })

  const copy = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`) }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-espresso">Coupons</h1>
          <p className="text-sm text-brand-400 mt-0.5">{coupons?.length || 0} coupons</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2.5 text-xs">
          <FiPlus size={14} /> Create coupon
        </button>
      </div>

      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['Code', 'Type', 'Value', 'Min order', 'Used', 'Expires', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-brand-50">
                  {[...Array(8)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-brand-50 animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : coupons?.map(coupon => {
              const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
              return (
                <tr key={coupon.id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-espresso bg-brand-50 px-2 py-0.5">{coupon.code}</span>
                      <button onClick={() => copy(coupon.code)} className="text-brand-300 hover:text-terracotta transition-colors">
                        <FiCopy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2 py-0.5 ${coupon.type === 'percent' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                      {coupon.type === 'percent' ? 'Percentage' : 'Fixed'}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-terracotta">
                    {coupon.type === 'percent' ? `${coupon.value}%` : `₹${Number(coupon.value).toLocaleString('en-IN')}`}
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-500">
                    {coupon.min_order_amount > 0 ? `₹${Number(coupon.min_order_amount).toLocaleString('en-IN')}` : 'None'}
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-500">
                    {coupon.used_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''}
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-500">
                    {coupon.expires_at
                      ? <span className={expired ? 'text-red-500' : ''}>{new Date(coupon.expires_at).toLocaleDateString('en-IN')}</span>
                      : <span className="text-brand-300">Never</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2.5 py-1 ${!coupon.is_active || expired ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                      {!coupon.is_active ? 'Inactive' : expired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setDeleteId(coupon.id)} className="text-brand-300 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {coupons?.length === 0 && (
          <div className="text-center py-12">
            <FiTag size={32} className="text-brand-200 mx-auto mb-3" />
            <p className="text-brand-400 text-sm">No coupons yet. Create your first one!</p>
          </div>
        )}
      </div>

      {showModal && (
        <CouponModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries(['admin-coupons']) }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl text-espresso mb-2">Delete coupon?</h3>
            <p className="text-sm text-brand-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost py-3 text-xs">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteId)} className="flex-1 bg-red-500 text-white text-xs py-3 tracking-widest uppercase hover:bg-red-600">
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
