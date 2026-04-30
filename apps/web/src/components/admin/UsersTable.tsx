'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShieldCheck, Shield } from 'lucide-react'

type AdminUser = {
  id: string
  email: string
  name: string | null
  role: string
  isSuperAdmin: boolean
  organizationName: string | null
  createdAt: string
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function toggleAdmin(id: string, isSuperAdmin: boolean) {
    setBusy(id)
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSuperAdmin: !isSuperAdmin }),
    })
    setBusy(null)
    router.refresh()
  }

  async function remove(id: string) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    setBusy(id)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setBusy(null)
    router.refresh()
  }

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name?.toLowerCase().includes(q)) ||
      (u.organizationName?.toLowerCase().includes(q))
    )
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or organization…"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Organization</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.name || '—'}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{u.organizationName || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                    {u.role}
                  </span>
                  {u.isSuperAdmin && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-ledo-100 text-ledo-700">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleAdmin(u.id, u.isSuperAdmin)}
                    disabled={busy === u.id}
                    className="p-2 text-gray-400 hover:text-ledo-600 hover:bg-ledo-50 rounded-lg disabled:opacity-50"
                    title={u.isSuperAdmin ? 'Revoke admin' : 'Grant admin'}
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(u.id)}
                    disabled={busy === u.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-500">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
