import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import api, { formatINR, CATEGORY_IMAGES, PRODUCT_IMAGES } from '../utils/api'
import useCartStore from '../context/cartStore'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=85',
  'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1200&q=85',
]

const TRUST = [
  { icon: FiTruck,      title: 'Free shipping',    sub: 'On orders above ₹999' },
  { icon: FiShield,     title: 'Secure payments',  sub: '100% safe checkout' },
  { icon: FiRefreshCw,  title: 'Easy returns',     sub: '15-day return policy' },
  { icon: FiHeadphones, title: '24/7 support',     sub: 'We\'re always here' },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={11}
          className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-brand-200'} />
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  const { addToCart } = useCartStore()
  const { isLoggedIn } = useAuthStore()
  const navigate = useNavigate()
  const img = product.image ? `http://localhost:8000/storage/${product.image}` : (PRODUCT_IMAGES[product.category?.slug] || PRODUCT_IMAGES.default)

  const handleCart = async (e) => {
    e.preventDefault()
    if (!isLoggedIn()) { toast.error('Please login to add to cart'); navigate('/login'); return }
    await addToCart(product.id)
  }

  return (
    <Link to={`/shop/${product.slug}`} className="card-product block">
      <div className="relative overflow-hidden bg-brand-100" style={{ aspectRatio: '3/4' }}>
        <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {product.is_new_arrival && <span className="badge badge-new">New</span>}
        {product.sale_price && !product.is_new_arrival && <span className="badge badge-sale">Sale</span>}
        {product.is_bestseller && !product.sale_price && !product.is_new_arrival && <span className="badge badge-best">Bestseller</span>}
        {product.stock === 0 && <span className="badge badge-out">Sold out</span>}
        <div className="absolute inset-x-0 bottom-0 bg-espresso translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleCart} disabled={product.stock === 0}
            className="w-full py-3 text-cream text-xs tracking-widest uppercase hover:bg-terracotta transition-colors disabled:opacity-50">
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
      <div className="p-4 bg-white">
        <StarRating rating={product.rating} />
        <h3 className="text-sm font-medium text-espresso mt-1.5 mb-1">{product.name}</h3>
        <p className="text-xs text-brand-400 mb-2">{product.category?.name}</p>
        <div className="flex items-center gap-2">
          {product.sale_price && <span className="text-price-old text-sm">₹{Number(product.price).toLocaleString('en-IN')}</span>}
          <span className="text-price">₹{Number(product.sale_price || product.price).toLocaleString('en-IN')}</span>
          {product.sale_price && (
            <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5">
              {Math.round(((product.price - product.sale_price) / product.price) * 100)}% off
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const { data: featured } = useQuery({
    queryKey: ['featured'],
    queryFn: () => api.get('/products/featured').then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { data: newArrivals } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => api.get('/products?new_arrivals=1&per_page=4').then(r => r.data.data),
  })

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <section className="grid md:grid-cols-2 min-h-[80vh]">
        <div className="relative overflow-hidden bg-brand-900" style={{ minHeight: 440 }}>
          <img src={HERO_IMAGES[0]} alt="Kitchen" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="relative z-10 flex flex-col justify-end h-full p-10 md:p-16 pb-16">
            <span className="section-label text-sand mb-4">New collection — 2026</span>
            <h1 className="font-display text-4xl md:text-5xl text-cream leading-tight mb-6">
              Craft for the<br />
              <em>everyday</em> kitchen
            </h1>
            <p className="text-brand-300 text-sm leading-relaxed mb-8 max-w-sm">
              Thoughtfully sourced cookware, ceramics, and tools for those who believe cooking is a form of care.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/shop" className="btn-primary">Shop now</Link>
              <Link to="/shop?new_arrivals=1" className="btn-ghost border-sand text-sand hover:bg-sand hover:text-espresso">New arrivals</Link>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden bg-brand-200" style={{ minHeight: 440 }}>
          <img src={HERO_IMAGES[1]} alt="Cast iron cookware" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-espresso/10" />
          <div className="absolute bottom-8 right-8 bg-cream/95 p-5 max-w-[200px]">
            <p className="text-[10px] tracking-widest text-terracotta uppercase mb-1">Featured</p>
            <p className="font-display text-sm text-espresso leading-snug">Enamelled Cast Iron Pot</p>
            <p className="text-price text-sm mt-2">₹12,499</p>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-brand-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon size={20} className="text-terracotta mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-espresso">{title}</p>
                <p className="text-xs text-brand-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="section-label">Browse by category</p>
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title mb-0">Everything for your kitchen</h2>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm text-terracotta hover:gap-3 transition-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories || []).map(cat => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="group">
              <div className="overflow-hidden bg-brand-100 mb-3" style={{ aspectRatio: '1' }}>
                <img
                  src={cat.image ? `http://localhost:8000/storage/${cat.image}` : CATEGORY_IMAGES[cat.slug] || CATEGORY_IMAGES.cookware}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-sm font-medium text-espresso group-hover:text-terracotta transition-colors">{cat.name}</p>
              <p className="text-xs text-brand-400">{cat.products_count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-brand-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="section-label">Handpicked for you</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="section-title mb-0">Featured products</h2>
            <Link to="/shop?featured=1" className="hidden md:flex items-center gap-2 text-sm text-terracotta hover:gap-3 transition-all">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(featured || []).slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* SPLIT BANNER */}
      <section className="grid md:grid-cols-2" style={{ minHeight: 380 }}>
        <div className="relative overflow-hidden flex flex-col justify-end p-10 md:p-14" style={{ minHeight: 320 }}>
          <img src="https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=900&q=80" alt="Collection" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-espresso/60" />
          <div className="relative z-10">
            <p className="text-[10px] tracking-widest text-sand uppercase mb-3">Limited edition</p>
            <h3 className="font-display text-3xl text-cream mb-4 leading-tight">The Harvest<br />season collection</h3>
            <Link to="/shop" className="text-xs tracking-widest uppercase text-cream border-b border-cream/40 pb-0.5 hover:border-cream transition-colors">
              Explore collection
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden flex flex-col justify-end p-10 md:p-14" style={{ minHeight: 320 }}>
          <img src="https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=900&q=80" alt="Cast iron" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-terracotta/50" />
          <div className="relative z-10">
            <p className="text-[10px] tracking-widest text-cream/70 uppercase mb-3">Care &amp; craft</p>
            <h3 className="font-display text-3xl text-cream mb-4 leading-tight">Why we love<br />cast iron</h3>
            <Link to="/shop?category=cookware" className="text-xs tracking-widest uppercase text-cream border-b border-cream/40 pb-0.5 hover:border-cream transition-colors">
              Read the journal
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <p className="section-label">Just landed</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="section-title mb-0">New arrivals</h2>
            <Link to="/shop?new_arrivals=1" className="hidden md:flex items-center gap-2 text-sm text-terracotta hover:gap-3 transition-all">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* STORY SECTION */}
      <section className="grid md:grid-cols-2" style={{ minHeight: 460 }}>
        <div className="overflow-hidden bg-brand-200" style={{ minHeight: 360 }}>
          <img src="https://images.unsplash.com/photo-1614963590047-d5a32c9aeedd?w=900&q=80" alt="Our story" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white flex flex-col justify-center px-10 md:px-16 py-16">
          <p className="section-label">Our story</p>
          <h2 className="font-display text-3xl text-espresso leading-snug mb-5">
            Tools built for<br />the love of cooking
          </h2>
          <p className="text-sm text-brand-600 leading-relaxed mb-4">
            Home & Cook was born from a simple belief — that the right tool makes every meal more meaningful.
            We source ceramics from artisan studios, cast iron from traditional foundries, and wood pieces
            from sustainable forests.
          </p>
          <p className="text-sm text-brand-600 leading-relaxed mb-8">
            Every product in our collection is chosen with intention, tested in real kitchens, and backed by
            our promise of quality that lasts.
          </p>
          <Link to="/shop" className="btn-primary self-start">Explore the shop</Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-espresso py-20 px-6 text-center">
        <p className="section-label text-sand">Stay connected</p>
        <h2 className="font-display text-3xl text-cream mb-3">Stay in the kitchen loop</h2>
        <p className="text-brand-300 text-sm mb-10">New products, seasonal recipes, and kitchen tips — straight to your inbox.</p>
        <form onSubmit={e => { e.preventDefault(); toast.success('Subscribed successfully!') }}
          className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
          <input type="email" placeholder="Your email address" required
            className="flex-1 bg-transparent border border-brand-700 text-cream placeholder:text-brand-600 px-5 py-3.5 text-sm focus:outline-none focus:border-sand transition-colors" />
          <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
        </form>
      </section>

    </div>
  )
}
