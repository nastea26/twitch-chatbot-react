import * as spotifyQueries from '../modules/spotifyQueries.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const QUEUE_FILE  = path.join(__dirname, '../data/queue.json')
console.log('clearing queue file')
fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2), 'utf-8')

export default function mountSpotifyApi(app) {
  app.get('/api/spotify/current', async (req, res) => {
    try {
      const song = await spotifyQueries.getCurrentSong()
      res.json(song)
    } catch (err) {
      console.error('Error fetching current song: ', err)
      res.status(err.status || 500).json({ error: err.message })
    }
  })
  app.get('/api/spotify/addToQueue', async (req,res) => {
    try{
      if(!req.query.q){
        res.json({ inQueue:false })
        return
      }
      const queue = await spotifyQueries.addToQueue(req.query.q)
      res.json(queue)
    } catch(err){
      console.error('Error adding song to queue: ', err)
      res.status(err.status || 500).json({ error: err.message })
    }
  })

  app.get('/api/spotify/skip', async (req,res) => {
    try{
      const skip = await spotifyQueries.skip()
      res.json(skip)
      return
    }
    catch(err){
      console.log("error moving to next song")
      res.status(err.status || 500).json( {skipped:false} )
    }
  })

  let lastRemovedUri = ''
  let lastPlaybackStart = 0

  setInterval(async () => {
    const tokenExists = await fetch(`http://localhost:${process.env.PORT || 3000}/spotify/token`)
    if (!tokenExists.ok) return

    try {
      const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/spotify/current`)
      if (!res.ok) throw new Error(`Failed fetching current song: ${res.status}`)

      const current = await res.json()

      //Get when the song started
      const currentStart = Date.now() - current.position

      // Avoid removing again for the same playback, limit it to removing from queue once per track even if they are identical 
      if (current.uri === lastRemovedUri && Math.abs(currentStart - lastPlaybackStart) < 5000) {
        return
      }

      let queue = []
      try {
        queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'))
      } catch {
        return
      }

      let removed = false
      const filteredQueue = queue.filter(item => {
        if (!removed && item.uri === current.uri) {
          removed = true
          return false
        }
        return true
      })

      if (removed) {
        lastRemovedUri = current.uri
        lastPlaybackStart = currentStart
      }

      fs.writeFileSync(QUEUE_FILE, JSON.stringify(filteredQueue, null, 2), 'utf-8')
    } catch (err) {
      console.error('Error in queue cleaner interval:', err.message)
    }
  }, 15000)

}
