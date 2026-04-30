'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, FileText, Trash2, Plus, Loader2 } from 'lucide-react'

type Item = {
  id: string
  title: string
  content: string
  type: string
  sourceUrl: string | null
  active: boolean
  createdAt: string
}

export function KnowledgeManager({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [tab, setTab] = useState<'manual' | 'scrape'>('manual')

  // manual entry
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savingManual, setSavingManual] = useState(false)

  // scrape
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)

  const [error, setError] = useState<string | null>(null)

  async function addManual() {
    if (!title.trim() || !content.trim()) return
    setSavingManual(true)
    setError(null)
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type: 'manual' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')
      setItems((s) => [json.item, ...s])
      setTitle('')
      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingManual(false)
    }
  }

  async function scrapeWebsite() {
    if (!scrapeUrl.trim()) return
    setScraping(true)
    setError(null)
    try {
      const res = await fetch('/api/knowledge/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to scrape')
      setItems((s) => [json.item, ...s])
      setScrapeUrl('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape')
    } finally {
      setScraping(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this knowledge item?')) return
    const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((s) => s.filter((i) => i.id !== id))
      router.refresh()
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/knowledge/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    if (res.ok) {
      setItems((s) => s.map((i) => (i.id === id ? { ...i, active } : i)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'manual' ? 'bg-ledo-50 text-ledo-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Manual entry
          </button>
          <button
            type="button"
            onClick={() => setTab('scrape')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'scrape' ? 'bg-ledo-50 text-ledo-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Globe className="w-4 h-4 inline mr-2" />
            Scrape website
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {tab === 'manual' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Service hours, Pricing, Office location"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter information that LEDO AI should reference when answering caller questions..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
              />
            </div>
            <button
              type="button"
              onClick={addManual}
              disabled={savingManual || !title.trim() || !content.trim()}
              className="px-5 py-2.5 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {savingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add to knowledge base
            </button>
          </div>
        )}

        {tab === 'scrape' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
              <input
                type="url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                We&apos;ll fetch up to 8 pages from your site and extract the text content.
              </p>
            </div>
            <button
              type="button"
              onClick={scrapeWebsite}
              disabled={scraping || !scrapeUrl.trim()}
              className="px-5 py-2.5 bg-ledo-600 text-white text-sm font-semibold rounded-lg hover:bg-ledo-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {scraping ? 'Scraping…' : 'Scrape website'}
            </button>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-900 mb-3">
          {items.length} item{items.length === 1 ? '' : 's'} in your knowledge base
        </p>
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">
            No knowledge yet. Add some content above.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'website' ? (
                        <Globe className="w-4 h-4 text-ledo-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-ledo-600" />
                      )}
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{item.content.slice(0, 240)}</p>
                    {item.sourceUrl && (
                      <p className="text-xs text-gray-400 mt-1.5 truncate">{item.sourceUrl}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(e) => toggleActive(item.id, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-ledo-600 focus:ring-ledo-500"
                      />
                      <span className="text-xs text-gray-600">Active</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
