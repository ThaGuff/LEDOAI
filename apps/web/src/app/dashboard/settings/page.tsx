export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure your LEDO AI account</p>
      </div>
      <div className="grid gap-4">
        {[
          { title: 'Phone Setup', desc: 'Connect and configure your Twilio phone number', href: '#phone' },
          { title: 'AI Personality', desc: 'Customize how LEDO AI sounds and responds', href: '#ai' },
          { title: 'Business Hours', desc: 'Set when LEDO AI should answer calls', href: '#hours' },
          { title: 'Call Transfer', desc: 'Configure your live transfer phone number', href: '#transfer' },
          { title: 'Notifications', desc: 'Email and SMS alert preferences', href: '#notifications' },
          { title: 'CRM Integration', desc: 'Connect HubSpot to sync contacts automatically', href: '#crm' },
          { title: 'Billing & Plan', desc: 'Manage your subscription and usage', href: '#billing' },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-ledo-200 hover:shadow-md transition-all group"
          >
            <div>
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <span className="text-gray-400 group-hover:text-ledo-600 transition-colors">→</span>
          </a>
        ))}
      </div>
    </div>
  )
}
