'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const STARTER: Msg = {
  role: 'assistant',
  content: "Hi! I'm LEDO Helper. Ask me anything about setting up your AI receptionist — phone setup, business hours, knowledge base, you name it.",
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([STARTER])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: json.error || 'Something went wrong.' }])
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: json.reply }])
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-ledo-600 text-white shadow-xl hover:bg-ledo-700 flex items-center justify-center transition-all hover:scale-105"
          aria-label="Open assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-ledo-600 to-ledo-700 text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">LEDO Helper</p>
                <p className="text-xs text-ledo-100">Setup &amp; product guide</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-ledo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-ledo-600" />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about LEDO setup…"
                disabled={loading}
                className="flex-1 px-3.5 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-full bg-ledo-600 text-white flex items-center justify-center hover:bg-ledo-700 disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
