import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FiArrowLeft, FiCheck, FiTag, FiX } from 'react-icons/fi'
import api, { PRODUCT_IMAGES } from '../utils/api'
import useCartStore from '../context/cartStore'
import useAuthStore from '../context/authStore'
import toast from 'react-hot-toast'

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir',
  'Ladakh','Chandigarh','Puducherry',
]

const PAYMENT_METHODS = [
  { id: 'cod',      label: 'Cash on delivery', sub: 'Pay when your order arrives' },
  { id: 'upi',      label: 'UPI',              sub: 'GPay, PhonePe, Paytm & more' },
  { id: 'razorpay', label: 'Card / Net banking',sub: 'Visa, Mastercard, RuPay' },
]

const STEPS = ['Cart', 'Delivery', 'Payment', 'Review']

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const { items, subtotal, shipping, total, fetchCart } = useCartStore()
  const { user }  = useAuthStore()

  const [paymentMethod,  setPaymentMethod]  = useState('cod')
  const [loading,        setLoading]        = useState(false)
  const [couponCode,     setCouponCode]     = useState('')
  const [couponLoading,  setCouponLoading]  = useState(false)
  const [appliedCoupon,  setAppliedCoupon]  = useState(null)
  const [discount,       setDiscount]       = useState(0)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      shipping_address: user?.address  || '',
      shipping_city:    user?.city     || '',
      shipping_state:   user?.state    || '',
      shipping_pincode: user?.pincode  || '',
      shipping_phone:   user?.phone    || '',
    }
  })

  useEffect(() => { fetchCart() }, [])

  /* ---------- Coupon ---------- */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        subtotal,
      })
      setAppliedCoupon(res.data.coupon)
      setDiscount(res.data.discount)
      toast.success(res.data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      setAppliedCoupon(null)
      setDiscount(0)
    } finally { setCouponLoading(false) }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
  }

  /* ---------- Place order ---------- */
  const finalTotal = Math.max(0, total - discount)

  const onSubmit = async (data) => {
    if (!items.length) { toast.error('Your cart is empty'); return }
    setLoading(true)
    try {
      const res = await api.post('/orders', {
        ...data,
        payment_method:  paymentMethod,
        coupon_code:     appliedCoupon?.code || null,
        discount_amount: discount,
      })
      toast.success('Order placed successfully!')
      navigate(`/order-success/${res.data.order.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.')
    } finally { setLoading(false) }
  }

  /* ---------- Field wrapper ---------- */
  const Field = ({ label, error, required, children }) => (
    <div>
      <label className="block text-xs tracking-wider uppercase text-brand-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><FiX size={10} />{error}</p>}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 animate-fade-in">

      {/* Back + title */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart" className="text-brand-400 hover:text-terracotta transition-colors p-1">
          <FiArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-2xl md:text-3xl text-espresso">Checkout</h1>
      </div>

      {/* Progress steps */}
      <div className="hidden md:flex items-center gap-2 mb-10">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${i <= 2 ? 'bg-terracotta text-cream' : 'bg-brand-100 text-brand-400'}`}>
              {i < 2 ? <FiCheck size={12} /> : i + 1}
            </div>
            <span className={`text-xs tracking-wide ${i <= 2 ? 'text-espresso font-medium' : 'text-brand-400'}`}>
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-px ${i < 2 ? 'bg-terracotta' : 'bg-brand-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery address */}
            <div className="bg-white border border-brand-100 p-6">
              <h2 className="font-display text-xl text-espresso mb-6 flex items-center gap-2">
                <span className="w-6 h-6 bg-terracotta text-cream text-xs flex items-center justify-center rounded-full font-sans">1</span>
                Delivery address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <Field label="Full address" required error={errors.shipping_address?.message}>
                    <textarea rows={2} {...register('shipping_address', { required: 'Address is required' })}
                      className="input-field resize-none"
                      placeholder="House / Flat no., Street, Area, Locality" />
                  </Field>
                </div>

                <Field label="City" required error={errors.shipping_city?.message}>
                  <input {...register('shipping_city', { required: 'City is required' })}
                    className="input-field" placeholder="Mumbai" />
                </Field>

                <Field label="State" required error={errors.shipping_state?.message}>
                  <select {...register('shipping_state', { required: 'State is required' })}
                    className="input-field bg-white">
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>

                <Field label="Pincode" required error={errors.shipping_pincode?.message}>
                  <input
                    {...register('shipping_pincode', {
                      required: 'Pincode is required',
                      pattern: { value: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pincode' },
                    })}
                    className="input-field" placeholder="400001" maxLength={6} inputMode="numeric" />
                </Field>

                <Field label="Mobile number" required error={errors.shipping_phone?.message}>
                  <input
                    {...register('shipping_phone', {
                      required: 'Phone is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
                    })}
                    className="input-field" placeholder="9876543210" maxLength={10} inputMode="numeric" />
                </Field>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-brand-100 p-6">
              <h2 className="font-display text-xl text-espresso mb-6 flex items-center gap-2">
                <span className="w-6 h-6 bg-terracotta text-cream text-xs flex items-center justify-center rounded-full font-sans">2</span>
                Payment method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.id}
                    className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                      paymentMethod === pm.id
                        ? 'border-terracotta bg-brand-50'
                        : 'border-brand-100 hover:border-brand-300'
                    }`}>
                    <input type="radio" name="payment" value={pm.id}
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="mt-0.5 accent-terracotta" />
                    <div>
                      <p className="text-sm font-medium text-espresso">{pm.label}</p>
                      <p className="text-xs text-brand-400 mt-0.5">{pm.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div className="mt-4 p-4 bg-brand-50 border border-brand-100">
                  <Field label="UPI ID">
                    <input className="input-field bg-white text-sm" placeholder="yourname@upi" />
                  </Field>
                </div>
              )}
            </div>

            {/* Order notes */}
            <div className="bg-white border border-brand-100 p-6">
              <h2 className="font-display text-xl text-espresso mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-brand-100 text-brand-500 text-xs flex items-center justify-center rounded-full font-sans">3</span>
                Order notes
                <span className="text-sm font-sans font-normal text-brand-300">(optional)</span>
              </h2>
              <textarea rows={3} {...register('notes')}
                className="input-field resize-none w-full text-sm"
                placeholder="Any special instructions for delivery or packaging…" />
            </div>
          </div>

          {/* ── RIGHT COLUMN: Order summary ── */}
          <div>
            <div className="bg-white border border-brand-100 p-6 sticky top-24 space-y-6">
              <h2 className="font-display text-xl text-espresso">Order summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide pr-1">
                {items.map(item => {
                  const p = item.product
                  const img = p.image
                    ? `http://localhost:8000/storage/${p.image}`
                    : (PRODUCT_IMAGES[p.category?.slug] || PRODUCT_IMAGES.default)
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-brand-100 flex-shrink-0 overflow-hidden">
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-espresso truncate">{p.name}</p>
                        <p className="text-[11px] text-brand-400 mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-xs font-medium text-terracotta mt-0.5">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Coupon */}
              <div className="border-t border-brand-100 pt-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <FiTag size={13} className="text-green-600" />
                      <span className="text-xs font-medium text-green-700 font-mono">{appliedCoupon.code}</span>
                      <span className="text-xs text-green-600">applied</span>
                    </div>
                    <button onClick={removeCoupon} className="text-green-400 hover:text-red-500 transition-colors">
                      <FiX size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Coupon code"
                      className="input-field flex-1 text-xs py-2.5 font-mono uppercase placeholder:normal-case placeholder:font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn-ghost text-xs px-4 py-2.5 whitespace-nowrap disabled:opacity-40"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-brand-100 pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-500">Subtotal</span>
                  <span className="text-espresso">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-500">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-espresso'}>
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600 font-medium">− ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base pt-3 border-t border-brand-100">
                  <span className="text-espresso">Total</span>
                  <span className="text-terracotta text-xl font-display">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-[10px] text-green-600 text-right">✓ Free shipping applied</p>
                )}
              </div>

              {/* Place order CTA */}
              <button
                type="submit"
                disabled={loading || !items.length}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Placing order…
                  </>
                ) : (
                  `Place order · ₹${finalTotal.toLocaleString('en-IN')}`
                )}
              </button>

              <p className="text-[10px] text-brand-400 text-center leading-relaxed">
                By placing an order you agree to our{' '}
                <a href="#" className="text-terracotta hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-terracotta hover:underline">Return Policy</a>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
