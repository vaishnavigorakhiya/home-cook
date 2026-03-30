import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center animate-fade-in">
      <p className="font-display text-[120px] leading-none text-brand-100 select-none">404</p>
      <h1 className="font-display text-3xl text-espresso -mt-4 mb-3">Page not found</h1>
      <p className="text-brand-400 text-sm mb-10 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">Go home</Link>
        <Link to="/shop" className="btn-ghost">Browse shop</Link>
      </div>
    </div>
  )
}
