'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, HelpCircle } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  active: boolean
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.json())
      .then(d => { setFaqs(d.faqs || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const addFAQ = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    })
    const data = await res.json()
    if (data.faq) {
      setFaqs(prev => [...prev, data.faq])
      setQuestion('')
      setAnswer('')
      setShowForm(false)
    }
  }

  const deleteFAQ = async (id: string) => {
    await fetch('/api/faqs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFaqs(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">FAQ Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">Train LEDO AI with your common questions and answers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ledo-600 text-white text-sm font-medium rounded-lg hover:bg-ledo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-ledo-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">New FAQ</h3>
          <form onSubmit={addFAQ} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Question</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                placeholder="What are your business hours?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Answer</label>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
                placeholder="We're open Monday through Friday from 9am to 6pm..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-ledo-600 text-white text-sm font-medium rounded-lg hover:bg-ledo-700">Save FAQ</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-gray-700 mb-1">No FAQs yet</h3>
            <p className="text-sm text-gray-400">Add common questions so LEDO AI can answer them instantly.</p>
          </div>
        ) : faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1.5">{faq.question}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-ledo-600 hover:bg-ledo-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFAQ(faq.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
