import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi'
import api from '../utils/api'

export default function OrderSuccess() {
  const { id } = useParams()

  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FiCheck size={36} className="text-green-600" />
      </div>

      <h1 className="font-display text-3xl text-espresso mb-2">Order placed!</h1>
      <p className="text-brand-400 text-sm mb-8">
        Thank you for your order. We'll send you a confirmation soon.
      </p>

      {order && (
        <div className="bg-white border border-brand-100 p-6 text-left mb-8">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-brand-100">
            <div>
              <p className="text-xs text-brand-400">Order number</p>
              <p className="font-mono text-sm font-medium text-espresso">{order.order_number}</p>
            </div>
            <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200">
              {order.status}
            </span>
          </div>
          <div className="space-y-3 mb-4">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-brand-600">{item.product_name} × {item.quantity}</span>
                <span className="text-espresso">₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-100 pt-3 flex justify-between font-medium">
            <span>Total paid</span>
            <span className="text-terracotta">₹{Number(order.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Link to="/orders" className="btn-primary flex items-center gap-2">
          <FiPackage size={15} /> View my orders
        </Link>
        <Link to="/shop" className="btn-ghost flex items-center gap-2">
          Continue shopping <FiArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
