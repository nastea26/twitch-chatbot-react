import React, { useRef, useEffect, useState, useCallback } from 'react'

export default function TwitchChat({ className }) {
  const [messages, setMessages] = useState([])
  const [channel, setChannel] = useState('')
  const [channelInput, setChannelInput] = useState('')
  const ws = useRef(null)

  // Fetch initial channel on mount
  useEffect(() => {
    fetch('/api/channel')
      .then(res => res.json())
      .then(data => {
        if (data.channel) {
          setChannel(data.channel)
          setChannelInput(data.channel)
        }
      })
      .catch(console.error)
  }, [])

  // Tell backend to switch channel on channel change
  useEffect(() => {
    if (!channel) return
    fetch('/api/channel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    }).catch(console.error)
    setMessages([]) // reset messages on channel switch
  }, [channel])

  // Debounce channel input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = channelInput.trim()
      if (trimmed && trimmed !== channel) {
        setChannel(trimmed)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [channelInput, channel])

  // Setup WebSocket once
  useEffect(() => {
    if (ws.current) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://localhost:3000`)

    socket.onopen = () => {
      console.log('WebSocket connected')
    }
    socket.onclose = () => {
      console.log('WebSocket disconnected')
      ws.current = null
    }
    socket.onerror = (err) => {
      console.error('WebSocket error:', err)
    }
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        console.log('Received message:', msg)  // Check message structure here

        setMessages((msgs) => {
          const newMsgs = [...msgs, msg]
          return newMsgs.length > 200 ? newMsgs.slice(newMsgs.length - 200) : newMsgs
        })
      } catch {
        // ignore invalid JSON
      }
    }

    ws.current = socket

    return () => {
      socket.close()
      ws.current = null
    }
  }, [])

  // Scroll logic (unchanged)
  const containerRef = useRef(null)
  const [autoscroll, setAutoscroll] = useState(true)

  useEffect(() => {
    if (autoscroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, autoscroll])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10
    setAutoscroll(atBottom)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    el?.addEventListener('scroll', handleScroll, { passive: true })
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const resume = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setAutoscroll(true)
  }

 return (
  <section className={`${className}`}>
    {/* Channel input */}
    <div className="bg-twitch text-white inline p-2 absolute top-0 rounded-lg">
      <label className="sr-only">Channel</label>
      <input
        type="text"
        maxLength={40}
        value={channelInput}
        onChange={(e) => setChannelInput(e.target.value)}
        placeholder="Enter channel"
        className="bg-transparent focus:outline-none ml-2 w-fit px-1"
      />
    </div>

    {/* Chat messages */}
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto flex flex-col space-y-2 bg-gray-900 text-white rounded-lg p-4 pt-8"
    >
      {messages.length === 0 ? (
        <p className="text-gray-400">
          {channel ? `No messages for #${channel} yet…` : 'Enter a channel to connect'}
        </p>
      ) : (
        messages.map(({ username, text, time }, idx) => {
          // Convert the time string like "7:23:59 PM" into a Date object on today's date
          let displayTime = ''
          if (time) {
            const todayDateStr = new Date().toISOString().split('T')[0] // e.g. "2025-06-24"
            const dateTimeStr = `${todayDateStr} ${time}`
            const dateObj = new Date(dateTimeStr)
            displayTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }

          return (
            <div
              key={idx}
              className="w-full bg-gray-700 p-2 rounded hover:bg-gray-600 transition"
            >
              <div className="text-xs text-gray-400 mb-1">
                {username} {displayTime}
              </div>
              <div className="text-sm">{text}</div>
            </div>
          )
        })
      )}

      {!autoscroll && (
        <button
          onClick={resume}
          className="sticky bottom-4 mx-auto bg-twitch text-white rounded px-4 py-2 hover:opacity-100 hover:scale-105 transition duration-300"
        >
          Resume Autoscroll
        </button>
      )}
    </div>
  </section>
)
}
