'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Phone, Calendar, BarChart3,
  Settings, Mic, HelpCircle, BookOpen, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/calls', icon: Phone, label: 'Call Logs' },
  { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/dashboard/knowledge', icon: BookOpen, label: 'Knowledge Base' },
  { href: '/dashboard/faqs', icon: HelpCircle, label: 'FAQ Library' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/recordings', icon: Mic, label: 'Recordings' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ledo-600 to-ledo-800 flex items-center justify-center">
          <Phone className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-display font-bold text-gray-900">LEDO AI</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const path = pathname || ''
          const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-ledo-50 text-ledo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(active ? 'text-ledo-600' : 'text-gray-400')}
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
              {item.label}
            </Link>
          )
        })}
        {isSuperAdmin && (
          <Link
            href="/admin"
            className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Shield className="text-gray-400" style={{ width: '1.125rem', height: '1.125rem' }} />
            Admin Console
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-ledo-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-ledo-700 mb-1">Starter Plan</p>
          <p className="text-xs text-ledo-500 mb-3">250 min / month</p>
          <div className="w-full bg-ledo-200 rounded-full h-1.5 mb-3">
            <div className="bg-ledo-600 h-1.5 rounded-full" style={{ width: '34%' }} />
          </div>
          <Link href="/dashboard/settings" className="text-xs font-medium text-ledo-600 hover:underline">
            Upgrade plan →
          </Link>
        </div>
      </div>
    </aside>
  )
}
