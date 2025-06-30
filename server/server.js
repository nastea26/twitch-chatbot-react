// server/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'

import { startBot, registerMessageCallback } from './bot.js'
import { startWsServer, broadcastMessage } from './wsServer.js'

// route-mounting functions
import mountCommandsRoutes  from './routes/commands.js'
import mountChannelRoutes   from './routes/channel.js'
import mountSpotifyAuth     from './routes/spotifyAuth.js'
import mountSpotifyApi      from './routes/spotifyApi.js'

dotenv.config()

const app = express()
app.use(cors({ origin:'http://localhost:5173', credentials: true }))
app.use(express.json())

// Mount all the separate route modules
mountCommandsRoutes(app)
mountChannelRoutes(app)
mountSpotifyAuth(app)
mountSpotifyApi(app)

// Start HTTP + WS + Twitch bot
const PORT = process.env.PORT || 3000
const server = http.createServer(app)
startWsServer(server)
registerMessageCallback(broadcastMessage)

server.listen(PORT, async () => {
  await startBot(process.env.VITE_DEFAULT_CHANNEL)
  console.log(`API + WS + Bot running on http://localhost:${PORT}`)
})
