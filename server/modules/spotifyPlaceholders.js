import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const QUEUE_FILE = path.join(__dirname, '../data/queue.json')

export async function handleSpotifyPlaceholders(response, parts, tags) {
  const pattern = /\$\{spotify\.([a-zA-Z0-9_]+)\}/g
  const matches = [...response.matchAll(pattern)]

  let currentSongData = null
  let queueData = null
  let skipData = null
  let whenData = null

  for (const match of matches) {
    const key = match[1]

    try {
      if ((key === 'currentSong' || key === 'currentArtist') && !currentSongData) {
        const res = await fetch('http://localhost:3000/api/spotify/current')
        currentSongData = await res.json()
        if (!currentSongData.playing) return "There's no song currently playing"
      }

      if ((key === 'next' || key === 'nextSong' || key === 'nextArtists') && !skipData) {
        const res = await fetch('http://localhost:3000/api/spotify/skip')
        if (!res.ok) return "Sorry, something went wrong and I was unable to process your request :(("
        skipData = await res.json()
        if (!skipData.skipped || !skipData.queue?.queue) return "Sorry, something went wrong :(("
      }

      if ((key === 'queue' || key === 'queueSong' || key === 'queueArtists') && !queueData) {
        const query = parts.slice(1).join(' ')
        if (!query) return 'No song specified'

        const res = await fetch(`http://localhost:3000/api/spotify/addToQueue?q=${encodeURIComponent(query)}`)
        queueData = await res.json()
        queueData['requestedBy'] = tags.username

        if (!queueData.inQueue) return "Sorry, something went wrong and I was unable to process your request :(("

        let fileContents = []
        try {
          fileContents = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'))
        } catch {
          console.warn('Queue file not found or invalid, creating new one.')
        }

        fileContents.push(queueData)
        fs.writeFileSync(QUEUE_FILE, JSON.stringify(fileContents, null, 2), 'utf-8')
      }

      if ((key === 'when' || key === 'whenSong' || key === 'whenArtists') && !whenData) {
        const res = await fetch('http://localhost:3000/api/spotify/current')
        if (!res.ok) return "Sorry, something went wrong and I was unable to process your request :(("
        const data = await res.json()
        const remainingMs = data.duration - data.position
        let name = '', artists = '', totalMs = remainingMs

        const fileContents = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'))
        const userItem = fileContents.find(item => {
          if (item.requestedBy === tags.username) {
            name = item.name
            artists = item.artists
            return true
          }
          totalMs += item.duration
        })

        if (!userItem) return `Couldn't find a song requested by you in queue`

        whenData = {
          when: Math.ceil(totalMs / 1000 / 60),
          whenName: name,
          whenArtists: artists
        }
      }

      response = response
        .replace(/\$\{spotify\.currentSong\}/g, currentSongData?.name || '')
        .replace(/\$\{spotify\.currentArtist\}/g, currentSongData?.artists || '')
        .replace(/\$\{spotify\.queue\}/g, '')
        .replace(/\$\{spotify\.queueSong\}/g, queueData?.name || '')
        .replace(/\$\{spotify\.queueArtists\}/g, queueData?.artists || '')
        .replace(/\$\{spotify\.next\}/g, '')
        .replace(/\$\{spotify\.nextSong\}/g, skipData?.queue.songs[0] || '')
        .replace(/\$\{spotify\.nextArtists\}/g, skipData?.queue.artists[0] || '')
        .replace(/\$\{spotify\.when\}/g, whenData?.when || '')
        .replace(/\$\{spotify\.whenSong\}/g, whenData?.whenName || '')
        .replace(/\$\{spotify\.whenArtists\}/g, whenData?.whenArtists || '')

    } catch (err) {
      console.error(`Error handling Spotify placeholder ${key}:`, err)
      return 'Sorry, I can\'t fulfill that request at the moment :(('
    }
  }

  return response
}
