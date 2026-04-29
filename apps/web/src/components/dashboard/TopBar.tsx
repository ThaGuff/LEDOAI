'use client'
import { Bell, Search } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface TopBarProps {
  user: { name?: string | null; email?: string; image?: string | null }
}

export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search calls, contacts..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-ledo-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-9 h-9 rounded-full bg-ledo-100 flex items-center justify-center text-ledo-700 font-semibold text-sm hover:bg-ledo-200 transition-colors"
            title="Sign out"
          >
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  )
}
