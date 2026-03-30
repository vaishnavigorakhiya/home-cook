import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiFilter, FiX, FiChevronDown, FiStar, FiGrid, FiList } from 'react-icons/fi'
import api, { PRODUCT_IMAGES, CATEGORY_IMAGES } from '../utils/api'
import useCartStore from '../context/cartStore'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

const SORTS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'price_asc',  label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'rating',     label: 'Top rated' },
]

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <FiStar key={i} size={10} className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-brand-200'} />
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
        {product.sale_price && <span className="badge badge-sale">Sale</span>}
        {product.is_bestseller && !product.sale_price && <span className="badge badge-best">Bestseller</span>}
        {product.stock === 0 && <span className="badge badge-out">Sold out</span>}
        <div className="absolute inset-x-0 bottom-0 bg-espresso translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleCart} disabled={product.stock === 0}
            className="w-full py-3 text-cream text-xs tracking-widest uppercase hover:bg-terracotta transition-colors disabled:opacity-50">
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
      <div className="p-3 bg-white border-t border-brand-50">
        <StarRating rating={product.rating} />
        <p className="text-sm font-medium text-espresso mt-1.5 mb-0.5 truncate">{product.name}</p>
        <p className="text-xs text-brand-400 mb-1.5">{product.category?.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          {product.sale_price && <span className="text-xs text-brand-300 line-through">₹{Number(product.price).toLocaleString('en-IN')}</span>}
          <span className="text-sm font-medium text-terracotta">₹{Number(product.sale_price || product.price).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </Link>
  )
}

export default function ShopPage() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sort, setSort]             = useState(params.get('sort') || 'newest')
  const [minPrice, setMinPrice]     = useState(params.get('min_price') || '')
  const [maxPrice, setMaxPrice]     = useState(params.get('max_price') || '')
  const [page, setPage]             = useState(1)

  const category    = params.get('category') || ''
  const search      = params.get('search') || ''
  const featured    = params.get('featured') || ''
  const newArrivals = params.get('new_arrivals') || ''

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, search, sort, minPrice, maxPrice, featured, newArrivals, page }],
    queryFn: () => api.get('/products', {
      params: { category, search, sort, min_price: minPrice, max_price: maxPrice, featured, new_arrivals: newArrivals, page, per_page: 12 }
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const updateFilter = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setParams(next)
    setPage(1)
  }

  const clearFilters = () => { setParams({}); setMinPrice(''); setMaxPrice(''); setSort('newest'); setPage(1) }

  const hasFilters = category || search || minPrice || maxPrice || featured || newArrivals

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-label">
            {category ? categories?.find(c => c.slug === category)?.name || category : 'All products'}
          </p>
          <h1 className="font-display text-3xl text-espresso">
            {search ? `Results for "${search}"` : 'Our collection'}
          </h1>
          {data && <p className="text-sm text-brand-400 mt-1">{data.total} products</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFilterOpen(s => !s)}
            className="flex items-center gap-2 text-sm text-espresso border border-brand-200 px-4 py-2.5 hover:border-terracotta transition-colors">
            <FiFilter size={14} /> Filters {hasFilters && <span className="bg-terracotta text-cream text-[10px] w-4 h-4 flex items-center justify-center rounded-full">!</span>}
          </button>
          <select value={sort} onChange={e => { setSort(e.target.value); updateFilter('sort', e.target.value) }}
            className="text-sm border border-brand-200 px-3 py-2.5 bg-white text-espresso focus:outline-none focus:border-terracotta">
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="bg-brand-50 border border-brand-100 p-6 mb-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <p className="text-xs tracking-widest uppercase text-brand-500 mb-3">Category</p>
              <div className="space-y-2">
                <button onClick={() => updateFilter('category', '')}
                  className={`block text-sm w-full text-left py-1 ${!category ? 'text-terracotta font-medium' : 'text-brand-600 hover:text-espresso'}`}>
                  All categories
                </button>
                {(categories || []).map(cat => (
                  <button key={cat.id} onClick={() => updateFilter('category', cat.slug)}
                    className={`block text-sm w-full text-left py-1 ${category === cat.slug ? 'text-terracotta font-medium' : 'text-brand-600 hover:text-espresso'}`}>
                    {cat.name} <span className="text-brand-300">({cat.products_count})</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Price */}
            <div>
              <p className="text-xs tracking-widest uppercase text-brand-500 mb-3">Price range</p>
              <div className="flex items-center gap-2">
                <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₹"
                  className="input-field w-full text-sm" type="number" />
                <span className="text-brand-300">—</span>
                <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₹"
                  className="input-field w-full text-sm" type="number" />
              </div>
              <button onClick={() => { updateFilter('min_price', minPrice); updateFilter('max_price', maxPrice) }}
                className="btn-primary w-full py-2.5 mt-3 text-[11px]">Apply</button>
            </div>
            {/* Type */}
            <div>
              <p className="text-xs tracking-widest uppercase text-brand-500 mb-3">Product type</p>
              <div className="space-y-2">
                {[['featured', 'Featured', featured], ['new_arrivals', 'New arrivals', newArrivals]].map(([key, label, val]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!val} onChange={e => updateFilter(key, e.target.checked ? '1' : '')}
                      className="accent-terracotta" />
                    <span className="text-sm text-brand-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Clear */}
            <div className="flex items-end">
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                  <FiX size={14} /> Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category && <span className="flex items-center gap-1 bg-brand-100 text-espresso text-xs px-3 py-1.5">
            {category} <button onClick={() => updateFilter('category', '')}><FiX size={10} /></button>
          </span>}
          {search && <span className="flex items-center gap-1 bg-brand-100 text-espresso text-xs px-3 py-1.5">
            Search: {search} <button onClick={() => updateFilter('search', '')}><FiX size={10} /></button>
          </span>}
          {featured && <span className="flex items-center gap-1 bg-brand-100 text-espresso text-xs px-3 py-1.5">
            Featured <button onClick={() => updateFilter('featured', '')}><FiX size={10} /></button>
          </span>}
          {newArrivals && <span className="flex items-center gap-1 bg-brand-100 text-espresso text-xs px-3 py-1.5">
            New arrivals <button onClick={() => updateFilter('new_arrivals', '')}><FiX size={10} /></button>
          </span>}
        </div>
      )}

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-brand-50 animate-pulse" style={{ aspectRatio: '3/4' }} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-2xl text-brand-300 mb-3">No products found</p>
          <p className="text-sm text-brand-400 mb-6">Try adjusting your filters or search term</p>
          <button onClick={clearFilters} className="btn-primary">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data?.data?.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {data?.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {[...Array(data.last_page)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 text-sm transition-colors ${page === i + 1 ? 'bg-terracotta text-cream' : 'border border-brand-200 text-espresso hover:border-terracotta'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
