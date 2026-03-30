import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiMapPin, FiCreditCard, FiPackage } from 'react-icons/fi'
import api, { PRODUCT_IMAGES } from '../utils/api'

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700', shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600',
}

export default function OrderDetail() {
  const { id } = useParams()
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  })

  if (isLoading) return <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-4"><div className="h-8 bg-brand-100 w-1/3" /><div className="h-40 bg-brand-100" /></div>
  if (!order) return null

  const stepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/orders" className="text-brand-400 hover:text-terracotta transition-colors"><FiArrowLeft size={18} /></Link>
        <div>
          <h1 className="font-display text-2xl text-espresso">Order detail</h1>
          <p className="font-mono text-sm text-brand-400 mt-0.5">{order.order_number}</p>
        </div>
        <span className={`ml-auto status-badge text-[10px] px-3 py-1.5 ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white border border-brand-100 p-6 mb-6">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium z-10
                  ${i <= stepIdx ? 'bg-terracotta text-cream' : 'bg-brand-100 text-brand-400'}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute top-3.5 left-1/2 w-full h-0.5 ${i < stepIdx ? 'bg-terracotta' : 'bg-brand-100'}`} />
                )}
                <span className="text-[9px] tracking-wide text-brand-400 capitalize mt-2 text-center">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-brand-100 p-6 mb-6">
        <h2 className="font-display text-lg text-espresso mb-5 flex items-center gap-2">
          <FiPackage size={16} className="text-terracotta" /> Order items
        </h2>
        <div className="space-y-4">
          {order.items?.map(item => {
            const img = item.product?.image ? `http://localhost:8000/storage/${item.product.image}` : PRODUCT_IMAGES.default
            return (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-brand-50 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-brand-100 flex-shrink-0 overflow-hidden">
                  <img src={img} alt={item.product_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-espresso">{item.product_name}</p>
                  <p className="text-xs text-brand-400 mt-0.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                </div>
                <p className="text-sm font-medium text-terracotta">₹{Number(item.subtotal).toLocaleString('en-IN')}</p>
              </div>
            )
          })}
        </div>
        <div className="border-t border-brand-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm text-brand-600"><span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between text-sm text-brand-600"><span>Shipping</span><span>{order.shipping_amount == 0 ? 'Free' : `₹${Number(order.shipping_amount).toLocaleString('en-IN')}`}</span></div>
          <div className="flex justify-between font-medium text-base pt-2 border-t border-brand-100"><span>Total</span><span className="text-terracotta">₹{Number(order.total).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping */}
        <div className="bg-white border border-brand-100 p-5">
          <h3 className="font-display text-base text-espresso mb-4 flex items-center gap-2">
            <FiMapPin size={14} className="text-terracotta" /> Shipping address
          </h3>
          <p className="text-sm text-brand-600 leading-relaxed">
            {order.shipping_address}<br />
            {order.shipping_city}, {order.shipping_state} – {order.shipping_pincode}<br />
            <span className="text-brand-400">Phone: {order.shipping_phone}</span>
          </p>
        </div>
        {/* Payment */}
        <div className="bg-white border border-brand-100 p-5">
          <h3 className="font-display text-base text-espresso mb-4 flex items-center gap-2">
            <FiCreditCard size={14} className="text-terracotta" /> Payment info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-brand-400">Method</span><span className="capitalize text-espresso">{order.payment_method?.replace('_', ' ')}</span></div>
            <div className="flex justify-between">
              <span className="text-brand-400">Status</span>
              <span className={`capitalize font-medium ${order.payment_status === 'paid' ? 'text-green-600' : order.payment_status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-brand-400">Ordered</span><span className="text-espresso">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
