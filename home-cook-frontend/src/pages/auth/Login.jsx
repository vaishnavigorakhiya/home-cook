import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/'
  const { login } = useAuthStore()
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.errors?.email?.[0] || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] grid md:grid-cols-2 animate-fade-in">
      {/* Left image */}
      <div className="hidden md:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=80" alt="Kitchen" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/50" />
        <div className="absolute bottom-16 left-10 right-10">
          <p className="font-display text-3xl text-cream mb-3">Welcome back to<br />Home &amp; Cook</p>
          <p className="text-brand-300 text-sm">Your kitchen deserves the best tools.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-8 py-16 bg-cream">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="font-display text-xl text-espresso block mb-6">
              Home <span className="text-terracotta">&</span> Cook
            </Link>
            <h2 className="font-display text-2xl text-espresso mb-1">Sign in</h2>
            <p className="text-sm text-brand-400">Don't have an account? <Link to="/register" className="text-terracotta hover:underline">Create one</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Email address</label>
              <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                className="input-field" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs tracking-wider uppercase text-brand-500">Password</label>
                <a href="#" className="text-xs text-terracotta hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} {...register('password', { required: 'Password is required' })}
                  className="input-field pr-10" placeholder="Your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-terracotta transition-colors">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-brand-50 border border-brand-100 text-xs text-brand-500">
            <p className="font-medium mb-1 text-brand-700">Demo credentials:</p>
            <p>Admin: admin@homeandcook.in / admin@123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
