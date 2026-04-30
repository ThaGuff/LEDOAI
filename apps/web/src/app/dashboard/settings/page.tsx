import Link from 'next/link'
import { Phone, Bot, Clock, PhoneForwarded, Bell, Plug, CreditCard } from 'lucide-react'

const items = [
  { title: 'Phone Setup', desc: 'Connect and configure your Twilio phone number', href: '/dashboard/settings/phone', icon: Phone },
  { title: 'AI Personality', desc: 'Customize how LEDO AI sounds and responds', href: '/dashboard/settings/ai', icon: Bot },
  { title: 'Business Hours', desc: 'Set when LEDO AI should answer calls', href: '/dashboard/settings/hours', icon: Clock },
  { title: 'Call Transfer', desc: 'Configure your live transfer phone number', href: '/dashboard/settings/transfer', icon: PhoneForwarded },
  { title: 'Notifications', desc: 'Email and SMS alert preferences', href: '/dashboard/settings/notifications', icon: Bell },
  { title: 'CRM Integration', desc: 'Connect HubSpot to sync contacts automatically', href: '/dashboard/settings/crm', icon: Plug },
  { title: 'Billing & Plan', desc: 'Manage your subscription and usage', href: '/dashboard/settings/billing', icon: CreditCard },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure your LEDO AI account</p>
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-ledo-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-ledo-50 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-ledo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
            <span className="text-gray-400 group-hover:text-ledo-600 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
