import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiTrendingUp, FiShoppingBag, FiPackage, FiUsers, FiAlertTriangle, FiChevronRight } from 'react-icons/fi'
import api from '../../utils/api'

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700', shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700', cancelled: 'bg-red-50 text-red-600',
}

function StatCard({ icon: Icon, label, value, sub, color = 'terracotta' }) {
  return (
    <div className="bg-white border border-brand-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 flex items-center justify-center bg-brand-50`}>
          <Icon size={18} className="text-terracotta" />
        </div>
        {sub && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5">{sub}</span>}
      </div>
      <p className="font-display text-2xl text-espresso mb-1">{value}</p>
      <p className="text-xs text-brand-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data),
  })

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-brand-100" />)}
      </div>
      <div className="h-64 bg-brand-100" />
    </div>
  )

  const { stats, recent_orders, top_products, order_status_counts, low_stock_products } = data || {}

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page title */}
      <div>
        <h1 className="font-display text-2xl text-espresso">Dashboard</h1>
        <p className="text-sm text-brand-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FiTrendingUp} label="Total revenue" value={`₹${Number(stats?.total_revenue || 0).toLocaleString('en-IN')}`} sub={`↑ ${stats?.monthly_growth}%`} />
        <StatCard icon={FiShoppingBag} label="Total orders" value={stats?.total_orders?.toLocaleString('en-IN')} />
        <StatCard icon={FiPackage} label="Products" value={stats?.total_products?.toLocaleString('en-IN')} />
        <StatCard icon={FiUsers} label="Customers" value={stats?.total_users?.toLocaleString('en-IN')} />
      </div>

      {/* Order status breakdown */}
      {order_status_counts && (
        <div className="bg-white border border-brand-100 p-6">
          <h2 className="font-display text-lg text-espresso mb-5">Orders by status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(order_status_counts).map(([status, count]) => (
              <div key={status} className={`p-3 text-center ${STATUS_COLORS[status] || 'bg-gray-50 text-gray-600'}`}>
                <p className="text-xl font-display">{count}</p>
                <p className="text-[10px] tracking-widest uppercase mt-1 capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-brand-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-espresso">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-terracotta flex items-center gap-1 hover:gap-2 transition-all">
              View all <FiChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {(recent_orders || []).map(order => (
              <div key={order.id} className="flex items-center justify-between py-2.5 border-b border-brand-50 last:border-0">
                <div>
                  <p className="text-xs font-mono text-espresso">{order.order_number}</p>
                  <p className="text-[11px] text-brand-400 mt-0.5">{order.user_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 tracking-wide ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                  <span className="text-sm font-medium text-terracotta">₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alert */}
        <div className="bg-white border border-brand-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-espresso flex items-center gap-2">
              <FiAlertTriangle size={16} className="text-amber-500" /> Low stock
            </h2>
            <Link to="/admin/products?stock=low" className="text-xs text-terracotta flex items-center gap-1 hover:gap-2 transition-all">
              Manage <FiChevronRight size={12} />
            </Link>
          </div>
          {(low_stock_products || []).length === 0 ? (
            <p className="text-sm text-brand-400 py-4">All products are well stocked.</p>
          ) : (
            <div className="space-y-3">
              {(low_stock_products || []).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-brand-50 last:border-0">
                  <div className="w-10 h-10 bg-brand-100 flex-shrink-0 overflow-hidden">
                    {p.image && <img src={`http://localhost:8000/storage/${p.image}`} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-espresso truncate">{p.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 font-medium ${p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      {(top_products || []).length > 0 && (
        <div className="bg-white border border-brand-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-espresso">Top rated products</h2>
            <Link to="/admin/products" className="text-xs text-terracotta flex items-center gap-1 hover:gap-2 transition-all">
              All products <FiChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-100">
                  <th className="text-left text-[10px] tracking-widest uppercase text-brand-400 pb-3 font-normal">Product</th>
                  <th className="text-left text-[10px] tracking-widest uppercase text-brand-400 pb-3 font-normal">Price</th>
                  <th className="text-left text-[10px] tracking-widest uppercase text-brand-400 pb-3 font-normal">Rating</th>
                  <th className="text-left text-[10px] tracking-widest uppercase text-brand-400 pb-3 font-normal">Reviews</th>
                  <th className="text-left text-[10px] tracking-widest uppercase text-brand-400 pb-3 font-normal">Stock</th>
                </tr>
              </thead>
              <tbody>
                {top_products.map(p => (
                  <tr key={p.id} className="border-b border-brand-50 last:border-0">
                    <td className="py-3 font-medium text-espresso">{p.name}</td>
                    <td className="py-3 text-terracotta">₹{Number(p.sale_price || p.price).toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1">
                        <span className="text-amber-500">★</span> {p.rating}
                      </span>
                    </td>
                    <td className="py-3 text-brand-400">{p.review_count}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 ${p.stock === 0 ? 'bg-red-50 text-red-600' : p.stock <= 10 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                        {p.stock === 0 ? 'Out' : p.stock <= 10 ? `${p.stock} low` : p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
