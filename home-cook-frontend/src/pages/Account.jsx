import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiUser, FiLock, FiPackage, FiSave } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Chandigarh','Puducherry']

export default function AccountPage() {
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone, address: user?.address, city: user?.city, state: user?.state, pincode: user?.pincode },
  })

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors }, reset: resetPwd } = useForm()

  const onProfile = async (data) => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', data)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const onPassword = async (data) => {
    setSaving(true)
    try {
      await api.put('/auth/change-password', data)
      toast.success('Password changed!')
      resetPwd()
    } catch (err) {
      toast.error(err.response?.data?.errors?.current_password?.[0] || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-terracotta text-cream flex items-center justify-center font-display text-xl rounded-full">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl text-espresso">{user?.name}</h1>
          <p className="text-sm text-brand-400">{user?.email}</p>
        </div>
        <Link to="/orders" className="ml-auto btn-ghost flex items-center gap-2 text-xs py-2.5">
          <FiPackage size={14} /> My orders
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-brand-100 mb-8">
        {[['profile', FiUser, 'Profile'], ['password', FiLock, 'Password']].map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm transition-colors border-b-2 -mb-px ${tab === id ? 'border-terracotta text-terracotta' : 'border-transparent text-brand-400 hover:text-espresso'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSubmit(onProfile)} className="bg-white border border-brand-100 p-6">
          <h2 className="font-display text-xl text-espresso mb-6">Personal information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="md:col-span-2">
              <Field label="Full name" error={errors.name?.message}>
                <input {...register('name', { required: 'Name is required' })} className="input-field" />
              </Field>
            </div>
            <Field label="Email">
              <input value={user?.email} disabled className="input-field bg-brand-50 text-brand-400 cursor-not-allowed" />
            </Field>
            <Field label="Phone number">
              <input {...register('phone')} className="input-field" placeholder="9876543210" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <textarea rows={2} {...register('address')} className="input-field resize-none" placeholder="House / Flat, Street, Locality" />
              </Field>
            </div>
            <Field label="City">
              <input {...register('city')} className="input-field" placeholder="Mumbai" />
            </Field>
            <Field label="State">
              <select {...register('state')} className="input-field bg-white">
                <option value="">Select state</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Pincode">
              <input {...register('pincode')} className="input-field" placeholder="400001" />
            </Field>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <FiSave size={14} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePwd(onPassword)} className="bg-white border border-brand-100 p-6">
          <h2 className="font-display text-xl text-espresso mb-6">Change password</h2>
          <div className="space-y-5 max-w-sm">
            <Field label="Current password" error={pwdErrors.current_password?.message}>
              <input type="password" {...regPwd('current_password', { required: 'Required' })} className="input-field" />
            </Field>
            <Field label="New password" error={pwdErrors.password?.message}>
              <input type="password" {...regPwd('password', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })} className="input-field" />
            </Field>
            <Field label="Confirm new password" error={pwdErrors.password_confirmation?.message}>
              <input type="password" {...regPwd('password_confirmation', { required: 'Required' })} className="input-field" />
            </Field>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiLock size={14} /> {saving ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
