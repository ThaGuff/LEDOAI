import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { Users, Building2, Shield, BarChart3, ArrowLeft } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-7 h-7 text-ledo-400" />
            <div>
              <p className="text-lg font-display font-bold">LEDO Admin</p>
              <p className="text-xs text-gray-400">Developer console — {admin.email}</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
        <nav className="max-w-7xl mx-auto px-6 flex gap-1">
          <AdminNavLink href="/admin" icon={BarChart3}>Overview</AdminNavLink>
          <AdminNavLink href="/admin/users" icon={Users}>Users</AdminNavLink>
          <AdminNavLink href="/admin/organizations" icon={Building2}>Organizations</AdminNavLink>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

function AdminNavLink({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: typeof Users }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-t-lg inline-flex items-center gap-2 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  )
}
