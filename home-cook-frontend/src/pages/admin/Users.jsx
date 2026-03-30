import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSearch, FiTrash2, FiUser, FiShield } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import useAuthStore from '../../context/authStore'

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [role, setRole]     = useState('')
  const [page, setPage]     = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const qc = useQueryClient()
  const { user: me } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => api.get('/admin/users', { params: { search, role, page } }).then(r => r.data),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['admin-users']); setDeleteId(null) },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl text-espresso">Users</h1>
        <p className="text-sm text-brand-400 mt-0.5">{data?.total || 0} users total</p>
      </div>

      <div className="bg-white border border-brand-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Name or email…" className="input-field pl-9 py-2.5 text-sm" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} className="input-field py-2.5 text-sm w-36 bg-white">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      <div className="bg-white border border-brand-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              {['User', 'Email', 'Phone', 'Role', 'Orders', 'Joined', 'Action'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-widest uppercase text-brand-400 px-5 py-3.5 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-brand-50">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-brand-50 animate-pulse rounded" /></td>)}
                </tr>
              ))
            ) : data?.data?.map(user => (
              <tr key={user.id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-terracotta/10 text-terracotta rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-espresso">{user.name}</span>
                    {user.id === me?.id && <span className="text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5">You</span>}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-brand-500">{user.email}</td>
                <td className="px-5 py-4 text-xs text-brand-400">{user.phone || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 ${user.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-brand-50 text-brand-600'}`}>
                    {user.role === 'admin' ? <FiShield size={10} /> : <FiUser size={10} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs text-brand-500">{user.orders_count}</td>
                <td className="px-5 py-4 text-xs text-brand-400 whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4">
                  {user.role !== 'admin' && user.id !== me?.id && (
                    <button onClick={() => setDeleteId(user.id)} className="text-brand-300 hover:text-red-500 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.last_page > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-brand-100">
            {[...Array(data.last_page)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-xs transition-colors ${page === i + 1 ? 'bg-terracotta text-cream' : 'border border-brand-200 text-espresso hover:border-terracotta'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl text-espresso mb-2">Delete user?</h3>
            <p className="text-sm text-brand-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost py-3 text-xs">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteId)} className="flex-1 bg-red-500 text-white text-xs py-3 tracking-widest uppercase hover:bg-red-600">
                {deleteMut.isLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
