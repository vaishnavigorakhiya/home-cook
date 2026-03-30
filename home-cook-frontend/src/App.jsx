import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './context/authStore'

import Layout        from './components/layout/Layout'
import AdminLayout   from './components/layout/AdminLayout'

import HomePage      from './pages/Home'
import ShopPage      from './pages/Shop'
import ProductPage   from './pages/Product'
import CartPage      from './pages/Cart'
import CheckoutPage  from './pages/Checkout'
import OrderSuccess  from './pages/OrderSuccess'
import AccountPage   from './pages/Account'
import OrdersPage    from './pages/Orders'
import OrderDetail   from './pages/OrderDetail'
import WishlistPage  from './pages/Wishlist'
import NotFound      from './pages/NotFound'
import LoginPage     from './pages/auth/Login'
import RegisterPage  from './pages/auth/Register'

import AdminDashboard  from './pages/admin/Dashboard'
import AdminProducts   from './pages/admin/Products'
import AdminOrders     from './pages/admin/Orders'
import AdminUsers      from './pages/admin/Users'
import AdminCategories from './pages/admin/Categories'
import AdminReviews    from './pages/admin/Reviews'
import AdminCoupons    from './pages/admin/Coupons'

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn())
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuthStore()
  if (!isLoggedIn()) return <Navigate to="/login" replace />
  if (!isAdmin())    return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn())
  return isLoggedIn ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public / Customer */}
      <Route element={<Layout />}>
        <Route path="/"            element={<HomePage />} />
        <Route path="/shop"        element={<ShopPage />} />
        <Route path="/shop/:slug"  element={<ProductPage />} />

        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="/cart"     element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/account"  element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index              element={<AdminDashboard />} />
        <Route path="products"    element={<AdminProducts />} />
        <Route path="orders"      element={<AdminOrders />} />
        <Route path="users"       element={<AdminUsers />} />
        <Route path="categories"  element={<AdminCategories />} />
        <Route path="reviews"     element={<AdminReviews />} />
        <Route path="coupons"     element={<AdminCoupons />} />
        <Route path="*"           element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}
