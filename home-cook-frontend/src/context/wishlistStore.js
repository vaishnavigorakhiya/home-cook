import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useWishlistStore = create((set, get) => ({
  items:   [],
  loading: false,

  fetchWishlist: async () => {
    try {
      set({ loading: true })
      const res = await api.get('/wishlist')
      set({ items: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  toggle: async (productId) => {
    const res = await api.post('/wishlist/toggle', { product_id: productId })
    toast.success(res.data.message)
    get().fetchWishlist()
    return res.data.wishlisted
  },

  isWishlisted: (productId) => get().items.some(p => p.id === productId),
}))

export default useWishlistStore
