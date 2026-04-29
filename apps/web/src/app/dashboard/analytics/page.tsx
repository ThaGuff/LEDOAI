export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Call performance and trends</p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Answer Rate', value: '98.2%', desc: 'Calls answered vs missed' },
          { label: 'Avg. Call Duration', value: '2m 34s', desc: 'Average conversation length' },
          { label: 'Appointment Rate', value: '31%', desc: 'Calls resulting in bookings' },
        ].map((metric) => (
          <div key={metric.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-2">{metric.label}</p>
            <p className="text-4xl font-display font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-400 mt-1">{metric.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Live charts appear once your phone number is connected and receiving calls.</p>
      </div>
    </div>
  )
}
