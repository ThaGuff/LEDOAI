'use client'

import { useState } from 'react'
import { SettingsForm } from './SettingsForm'
import { VoiceTester } from './VoiceTester'
import { VOICE_GROUPS } from '@/lib/voices'

type KnowledgeSource = {
  type: 'url' | 'sheet' | 'manual'
  url?: string
  label?: string
}

export type AiPersonalityInitial = {
  aiAgentName: string
  aiVoice: string
  aiLanguage: string
  aiTone: string
  aiResponseLength: string
  aiCreativity: number
  aiCustomInstructions: string
  aiFallbackBehavior: string
  aiUseKnowledgeBase: boolean
  aiKnowledgeSources: KnowledgeSource[]
  aiBusinessAddress: string
  aiBusinessServices: string
  aiBusinessPricing: string
  greeting: string
}

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Polished and business-appropriate' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and conversational' },
  { value: 'empathetic', label: 'Empathetic', desc: 'Caring and understanding' },
  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Upbeat and energetic' },
  { value: 'concise', label: 'Concise', desc: 'Direct and to the point' },
]

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-AU', label: 'English (AU)' },
  { value: 'es-US', label: 'Spanish (US)' },
  { value: 'fr-FR', label: 'French' },
]

export function AiPersonalityForm({ initial }: { initial: AiPersonalityInitial }) {
  const [state, setState] = useState<AiPersonalityInitial>(initial)
  const [newSource, setNewSource] = useState<KnowledgeSource>({ type: 'url', url: '', label: '' })

  function addSource() {
    if (!newSource.url) return
    setState((s) => ({ ...s, aiKnowledgeSources: [...s.aiKnowledgeSources, newSource] }))
    setNewSource({ type: 'url', url: '', label: '' })
  }

  function removeSource(idx: number) {
    setState((s) => ({
      ...s,
      aiKnowledgeSources: s.aiKnowledgeSources.filter((_, i) => i !== idx),
    }))
  }

  return (
    <SettingsForm
      endpoint="/api/settings/ai-personality"
      title="AI Personality"
      description="Customize how LEDO answers calls — like configuring an AI agent in GHL or Twin Agents."
      buildPayload={() => ({ ...state })}
    >
      {/* IDENTITY */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Agent Identity</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Agent name</label>
            <input
              type="text"
              value={state.aiAgentName}
              onChange={(e) => setState({ ...state, aiAgentName: e.target.value })}
              maxLength={40}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
              placeholder="LEDO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Voice</label>
            <select
              value={state.aiVoice}
              onChange={(e) => setState({ ...state, aiVoice: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500 bg-white"
            >
              {VOICE_GROUPS.map((group) => (
                <optgroup key={group.provider} label={group.label}>
                  {group.voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.description}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              OpenAI &amp; ElevenLabs sound the most human. Free StreamElements works without keys.
              Polly plays only on real Twilio calls.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
          <select
            value={state.aiLanguage}
            onChange={(e) => setState({ ...state, aiLanguage: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500 bg-white"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Greeting (first words callers hear)</label>
          <textarea
            value={state.greeting}
            onChange={(e) => setState({ ...state, greeting: e.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Thank you for calling Acme Dental. How can I help you today?"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
        </div>

        <VoiceTester
          voice={state.aiVoice}
          text={state.greeting || `Hi! This is ${state.aiAgentName || 'LEDO'}. How can I help you today?`}
        />
      </section>

      {/* TONE & STYLE */}
      <section className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tone & Style</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Conversation tone</label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setState({ ...state, aiTone: t.value })}
                className={`text-left p-3 border rounded-lg transition-colors ${
                  state.aiTone === t.value
                    ? 'border-ledo-500 bg-ledo-50/50'
                    : 'border-gray-200 hover:border-ledo-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Response length:{' '}
            <span className="font-normal text-gray-500">{state.aiResponseLength}</span>
          </label>
          <div className="flex gap-2">
            {['short', 'medium', 'long'].map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setState({ ...state, aiResponseLength: len })}
                className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                  state.aiResponseLength === len
                    ? 'bg-ledo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Creativity: <span className="font-normal text-gray-500">{state.aiCreativity.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={state.aiCreativity}
            onChange={(e) => setState({ ...state, aiCreativity: parseFloat(e.target.value) })}
            className="w-full accent-ledo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Predictable</span>
            <span>Creative</span>
          </div>
        </div>
      </section>

      {/* CUSTOM INSTRUCTIONS */}
      <section className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Custom Instructions</h3>
        <p className="text-xs text-gray-500">
          Free-form behavioral instructions. The AI will follow these on every call.
        </p>
        <textarea
          value={state.aiCustomInstructions}
          onChange={(e) => setState({ ...state, aiCustomInstructions: e.target.value })}
          rows={6}
          maxLength={4000}
          placeholder="Example: Always confirm the caller's name before booking. Never quote prices over the phone — direct callers to our website. If asked about emergencies, transfer to the on-call number immediately."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ledo-500"
        />
      </section>

      {/* BUSINESS CONTEXT */}
      <section className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Business Context</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business address</label>
          <input
            type="text"
            value={state.aiBusinessAddress}
            onChange={(e) => setState({ ...state, aiBusinessAddress: e.target.value })}
            maxLength={300}
            placeholder="123 Main St, Denver CO 80202"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Services offered</label>
          <textarea
            value={state.aiBusinessServices}
            onChange={(e) => setState({ ...state, aiBusinessServices: e.target.value })}
            rows={3}
            maxLength={2000}
            placeholder="Teeth cleaning, fillings, crowns, root canals, cosmetic dentistry..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Pricing notes</label>
          <textarea
            value={state.aiBusinessPricing}
            onChange={(e) => setState({ ...state, aiBusinessPricing: e.target.value })}
            rows={2}
            maxLength={1500}
            placeholder="Cleanings start at $89. Free consultations. Insurance accepted."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
          />
        </div>
      </section>

      {/* KNOWLEDGE SOURCES */}
      <section className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Knowledge Sources</h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.aiUseKnowledgeBase}
            onChange={(e) => setState({ ...state, aiUseKnowledgeBase: e.target.checked })}
            className="w-4 h-4 accent-ledo-600"
          />
          <span className="text-sm text-gray-900">Use Knowledge Base entries when answering calls</span>
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">External sources</p>
          <p className="text-xs text-gray-500">
            Add a public URL, Google Sheet, or other source. LEDO will pull text from these on demand.
          </p>

          {state.aiKnowledgeSources.map((src, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-xs uppercase font-semibold text-ledo-600 px-2 py-0.5 rounded bg-ledo-100">
                {src.type}
              </span>
              <span className="text-sm text-gray-900 truncate flex-1">{src.label || src.url}</span>
              <button
                type="button"
                onClick={() => removeSource(idx)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2 items-end">
            <select
              value={newSource.type}
              onChange={(e) => setNewSource({ ...newSource, type: e.target.value as KnowledgeSource['type'] })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="url">URL</option>
              <option value="sheet">Google Sheet</option>
              <option value="manual">Note</option>
            </select>
            <input
              type="text"
              value={newSource.url || ''}
              onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              placeholder={
                newSource.type === 'sheet'
                  ? 'https://docs.google.com/spreadsheets/d/.../edit'
                  : 'https://example.com/about'
              }
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ledo-500"
            />
            <button
              type="button"
              onClick={addSource}
              className="px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
            >
              Add
            </button>
          </div>
        </div>
      </section>

      {/* FALLBACK */}
      <section className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Fallback Behavior</h3>
        <p className="text-xs text-gray-500">When the AI can't answer or the caller asks for a human:</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'transfer', l: 'Transfer call' },
            { v: 'voicemail', l: 'Take voicemail' },
            { v: 'end', l: 'Polite goodbye' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setState({ ...state, aiFallbackBehavior: opt.v })}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                state.aiFallbackBehavior === opt.v
                  ? 'bg-ledo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </section>
    </SettingsForm>
  )
}
