import Link from 'next/link'
import { Phone, Calendar, MessageSquare, BarChart3, Shield, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ledo-600 to-ledo-800 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gray-900">LEDO AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
              <Link href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link href="/auth/signup" className="inline-flex items-center gap-2 px-4 py-2 bg-ledo-600 text-white text-sm font-medium rounded-lg hover:bg-ledo-700 transition-colors">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-ledo-950 via-ledo-900 to-ledo-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ledo-500/20 border border-ledo-400/30 rounded-full text-ledo-300 text-sm font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Voice Answering
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Never Miss<br />
            <span className="text-gradient bg-gradient-to-r from-ledo-300 to-purple-300">Another Call</span>
          </h1>
          <p className="text-xl text-ledo-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            LEDO AI answers every inbound call, books appointments, captures leads, and transfers hot callers — all automatically, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ledo-900 font-semibold rounded-xl hover:bg-ledo-50 transition-all shadow-lg hover:shadow-xl text-lg">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-ledo-700/50 text-white font-semibold rounded-xl border border-ledo-600 hover:bg-ledo-700 transition-all text-lg">
              See It In Action
            </Link>
          </div>
          <p className="text-ledo-400 text-sm mt-6">No credit card required · 14-day free trial · Setup in 5 minutes</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Calls Answered', value: '2M+' },
              { label: 'Appointments Booked', value: '500K+' },
              { label: 'Businesses Served', value: '3,000+' },
              { label: 'Avg. Response Time', value: '<1s' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-display font-bold text-ledo-700">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Everything your business needs</h2>
            <p className="text-xl text-gray-500">One AI receptionist that never sleeps</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Phone,
                title: 'Inbound Call Answering',
                description: 'Never miss a customer call. LEDO answers instantly with a natural-sounding AI voice trained on your business.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Calendar,
                title: 'Appointment Booking',
                description: 'Automatically book appointments into your calendar during the call. Syncs with Google Calendar.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: MessageSquare,
                title: 'FAQ Handling',
                description: 'Train LEDO on your common questions. Instantly answer hours, pricing, location, and more.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: ArrowRight,
                title: 'Live Call Transfer',
                description: 'Warm transfer calls to your team when a human touch is needed. Never leave customers hanging.',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: BarChart3,
                title: 'Call Analytics',
                description: 'Every call logged with transcript, summary, and recording. Know exactly what customers are asking.',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: Shield,
                title: 'SMS & Email Alerts',
                description: 'Get instant notifications for new voicemails, appointments, and important calls via SMS or email.',
                color: 'bg-teal-50 text-teal-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-500">Start free, scale as you grow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: '/month',
                description: 'Perfect for solo businesses',
                features: ['250 minutes/month', '1 phone number', 'FAQ handling', 'Email notifications', 'Call transcripts'],
                cta: 'Start Free Trial',
                featured: false,
              },
              {
                name: 'Professional',
                price: '$149',
                period: '/month',
                description: 'For growing businesses',
                features: ['1,000 minutes/month', '3 phone numbers', 'Appointment booking', 'SMS notifications', 'CRM integration', 'Call recordings', 'Live transfer'],
                cta: 'Start Free Trial',
                featured: true,
              },
              {
                name: 'Business',
                price: '$349',
                period: '/month',
                description: 'For high-volume teams',
                features: ['5,000 minutes/month', 'Unlimited numbers', 'Everything in Pro', 'Priority support', 'Custom AI voice', 'API access', 'White-label option'],
                cta: 'Contact Sales',
                featured: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.featured ? 'bg-ledo-700 text-white shadow-2xl scale-105' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="mb-6">
                  {plan.featured && <span className="text-xs font-semibold bg-ledo-400/30 text-ledo-100 px-3 py-1 rounded-full mb-3 inline-block">Most Popular</span>}
                  <h3 className={`text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.featured ? 'text-ledo-200' : 'text-gray-500'}`}>{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-4xl font-display font-bold ${plan.featured ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.featured ? 'text-ledo-200' : 'text-gray-500'}`}>{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.featured ? 'text-ledo-300' : 'text-ledo-600'}`} />
                      <span className={`text-sm ${plan.featured ? 'text-ledo-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${plan.featured ? 'bg-white text-ledo-700 hover:bg-ledo-50' : 'bg-ledo-600 text-white hover:bg-ledo-700'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Loved by businesses everywhere</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', business: 'Dental Practice', text: 'LEDO books 40+ appointments per week without my staff lifting a finger. It pays for itself.' },
              { name: 'James K.', business: 'Plumbing Company', text: "We used to lose after-hours leads constantly. Now LEDO captures every single one and sends us the summary." },
              { name: 'Priya L.', business: 'Law Office', text: "Our clients love that someone always answers. LEDO handles intake perfectly and transfers urgent calls." },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-ledo-900 to-ledo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">Ready to never miss a call again?</h2>
          <p className="text-xl text-ledo-200 mb-10">Join thousands of businesses using LEDO AI to capture every lead and book more appointments.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-ledo-800 font-bold rounded-xl text-lg hover:bg-ledo-50 transition-all shadow-lg">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-ledo-400 text-sm mt-4">14 days free · No credit card · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-ledo-600 flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white font-bold">LEDO AI</span>
              </div>
              <p className="text-sm leading-relaxed">AI voice answering for modern businesses. Never miss a call again.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            © 2025 LEDO AI. All rights reserved. · ledo.ai
          </div>
        </div>
      </footer>
    </div>
  )
}
