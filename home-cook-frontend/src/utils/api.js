import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hac_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hac_token')
      localStorage.removeItem('hac_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80'
  if (path.startsWith('http')) return path
  return `http://localhost:8000/storage/${path}`
}

export const PRODUCT_IMAGES = {
  default:       'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
  cookware:      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
  ceramics:      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
  boards:        'https://images.unsplash.com/photo-1593759608142-e9b4d7d7e92c?w=600&q=80',
  glassware:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  utensils:      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
  storage:       'https://images.unsplash.com/photo-1614963590047-d5a32c9aeedd?w=600&q=80',
}

export const CATEGORY_IMAGES = {
  cookware:        'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=400&q=80',
  ceramics:        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80',
  'cutting-boards':'https://images.unsplash.com/photo-1593759608142-e9b4d7d7e92c?w=400&q=80',
  glassware:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  utensils:        'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
  storage:         'https://images.unsplash.com/photo-1614963590047-d5a32c9aeedd?w=400&q=80',
}
