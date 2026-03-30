import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FiStar, FiMinus, FiPlus, FiShoppingBag, FiTruck,
  FiShield, FiRefreshCw, FiChevronRight, FiHeart
} from 'react-icons/fi'
import api, { PRODUCT_IMAGES } from '../utils/api'
import useCartStore     from '../context/cartStore'
import useAuthStore     from '../context/authStore'
import useWishlistStore from '../context/wishlistStore'
import toast from 'react-hot-toast'

function Stars({ rating, size = 14, interactive = false, value, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <FiStar
          key={i}
          size={size}
          onClick={() => interactive && onChange?.(i)}
          className={`${i <= Math.round(interactive ? value : rating)
            ? 'text-amber-500 fill-amber-500'
            : 'text-brand-200'}
            ${interactive ? 'cursor-pointer hover:text-amber-400 transition-colors' : ''}`}
        />
      ))}
    </div>
  )
}

function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating]     = useState(0)
  const [title,  setTitle]      = useState('')
  const [body,   setBody]       = useState('')
  const [hovered, setHovered]   = useState(0)

  const submitMut = useMutation({
    mutationFn: () => api.post(`/products/${productId}/reviews`, { rating, title, body }),
    onSuccess: () => {
      toast.success('Review submitted! It will appear after approval.')
      onSuccess?.()
    },
    onError: err => toast.error(err.response?.data?.message || 'Could not submit review'),
  })

  return (
    <div className="bg-brand-50 border border-brand-100 p-6 mt-6">
      <h4 className="font-display text-lg text-espresso mb-5">Write a review</h4>
      <div className="space-y-4">
        {/* Star picker */}
        <div>
          <p className="text-xs tracking-wider uppercase text-brand-500 mb-2">Your rating *</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <button
                key={i} type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
              >
                <FiStar size={22}
                  className={`transition-colors ${i <= (hovered || rating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-brand-200'}`} />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-brand-400 ml-2 self-center">
                {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs tracking-wider uppercase text-brand-500 mb-1.5">Review title</p>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="input-field text-sm" placeholder="Summarise your experience" />
        </div>

        <div>
          <p className="text-xs tracking-wider uppercase text-brand-500 mb-1.5">Review</p>
          <textarea rows={4} value={body} onChange={e => setBody(e.target.value)}
            className="input-field resize-none text-sm"
            placeholder="What did you like or dislike? How was the quality?" />
        </div>

        <button
          onClick={() => {
            if (!rating) { toast.error('Please select a rating'); return }
            submitMut.mutate()
          }}
          disabled={submitMut.isPending}
          className="btn-primary py-3 text-xs"
        >
          {submitMut.isPending ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  )
}

export default function ProductPage() {
  const { slug }    = useParams()
  const navigate    = useNavigate()
  const qc          = useQueryClient()
  const [qty,  setQty]  = useState(1)
  const [tab,  setTab]  = useState('description')
  const [imgIdx, setImgIdx] = useState(0)

  const { addToCart }            = useCartStore()
  const { isLoggedIn }           = useAuthStore()
  const { toggle, isWishlisted } = useWishlistStore()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then(r => r.data),
  })

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 animate-pulse">
      <div className="bg-brand-100 aspect-square" />
      <div className="space-y-5">
        <div className="h-5 bg-brand-100 w-1/4 rounded" />
        <div className="h-10 bg-brand-100 w-3/4 rounded" />
        <div className="h-4 bg-brand-100 w-1/2 rounded" />
        <div className="h-8 bg-brand-100 w-1/3 rounded" />
        <div className="h-12 bg-brand-100 rounded" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-24">
      <p className="font-display text-2xl text-brand-300 mb-4">Product not found</p>
      <Link to="/shop" className="btn-primary">Back to shop</Link>
    </div>
  )

  const mainImg  = product.image ? `http://localhost:8000/storage/${product.image}` : (PRODUCT_IMAGES[product.category?.slug] || PRODUCT_IMAGES.default)
  const thumbs   = [mainImg, mainImg, mainImg, mainImg]
  const price    = Number(product.sale_price || product.price)
  const oldPrice = product.sale_price ? Number(product.price) : null
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0
  const inStock  = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 10
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = async () => {
    if (!isLoggedIn()) { toast.error('Please sign in to add to cart'); navigate('/login'); return }
    await addToCart(product.id, qty)
  }

  const handleWishlist = async () => {
    if (!isLoggedIn()) { toast.error('Please sign in to save items'); navigate('/login'); return }
    await toggle(product.id)
  }

  return (
    <div className="animate-fade-in">

      {/* Breadcrumb */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex items-center gap-2 text-xs text-brand-400 flex-wrap">
          <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
          <FiChevronRight size={11} />
          <Link to="/shop" className="hover:text-terracotta transition-colors">Shop</Link>
          <FiChevronRight size={11} />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-terracotta transition-colors">
                {product.category.name}
              </Link>
              <FiChevronRight size={11} />
            </>
          )}
          <span className="text-espresso truncate max-w-48">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 grid md:grid-cols-2 gap-10 lg:gap-20">

        {/* Images */}
        <div className="space-y-3">
          <div className="bg-brand-100 overflow-hidden aspect-square">
            <img src={thumbs[imgIdx]} alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {thumbs.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`overflow-hidden aspect-square border-2 transition-colors ${imgIdx === i ? 'border-terracotta' : 'border-transparent hover:border-brand-200'}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="py-2">

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.is_new_arrival && (
              <span className="text-[10px] tracking-widest uppercase bg-terracotta text-cream px-2.5 py-1">New arrival</span>
            )}
            {product.is_bestseller && (
              <span className="text-[10px] tracking-widest uppercase bg-sand text-espresso px-2.5 py-1">Bestseller</span>
            )}
            {product.category && (
              <Link to={`/shop?category=${product.category.slug}`}
                className="text-[10px] tracking-widest uppercase border border-brand-200 text-brand-500 px-2.5 py-1 hover:border-terracotta hover:text-terracotta transition-colors">
                {product.category.name}
              </Link>
            )}
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-espresso leading-tight mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <Stars rating={product.rating} />
            <span className="text-sm text-brand-400">
              {product.rating} ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-display text-3xl text-terracotta">₹{price.toLocaleString('en-IN')}</span>
            {oldPrice && (
              <span className="text-lg text-brand-300 line-through">₹{oldPrice.toLocaleString('en-IN')}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-50 text-red-600 text-xs px-2 py-1 font-medium">{discount}% off</span>
            )}
          </div>

          {/* Stock status */}
          <p className={`text-xs tracking-wider uppercase mb-6 font-medium
            ${!inStock ? 'text-red-500' : lowStock ? 'text-amber-600' : 'text-green-600'}`}>
            {!inStock ? '✕ Out of stock' : lowStock ? `⚠ Only ${product.stock} left` : '✓ In stock'}
          </p>

          {/* Short desc */}
          {product.short_description && (
            <p className="text-sm text-brand-600 leading-relaxed mb-8 pl-4 border-l-2 border-brand-200">
              {product.short_description}
            </p>
          )}

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-brand-200">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-brand-400 hover:text-terracotta transition-colors"
              >
                <FiMinus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-medium text-espresso select-none">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))}
                disabled={qty >= product.stock}
                className="w-10 h-12 flex items-center justify-center text-brand-400 hover:text-terracotta transition-colors disabled:opacity-30"
              >
                <FiPlus size={14} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiShoppingBag size={16} />
              {inStock ? 'Add to cart' : 'Out of stock'}
            </button>

            <button
              onClick={handleWishlist}
              className={`w-12 h-12 border flex items-center justify-center transition-all ${
                wishlisted
                  ? 'border-red-300 bg-red-50 text-red-500'
                  : 'border-brand-200 text-brand-400 hover:border-red-300 hover:text-red-400'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart size={17} className={wishlisted ? 'fill-current' : ''} />
            </button>
          </div>

          {qty > 1 && (
            <p className="text-xs text-brand-400 mb-6">
              Subtotal: <span className="text-terracotta font-medium">₹{(price * qty).toLocaleString('en-IN')}</span>
            </p>
          )}

          {/* Product meta */}
          {(product.material || product.weight || product.dimensions || product.sku) && (
            <div className="border-t border-brand-100 pt-5 mb-5 space-y-2">
              {[
                ['SKU', product.sku],
                ['Material', product.material],
                ['Weight', product.weight],
                ['Dimensions', product.dimensions],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="text-brand-400 w-24 flex-shrink-0">{label}</span>
                  <span className="text-espresso">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="border-t border-brand-100 pt-5 grid grid-cols-3 gap-3">
            {[
              [FiTruck,      'Free shipping', 'Orders above ₹999'],
              [FiShield,     'Secure payment','100% safe checkout'],
              [FiRefreshCw,  'Easy returns',  '15-day policy'],
            ].map(([Icon, title, sub]) => (
              <div key={title} className="text-center p-3 bg-brand-50">
                <Icon size={16} className="text-terracotta mx-auto mb-1.5" />
                <p className="text-[11px] font-medium text-espresso">{title}</p>
                <p className="text-[10px] text-brand-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-brand-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex gap-0 border-b border-brand-100">
            {[
              ['description', 'Description'],
              ['reviews', `Reviews (${product.review_count})`],
              ['shipping', 'Shipping & returns'],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`py-4 px-2 mr-6 text-sm tracking-wide border-b-2 -mb-px transition-colors
                  ${tab === id ? 'border-terracotta text-terracotta' : 'border-transparent text-brand-400 hover:text-espresso'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="py-10 max-w-3xl">

            {tab === 'description' && (
              <div className="prose prose-sm text-brand-600 leading-relaxed space-y-4">
                <p>{product.description || 'No description available for this product.'}</p>
              </div>
            )}

            {tab === 'reviews' && (
              <div>
                {/* Rating summary */}
                <div className="flex items-center gap-6 mb-8 p-5 bg-brand-50 border border-brand-100">
                  <div className="text-center">
                    <p className="font-display text-5xl text-terracotta">{product.rating}</p>
                    <Stars rating={product.rating} size={14} />
                    <p className="text-xs text-brand-400 mt-1">{product.review_count} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5,4,3,2,1].map(n => {
                      const count  = product.reviews?.filter(r => r.is_approved && Math.round(r.rating) === n).length || 0
                      const total  = product.reviews?.filter(r => r.is_approved).length || 1
                      const pct    = Math.round((count / total) * 100)
                      return (
                        <div key={n} className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-brand-400 w-3">{n}</span>
                          <FiStar size={10} className="text-amber-400 fill-amber-400" />
                          <div className="flex-1 bg-brand-200 h-1.5">
                            <div className="bg-amber-400 h-1.5" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-brand-400 w-6">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Individual reviews */}
                <div className="space-y-6 mb-8">
                  {product.reviews?.filter(r => r.is_approved).length === 0 ? (
                    <p className="text-brand-400 text-sm">No approved reviews yet.</p>
                  ) : (
                    product.reviews?.filter(r => r.is_approved).map(r => (
                      <div key={r.id} className="border-b border-brand-100 pb-6 last:border-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-terracotta/10 text-terracotta text-sm flex items-center justify-center font-medium flex-shrink-0">
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-espresso">{r.user?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stars rating={r.rating} size={11} />
                              <span className="text-[10px] text-brand-400">
                                {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {r.title && <p className="text-sm font-medium text-espresso mb-1 ml-12">{r.title}</p>}
                        {r.body  && <p className="text-sm text-brand-600 leading-relaxed ml-12">{r.body}</p>}
                      </div>
                    ))
                  )}
                </div>

                {/* Review form */}
                {isLoggedIn() ? (
                  <ReviewForm
                    productId={product.id}
                    onSuccess={() => qc.invalidateQueries(['product', slug])}
                  />
                ) : (
                  <div className="bg-brand-50 border border-brand-100 p-5 text-center">
                    <p className="text-sm text-brand-500 mb-3">Sign in to write a review</p>
                    <Link to="/login" className="btn-primary text-xs py-2.5 px-6">Sign in</Link>
                  </div>
                )}
              </div>
            )}

            {tab === 'shipping' && (
              <div className="space-y-6 text-sm text-brand-600 leading-relaxed">
                <div>
                  <h4 className="font-medium text-espresso mb-2">Shipping policy</h4>
                  <p>We deliver across India within 5–7 business days. Orders above ₹999 qualify for free shipping. Express delivery (2–3 days) is available at checkout for select pincodes.</p>
                </div>
                <div>
                  <h4 className="font-medium text-espresso mb-2">Return policy</h4>
                  <p>We offer a 15-day return policy for unused, undamaged items in original packaging. To initiate a return, contact our support team with your order number.</p>
                </div>
                <div>
                  <h4 className="font-medium text-espresso mb-2">Packaging</h4>
                  <p>All products are carefully packed with protective materials. Ceramics and glassware are individually wrapped to prevent breakage during transit.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
