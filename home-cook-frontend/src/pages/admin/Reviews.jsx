import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiStar, FiCheck, FiTrash2 } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminReviews() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('pending')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status, page],
    queryFn: () => api.get('/admin/reviews', { params: { status, page } }).then(r => r.data),
  })

  const approveMut = useMutation({
    mutationFn: (id) => api.patch(`/admin/reviews/${id}/approve`),
    onSuccess: () => { toast.success('Review approved'); qc.invalidateQueries(['admin-reviews']) },
  })

  const rejectMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries(['admin-reviews']) },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl text-espresso">Reviews</h1>
        <p className="text-sm text-brand-400 mt-0.5">{data?.total || 0} reviews</p>
      </div>

      {/* Tab filter */}
      <div className="flex gap-0 border-b border-brand-100">
        {[['pending', 'Pending approval'], ['approved', 'Approved'], ['', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => { setStatus(val); setPage(1) }}
            className={`px-5 py-3 text-sm border-b-2 -mb-px transition-colors ${status === val ? 'border-terracotta text-terracotta' : 'border-transparent text-brand-400 hover:text-espresso'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-brand-50 animate-pulse" />)
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 text-brand-400 text-sm">No reviews found.</div>
        ) : data?.data?.map(review => (
          <div key={review.id} className="bg-white border border-brand-100 p-5 flex gap-5">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-terracotta/10 text-terracotta text-xs rounded-full flex items-center justify-center font-medium">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-espresso">{review.user?.name}</span>
                    <span className="text-xs text-brand-400">{review.user?.email}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <FiStar key={i} size={12} className={i <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-brand-200'} />
                    ))}
                    <span className="text-xs text-brand-400 ml-1">{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 tracking-wide ${review.is_approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <p className="text-xs text-brand-400 mb-1">
                on <span className="font-medium text-espresso">{review.product?.name}</span>
              </p>
              {review.title && <p className="text-sm font-medium text-espresso mb-1">{review.title}</p>}
              {review.body && <p className="text-sm text-brand-600">{review.body}</p>}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              {!review.is_approved && (
                <button onClick={() => approveMut.mutate(review.id)}
                  className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-2 hover:bg-green-100 transition-colors">
                  <FiCheck size={12} /> Approve
                </button>
              )}
              <button onClick={() => rejectMut.mutate(review.id)}
                className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-3 py-2 hover:bg-red-100 transition-colors">
                <FiTrash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {data?.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(data.last_page)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 text-xs ${page === i + 1 ? 'bg-terracotta text-cream' : 'border border-brand-200 text-espresso hover:border-terracotta'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
