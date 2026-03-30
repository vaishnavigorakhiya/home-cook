import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user:  JSON.parse(localStorage.getItem('hac_user') || 'null'),
  token: localStorage.getItem('hac_token') || null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    const res = await api.post('/auth/login', { email, password })
    const { user, token } = res.data
    localStorage.setItem('hac_token', token)
    localStorage.setItem('hac_user', JSON.stringify(user))
    set({ user, token, loading: false })
    return user
  },

  register: async (data) => {
    set({ loading: true })
    const res = await api.post('/auth/register', data)
    const { user, token } = res.data
    localStorage.setItem('hac_token', token)
    localStorage.setItem('hac_user', JSON.stringify(user))
    set({ user, token, loading: false })
    return user
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('hac_token')
    localStorage.removeItem('hac_user')
    set({ user: null, token: null })
  },

  updateUser: (user) => {
    localStorage.setItem('hac_user', JSON.stringify(user))
    set({ user })
  },

  isAdmin: () => get().user?.role === 'admin',
  isLoggedIn: () => !!get().token,
}))

export default useAuthStore
