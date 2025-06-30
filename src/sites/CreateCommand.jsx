// src/components/CreateCommand.jsx
import React, { useState } from 'react'
import '../index.css'

export default function CreateCommand() {
  const [trigger, setTrigger]   = useState('')
  const [response, setResponse] = useState('')
  const [aliases, setAliases]   = useState('')      // comma‑separated
  const [active, setActive]     = useState(true)    // toggle
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!trigger.trim() || !response.trim()) {
      setError('Trigger and response are required.')
      return
    }

    const aliasArr = aliases
      .split(',')
      .map(a => a.trim())
      .filter(a => a)

    setLoading(true)
    try {
      const res = await fetch('/api/commands', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: trigger.trim(),
          response: response.trim(),
          aliases: aliasArr,
          active
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Create failed')
      }
      setSuccess(`Created ${trigger}`)
      setTrigger(''); setResponse(''); setAliases(''); setActive(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">New Chat Command</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trigger */}
        <div>
          <label htmlFor="trigger">Trigger</label>
          <input
            id="trigger" type="text" value={trigger}
            onChange={e => setTrigger(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          />
        </div>

        {/* Response */}
        <div>
          <label htmlFor="response">Response</label>
          <textarea
            id="response" value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          />
        </div>

        {/* Aliases */}
        <div>
          <label htmlFor="aliases">Aliases <span className="text-sm text-gray-500">(comma‑separated)</span></label>
          <input
            id="aliases" type="text" value={aliases}
            onChange={e => setAliases(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <input
            id="active" type="checkbox" checked={active}
            onChange={e => setActive(e.target.checked)}
            className="h-5 w-5"
            disabled={loading}
          />
          <label htmlFor="active">Active</label>
        </div>

        {error   && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500"
        >
          {loading ? 'Creating…' : 'Create Command'}
        </button>
      </form>
    </div>
  )
}