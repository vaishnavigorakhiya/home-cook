import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import useWishlistStore from '../context/wishlistStore'
import useCartStore from '../context/cartStore'
import useAuthStore from '../context/authStore'
import { PRODUCT_IMAGES } from '../utils/api'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items, fetchWishlist, toggle, loading } = useWishlistStore()
  const { addToCart } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { if (isLoggedIn()) fetchWishlist() }, [])

  const handleAddToCart = async (productId) => {
    await addToCart(productId)
  }

  const handleRemove = async (productId) => {
    await toggle(productId)
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-brand-100 animate-pulse" style={{ aspectRatio: '3/4' }} />
      ))}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart size={22} className="text-terracotta" />
        <h1 className="font-display text-3xl text-espresso">My wishlist</h1>
        {items.length > 0 && <span className="text-brand-400 text-sm">({items.length} items)</span>}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart size={48} className="text-brand-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-brand-300 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-brand-400 mb-8">Save items you love to find them later.</p>
          <Link to="/shop" className="btn-primary">Browse products</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {items.map(product => {
              const img = product.image
                ? `http://localhost:8000/storage/${product.image}`
                : (PRODUCT_IMAGES[product.category?.slug] || PRODUCT_IMAGES.default)
              const price = Number(product.sale_price || product.price)
              const oldPrice = product.sale_price ? Number(product.price) : null

              return (
                <div key={product.id} className="group bg-white">
                  <div className="relative overflow-hidden bg-brand-100" style={{ aspectRatio: '3/4' }}>
                    <Link to={`/shop/${product.slug}`}>
                      <img src={img} alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </Link>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white transition-all"
                    >
                      <FiTrash2 size={13} />
                    </button>
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-xs tracking-widest uppercase text-brand-500 bg-white px-3 py-1.5">Sold out</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <Link to={`/shop/${product.slug}`} className="text-sm font-medium text-espresso hover:text-terracotta transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="text-xs text-brand-400 mt-0.5 mb-2">{product.category?.name}</p>
                    <div className="flex items-center gap-2 mb-3">
                      {oldPrice && <span className="text-xs text-brand-300 line-through">₹{oldPrice.toLocaleString('en-IN')}</span>}
                      <span className="text-sm font-medium text-terracotta">₹{price.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className="w-full btn-primary py-2.5 text-[11px] flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiShoppingBag size={12} />
                      {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-brand-100 flex justify-between items-center">
            <Link to="/shop" className="text-sm text-terracotta hover:underline">Continue shopping</Link>
            <button
              onClick={() => items.forEach(p => handleAddToCart(p.id))}
              className="btn-dark flex items-center gap-2 text-xs py-3"
            >
              <FiShoppingBag size={14} /> Add all to cart
            </button>
          </div>
        </>
      )}
    </div>
  )
}
