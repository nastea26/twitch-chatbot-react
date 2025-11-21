import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ViewCommand() {
  const { trigger } = useParams()   
  const navigate = useNavigate()

  const decodedTrigger = decodeURIComponent(trigger) 

  const [newTrigger, setNewTrigger] = useState(decodedTrigger)
  const [response, setResponse] = useState('')
  const [aliases, setAliases] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/commands/${encodeURIComponent(decodedTrigger)}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const cmd = await res.json()
        setNewTrigger(cmd.trigger)
        setResponse(cmd.response)
        setAliases((cmd.aliases || []).join(','))
        setActive(cmd.active)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [decodedTrigger])

  const handleUpdate = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newTrigger.trim()) {
      setError('Trigger cannot be empty')
      return
    }
    if (!response.trim()) {
      setError('Response cannot be empty')
      return
    }

    const aliasArr = aliases
      .split(',')
      .map(a => a.trim())
      .filter(a => a)

    setLoading(true)
    try {
      const res = await fetch(`/api/commands/${encodeURIComponent(decodedTrigger)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newTrigger: newTrigger.trim(),
          response: response.trim(),
          aliases: aliasArr,
          active
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await res.json()
      // Always return to dashboard after save
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete command ${decodedTrigger}?`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/commands/${encodeURIComponent(decodedTrigger)}`, {
        method: 'DELETE'
      })
      if (res.status !== 204) throw new Error(`HTTP ${res.status}`)
      navigate('/dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow ">
      <h2 className="text-2xl font-bold mb-4">Edit Command {newTrigger}</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Trigger */}
        <div>
          <label className="block font-medium">Trigger</label>
          <input
            type="text"
            value={newTrigger}
            onChange={e => setNewTrigger(e.target.value)}
            disabled={loading}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Response */}
        <div>
          <label className="block font-medium">Response</label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={3}
            disabled={loading}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Aliases */}
        <div>
          <label className="block font-medium">
            Aliases <span className="text-sm text-gray-500">(comma‑separated)</span>
          </label>
          <input
            type="text"
            value={aliases}
            onChange={e => setAliases(e.target.value)}
            disabled={loading}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            disabled={loading}
            className="h-5 w-5"
          />
          <label className="font-medium">Active</label>
        </div>

        {/* Feedback */}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-500"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
