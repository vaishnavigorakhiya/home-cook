import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiPackage, FiChevronRight } from 'react-icons/fi'
import api from '../utils/api'

const STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped:    'bg-indigo-50 text-indigo-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-600',
  refunded:   'bg-gray-50 text-gray-600',
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders').then(r => r.data),
  })

  if (isLoading) return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-brand-100 animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      <h1 className="font-display text-3xl text-espresso mb-8">My orders</h1>

      {data?.data?.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage size={40} className="text-brand-200 mx-auto mb-4" />
          <p className="font-display text-xl text-brand-300 mb-2">No orders yet</p>
          <p className="text-sm text-brand-400 mb-6">When you place an order, it will appear here.</p>
          <Link to="/shop" className="btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="block bg-white border border-brand-100 p-5 hover:border-terracotta transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FiPackage size={16} className="text-brand-400" />
                  <span className="font-mono text-sm text-espresso">{order.order_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-badge text-[10px] px-2.5 py-1 ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <FiChevronRight size={14} className="text-brand-300 group-hover:text-terracotta transition-colors" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-brand-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="text-xs text-brand-400 mt-0.5 capitalize">{order.payment_method?.replace('_', ' ')} · {order.payment_status}</p>
                </div>
                <p className="text-terracotta font-medium">₹{Number(order.total).toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
