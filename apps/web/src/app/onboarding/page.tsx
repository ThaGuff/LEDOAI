'use client'
import { useState } from 'react'
import { Phone, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const steps = [
  { id: 1, title: 'Business Info', desc: 'Tell us about your business' },
  { id: 2, title: 'Phone Setup', desc: 'Connect your AI phone number' },
  { id: 3, title: 'Add FAQs', desc: 'Train your AI receptionist' },
  { id: 4, title: "You're Live!", desc: 'Start answering calls' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-ledo-600 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">LEDO AI</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s.id < step ? 'bg-ledo-600 text-white' : s.id === step ? 'bg-ledo-600 text-white ring-4 ring-ledo-100' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s.id < step ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <p className="text-xs mt-1.5 text-gray-500 w-20 text-center hidden sm:block">{s.title}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-16 sm:w-24 mx-1 ${s.id < step ? 'bg-ledo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Tell us about your business</h2>
              <p className="text-sm text-gray-500 mb-6">This helps LEDO AI answer questions accurately.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                    placeholder="Acme Dental Clinic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business type</label>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                  >
                    <option value="">Select a category...</option>
                    {['Healthcare / Medical', 'Dental', 'Legal / Law Firm', 'Real Estate', 'Home Services', 'Beauty / Salon', 'Restaurant', 'Retail', 'Financial Services', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your existing phone number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                    placeholder="+1 (555) 000-0000"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Forward this to your LEDO AI number, or we&apos;ll provide a new one.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Your AI Phone Number</h2>
              <p className="text-sm text-gray-500 mb-6">We&apos;ve reserved a number. Forward your existing number to start receiving AI-answered calls.</p>
              <div className="bg-ledo-50 rounded-xl p-6 text-center mb-6">
                <p className="text-sm text-ledo-600 font-medium mb-2">Your LEDO AI Number</p>
                <p className="text-3xl font-display font-bold text-ledo-800">+1 (888) LEDO-AI</p>
                <p className="text-xs text-ledo-500 mt-2">Assigned after completing setup in Settings → Phone</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-2">How to forward your calls:</p>
                <ol className="space-y-1 list-decimal list-inside text-sm">
                  <li>Log into your current phone carrier portal</li>
                  <li>Enable call forwarding to your LEDO AI number</li>
                  <li>Or port your existing number directly to LEDO AI</li>
                </ol>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Add your first FAQ</h2>
              <p className="text-sm text-gray-500 mb-6">LEDO AI will use these to answer common questions instantly during calls.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Question</label>
                  <input
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                    defaultValue="What are your business hours?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Answer</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                    defaultValue="We're open Monday through Friday from 9am to 6pm, and Saturday from 10am to 4pm."
                  />
                </div>
                <p className="text-xs text-gray-400">You can add more FAQs from the dashboard at any time.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-display font-bold text-gray-900 mb-2">You&apos;re all set!</h2>
              <p className="text-gray-500 mb-8">LEDO AI is ready to answer your calls. Forward your number and your AI receptionist goes live instantly.</p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3 bg-ledo-600 text-white font-semibold rounded-xl hover:bg-ledo-700 transition-colors"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {step < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              ) : <div />}
              <button
                onClick={() => setStep(s => s + 1)}
                className="inline-flex items-center gap-2 px-6 py-2 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700"
              >
                {step === 3 ? 'Finish Setup' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
