import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import useAuthStore from '../../context/authStore'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate    = useNavigate()
  const { register: registerUser } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const pwd = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await registerUser(data)
      toast.success(`Welcome to Home & Cook, ${user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs?.email) toast.error(errs.email[0])
      else toast.error('Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] grid md:grid-cols-2 animate-fade-in">
      <div className="hidden md:block relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&q=80" alt="Ceramics" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/50" />
        <div className="absolute bottom-16 left-10 right-10">
          <p className="font-display text-3xl text-cream mb-3">Join the<br />Home &amp; Cook family</p>
          <p className="text-brand-300 text-sm">Get access to exclusive deals and new arrivals.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-8 py-16 bg-cream">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link to="/" className="font-display text-xl text-espresso block mb-6">
              Home <span className="text-terracotta">&</span> Cook
            </Link>
            <h2 className="font-display text-2xl text-espresso mb-1">Create account</h2>
            <p className="text-sm text-brand-400">Already have one? <Link to="/login" className="text-terracotta hover:underline">Sign in</Link></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Full name</label>
              <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                className="input-field" placeholder="Priya Sharma" autoComplete="name" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Email address</label>
              <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })}
                className="input-field" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Phone number <span className="text-brand-300">(optional)</span></label>
              <input {...register('phone', { pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' } })}
                className="input-field" placeholder="9876543210" maxLength={10} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
                  className="input-field pr-10" placeholder="Min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-terracotta">
                  {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">Confirm password</label>
              <input type="password"
                {...register('password_confirmation', { required: 'Please confirm your password', validate: v => v === pwd || 'Passwords do not match' })}
                className="input-field" placeholder="Repeat password" autoComplete="new-password" />
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center disabled:opacity-60">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>

            <p className="text-xs text-brand-400 text-center">
              By creating an account you agree to our{' '}
              <a href="#" className="text-terracotta hover:underline">Terms of Service</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
