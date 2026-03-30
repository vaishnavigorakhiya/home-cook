import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiEye, FiX } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:'bg-amber-50 text-amber-700', confirmed:'bg-blue-50 text-blue-700',
  processing:'bg-purple-50 text-purple-700', shipped:'bg-indigo-50 text-indigo-700',
  delivered:'bg-green-50 text-green-700', cancelled:'bg-red-50 text-red-600', refunded:'bg-gray-50 text-gray-600',
}
const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const PAYMENT_STATUSES = ['pending','paid','failed','refunded']

function OrderDetailModal({ orderId, onClose }) {
  const qc = useQueryClient()
  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => api.get(`/admin/orders/${orderId}`).then(r => r.data),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/admin/orders/${id}/status`, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['admin-orders']); qc.invalidateQueries(['admin-order', orderId]) },
  })
  const payMut = useMutation({
    mutationFn: ({ id, payment_status }) => api.patch(`/admin/orders/${id}/payment`, { payment_status }),
    onSuccess: () => { toast.success('Payment status updated'); qc.invalidateQueries(['admin-orders']); qc.invalidateQueries(['admin-order', orderId]) },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-white w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-display text-xl text-espresso">Order detail</h2>
          <button onClick={onClose}><FiX size={18} className="text-brand-400" /></button>
        </div>
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-4"><div className="h-6 bg-brand-100 w-1/2" /><div className="h-32 bg-brand-100" /></div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-brand-400 mb-1">Order number</p>
                <p className="font-mono font-medium text-espresso">{order?.order_number}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400 mb-1">Customer</p>
                <p className="font-medium text-espresso">{order?.user?.name}</p>
                <p className="text-xs text-brand-400">{order?.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-brand-400 mb-1">Order status</p>
                <select value={order?.status} onChange={e => statusMut.mutate({ id: order.id, status: e.target.value })}
                  className="input-field py-2 text-xs bg-white">
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-brand-400 mb-1">Payment status</p>
                <select value={order?.payment_status} onChange={e => payMut.mutate({ id: order.id, payment_status: e.target.value })}
                  className="input-field py-2 text-xs bg-white">
                  {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs tracking-widest uppercase text-brand-400 mb-3">Items</p>
              <div className="space-y-2">
                {order?.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-brand-50">
                    <span className="text-brand-600">{item.product_name} <span className="text-brand-400">×{item.quantity}</span></span>
                    <span className="text-espresso font-medium">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-brand-500"><span>Subtotal</span><span>₹{Number(order?.subtotal).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-brand-500"><span>Shipping</span><span>{order?.shipping_amount == 0 ? 'Free' : `₹${Number(order?.shipping_amount).toLocaleString('en-IN')}`}</span></div>
                <div className="flex justify-between font-medium text-base pt-1 border-t border-brand-100"><span>Total</span><span className="text-terracotta">₹{Number(order?.total).toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-xs tracking-widest uppercase text-brand-400 mb-2">Shipping address</p>
              <p className="text-sm text-brand-600">{order?.shipping_address}, {order?.shipping_city}, {order?.shipping_state} – {order?.shipping_pincode}</p>
              <p className="text-xs text-brand-400 mt-1">Phone: {order?.shipping_phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)
  const [viewId, setViewId]   = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', search, status, page],
    queryFn: () => api.get('/admin/orders', { params: { search, status, page } }).then(r => r.data),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl text-espresso">Orders</h1>
        <p className="text-sm text-brand-400 mt-0.5">{data?.total || 0} orders total</p>
      </div>

      <div className="bg-white border border-brand-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Order number or customer…" className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field py-2.5 text-sm w-44 bg-white">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['Order', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-brand-50">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-brand-50 animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : data?.data?.map(order => (
              <tr key={order.id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs text-espresso">{order.order_number}</td>
                <td className="px-5 py-4">
                  <p className="text-xs font-medium text-espresso">{order.user?.name}</p>
                  <p className="text-[11px] text-brand-400">{order.user?.email}</p>
                </td>
                <td className="px-5 py-4 text-xs text-brand-400 whitespace-nowrap">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4 text-terracotta font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] px-2 py-0.5 capitalize ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : order.payment_status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] px-2.5 py-1 capitalize ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => setViewId(order.id)} className="text-brand-400 hover:text-terracotta transition-colors">
                    <FiEye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.last_page > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-brand-100">
            {[...Array(data.last_page)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-xs transition-colors ${page === i + 1 ? 'bg-terracotta text-cream' : 'border border-brand-200 text-espresso hover:border-terracotta'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewId && <OrderDetailModal orderId={viewId} onClose={() => setViewId(null)} />}
    </div>
  )
}
