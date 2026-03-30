import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useCartStore = create((set, get) => ({
  items:    [],
  subtotal: 0,
  shipping: 0,
  total:    0,
  count:    0,
  loading:  false,

  fetchCart: async () => {
    try {
      set({ loading: true })
      const res = await api.get('/cart')
      set({ ...res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity })
    toast.success('Added to cart')
    get().fetchCart()
  },

  updateQuantity: async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity })
    get().fetchCart()
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    toast.success('Item removed')
    get().fetchCart()
  },

  clearCart: async () => {
    await api.delete('/cart')
    set({ items: [], subtotal: 0, shipping: 0, total: 0, count: 0 })
  },
}))

export default useCartStore
