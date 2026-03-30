import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi'
import useCartStore from '../context/cartStore'
import { PRODUCT_IMAGES } from '../utils/api'

export default function CartPage() {
  const { items, subtotal, shipping, total, count, fetchCart, updateQuantity, removeItem } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => { fetchCart() }, [])

  if (count === 0) return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center animate-fade-in">
      <FiShoppingBag size={48} className="text-brand-200 mx-auto mb-6" />
      <h2 className="font-display text-3xl text-espresso mb-3">Your cart is empty</h2>
      <p className="text-brand-400 text-sm mb-8">Looks like you haven't added anything to your cart yet.</p>
      <Link to="/shop" className="btn-primary">Continue shopping</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-brand-400 hover:text-terracotta transition-colors">
          <FiArrowLeft size={18} />
        </button>
        <h1 className="font-display text-3xl text-espresso">Shopping cart</h1>
        <span className="text-brand-400 text-sm">({count} {count === 1 ? 'item' : 'items'})</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const p = item.product
            const img = p.image ? `http://localhost:8000/storage/${p.image}` : (PRODUCT_IMAGES[p.category?.slug] || PRODUCT_IMAGES.default)
            return (
              <div key={item.id} className="flex gap-5 bg-white p-5 border border-brand-100">
                <Link to={`/shop/${p.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 bg-brand-100 overflow-hidden">
                    <img src={img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/shop/${p.slug}`} className="font-medium text-espresso hover:text-terracotta transition-colors text-sm">
                        {p.name}
                      </Link>
                      <p className="text-xs text-brand-400 mt-0.5">{p.category?.name}</p>
                      {p.stock <= 10 && p.stock > 0 && (
                        <p className="text-xs text-amber-600 mt-1">Only {p.stock} left</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-brand-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-brand-200">
                      <button onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center text-brand-400 hover:text-terracotta transition-colors">
                        <FiMinus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= p.stock}
                        className="w-8 h-8 flex items-center justify-center text-brand-400 hover:text-terracotta transition-colors disabled:opacity-30">
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <span className="font-medium text-terracotta">₹{item.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <Link to="/shop" className="flex items-center gap-2 text-sm text-terracotta hover:gap-3 transition-all mt-4">
            <FiArrowLeft size={14} /> Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-brand-100 p-6 sticky top-24">
            <h2 className="font-display text-xl text-espresso mb-6">Order summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-brand-600">Subtotal</span>
                <span className="text-espresso">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-espresso'}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-brand-400">Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free shipping</p>
              )}
              <div className="border-t border-brand-100 pt-3 flex justify-between font-medium">
                <span className="text-espresso">Total</span>
                <span className="text-terracotta text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupon placeholder */}
            <div className="flex gap-2 mb-6">
              <input placeholder="Coupon code" className="input-field flex-1 text-sm py-2.5" />
              <button className="btn-ghost text-xs px-4 py-2.5">Apply</button>
            </div>

            <Link to="/checkout" className="btn-primary w-full text-center block py-4">
              Proceed to checkout
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-400">
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
