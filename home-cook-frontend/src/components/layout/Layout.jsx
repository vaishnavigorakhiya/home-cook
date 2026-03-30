import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiHeart } from 'react-icons/fi'
import useAuthStore   from '../../context/authStore'
import useCartStore   from '../../context/cartStore'
import useWishlistStore from '../../context/wishlistStore'
import toast from 'react-hot-toast'

const MARQUEE = [
  'Free shipping over ₹999', 'Handcrafted ceramics', 'New arrivals',
  'Cast iron cookware', 'Artisan cutting boards', 'Premium kitchen tools',
  '15-day easy returns', 'Secure payments',
]

function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [scrolled,    setScrolled]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const navigate   = useNavigate()
  const location   = useLocation()

  const { user, logout, isLoggedIn, isAdmin } = useAuthStore()
  const { count, fetchCart }                  = useCartStore()
  const { items: wishItems, fetchWishlist }   = useWishlistStore()

  useEffect(() => {
    if (isLoggedIn()) { fetchCart(); fetchWishlist() }
  }, [isLoggedIn()])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
      setSearch('')
    }
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-espresso overflow-hidden py-2">
        <div className="marquee-track inline-flex whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="text-[10px] tracking-[0.14em] uppercase text-cream/70 px-8">
              {t}<span className="text-sand/60 ml-8">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 border-b border-brand-100
        ${scrolled ? 'bg-cream/96 backdrop-blur-md' : 'bg-cream'}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-0 flex items-center h-16 gap-8">

          {/* Logo */}
          <Link to="/" className="font-display text-xl text-espresso tracking-wide flex-shrink-0">
            Home <span className="text-terracotta">&</span> Cook
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7 flex-1">
            {[
              ['/', 'Home'],
              ['/shop', 'Shop all'],
              ['/shop?category=cookware', 'Cookware'],
              ['/shop?category=ceramics', 'Ceramics'],
              ['/shop?new_arrivals=1', 'New arrivals'],
            ].map(([to, label]) => (
              <Link key={to+label} to={to}
                className={`nav-link text-[13px] whitespace-nowrap ${location.pathname === to ? 'text-terracotta' : ''}`}>
                {label}
              </Link>
            ))}
            {isAdmin() && (
              <Link to="/admin" className="text-[13px] text-terracotta font-medium tracking-wide hover:text-brand-700 transition-colors">
                Admin ↗
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-4">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              aria-label="Search"
              className="text-brand-600 hover:text-terracotta transition-colors"
            >
              {searchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
            </button>

            {/* Wishlist */}
            {isLoggedIn() && (
              <Link to="/wishlist" aria-label="Wishlist" className="relative text-brand-600 hover:text-terracotta transition-colors">
                <FiHeart size={18} />
                {wishItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-terracotta text-cream text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium leading-none">
                    {wishItems.length > 9 ? '9+' : wishItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Account dropdown */}
            {isLoggedIn() ? (
              <div className="relative group">
                <button aria-label="Account" className="text-brand-600 hover:text-terracotta transition-colors flex items-center gap-1">
                  <FiUser size={18} />
                </button>
                <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-brand-100 shadow-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-brand-50">
                    <p className="text-[11px] text-brand-400">Signed in as</p>
                    <p className="text-sm font-medium text-espresso truncate">{user?.name}</p>
                  </div>
                  {[
                    ['/account', 'My account'],
                    ['/orders', 'My orders'],
                    ['/wishlist', 'Wishlist'],
                  ].map(([href, label]) => (
                    <Link key={href} to={href}
                      className="block px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 hover:text-terracotta transition-colors">
                      {label}
                    </Link>
                  ))}
                  {isAdmin() && (
                    <Link to="/admin"
                      className="block px-4 py-2.5 text-sm text-terracotta hover:bg-brand-50 transition-colors border-t border-brand-50">
                      Admin panel ↗
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-brand-100">
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" aria-label="Sign in" className="text-brand-600 hover:text-terracotta transition-colors">
                <FiUser size={18} />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" aria-label="Cart" className="relative text-brand-600 hover:text-terracotta transition-colors">
              <FiShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-terracotta text-cream text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(s => !s)}
              aria-label="Menu"
              className="md:hidden text-brand-600 hover:text-terracotta transition-colors ml-1"
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-brand-100 bg-cream animate-slide-up">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-6 py-4 flex gap-3">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cookware, ceramics, utensils…"
                className="input-field flex-1 text-sm"
              />
              <button type="submit" className="btn-primary px-6 py-2.5 text-xs">Search</button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-brand-100 bg-cream animate-slide-up">
            <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 gap-1">
              {[
                ['/', 'Home'],
                ['/shop', 'Shop all'],
                ['/shop?category=cookware', 'Cookware'],
                ['/shop?category=ceramics', 'Ceramics'],
                ['/shop?new_arrivals=1', 'New arrivals'],
                ['/wishlist', 'Wishlist'],
                ['/account', 'My account'],
                ['/orders', 'My orders'],
              ].map(([to, label]) => (
                <Link key={to+label} to={to}
                  className="block py-2.5 text-sm text-brand-700 hover:text-terracotta transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-brand-100">
              {isLoggedIn() ? (
                <button onClick={handleLogout} className="text-sm text-red-500">Sign out</button>
              ) : (
                <div className="flex gap-4">
                  <Link to="/login" className="btn-primary text-xs py-2.5 px-5">Sign in</Link>
                  <Link to="/register" className="btn-ghost text-xs py-2.5 px-5">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

function Footer() {
  return (
    <footer className="bg-espresso text-cream mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="md:col-span-1">
          <div className="font-display text-2xl mb-4">
            Home <span className="text-sand">&</span> Cook
          </div>
          <p className="text-brand-400 text-sm leading-relaxed mb-6">
            Thoughtfully sourced kitchen tools and ceramics for the everyday cook.
            Delivering across India with love.
          </p>
          <div className="flex gap-5">
            {['Instagram', 'Pinterest', 'Facebook'].map(s => (
              <a key={s} href="#" className="text-xs text-brand-500 hover:text-sand transition-colors tracking-wide">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {[
          {
            title: 'Shop',
            links: [
              ['/shop', 'All products'],
              ['/shop?new_arrivals=1', 'New arrivals'],
              ['/shop?category=cookware', 'Cookware'],
              ['/shop?category=ceramics', 'Ceramics'],
              ['/shop?featured=1', 'Featured'],
            ]
          },
          {
            title: 'Help',
            links: [
              ['#', 'About us'],
              ['#', 'Shipping policy'],
              ['#', 'Return policy'],
              ['#', 'FAQ'],
              ['#', 'Contact us'],
            ]
          },
          {
            title: 'Account',
            links: [
              ['/login', 'Sign in'],
              ['/register', 'Register'],
              ['/orders', 'My orders'],
              ['/account', 'My account'],
              ['/wishlist', 'Wishlist'],
            ]
          },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-[10px] tracking-[0.14em] uppercase text-brand-500 mb-5">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-brand-400 hover:text-sand transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-brand-600">© 2026 Home & Cook. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Privacy policy', 'Terms of service', 'Cookie policy'].map(t => (
              <a key={t} href="#" className="text-[11px] text-brand-600 hover:text-brand-400 transition-colors">{t}</a>
            ))}
          </div>
          <p className="text-[11px] text-brand-600">Made with care in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
