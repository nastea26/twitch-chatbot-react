import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'

import { startBot, registerMessageCallback } from './bot.js'
import { startWsServer, broadcastMessage } from './wsServer.js'

import mountCommandsRoutes  from './routes/commands.js'
import mountChannelRoutes   from './routes/channel.js'
import mountSpotifyAuth     from './routes/spotifyAuth.js'
import mountSpotifyApi      from './routes/spotifyApi.js'

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express()
app.use(cors({ origin:'http://localhost:5173', credentials: true }))
app.use(express.json())

// Mount all route modules
mountCommandsRoutes(app)
mountChannelRoutes(app)
mountSpotifyAuth(app)
mountSpotifyApi(app)

// Start server
const PORT = process.env.PORT || 3000
const server = http.createServer(app)
startWsServer(server)
registerMessageCallback(broadcastMessage)

server.listen(PORT, async () => {
  await startBot(process.env.VITE_DEFAULT_CHANNEL)
  console.log(`API + WS + Bot running on http://127.0.0.1:${PORT}`)
})
