import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag,
  FiLogOut, FiMenu, FiX, FiStar, FiPercent, FiHome
} from 'react-icons/fi'
import { useState } from 'react'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: FiGrid },
  { to: '/admin/products',   label: 'Products',   icon: FiPackage },
  { to: '/admin/orders',     label: 'Orders',     icon: FiShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/users',      label: 'Users',      icon: FiUsers },
  { to: '/admin/reviews',    label: 'Reviews',    icon: FiStar },
  { to: '/admin/coupons',    label: 'Coupons',    icon: FiPercent },
]

function Sidebar({ onClose }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="flex flex-col h-full bg-espresso text-cream w-60 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-800 flex items-center justify-between">
        <div>
          <Link to="/" className="font-display text-lg">
            Home <span className="text-sand">&</span> Cook
          </Link>
          <p className="text-[10px] tracking-widest text-brand-500 mt-0.5 uppercase">Admin panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-brand-400 hover:text-cream md:hidden">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto">
        {/* Back to store */}
        <Link to="/"
          className="flex items-center gap-3 px-4 py-2.5 mb-4 text-xs text-brand-500 hover:text-brand-300 transition-colors border-b border-brand-800 pb-4">
          <FiHome size={13} /> Back to store
        </Link>

        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/admin' && pathname.startsWith(to))
          return (
            <Link
              key={to} to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 mb-0.5 text-sm rounded-sm transition-all duration-150
                ${active
                  ? 'bg-terracotta text-cream'
                  : 'text-brand-400 hover:bg-brand-800 hover:text-cream'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-brand-800">
        <div className="px-4 py-3 mb-2 bg-brand-800">
          <p className="text-xs font-medium text-cream truncate">{user?.name}</p>
          <p className="text-[10px] text-brand-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-500 hover:text-red-400 transition-colors w-full"
        >
          <FiLogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  // Page title from current path
  const pageTitle = NAV.find(n => n.to !== '/admin' && pathname.startsWith(n.to))?.label
    || (pathname === '/admin' ? 'Dashboard' : 'Admin')

  return (
    <div className="flex min-h-screen bg-[#F7F5F2]">

      {/* Desktop sidebar — fixed */}
      <div className="hidden md:flex md:w-60 md:flex-shrink-0">
        <div className="fixed top-0 left-0 h-full w-60">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <Sidebar onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-brand-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="text-brand-400 hover:text-espresso md:hidden">
              <FiMenu size={20} />
            </button>
            <h1 className="font-display text-lg text-espresso">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden md:flex items-center gap-1.5 text-xs text-brand-400 hover:text-terracotta transition-colors">
              <FiHome size={13} /> View store
            </Link>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
