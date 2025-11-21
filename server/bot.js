import tmi from 'tmi.js'
import dotenv from 'dotenv'
import { processCommand } from './modules/commands.js'
import { onWsMessage } from './wsServer.js'
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let client = null
let currentChannel = process.env.VITE_DEFAULT_CHANNEL || null
let messageCallback = null

export function registerMessageCallback(cb) {
  messageCallback = cb
}

export async function startBot(overrideChannel = null) {
  const channel = overrideChannel || currentChannel
  if (!channel) {
    console.warn('No channel specified for bot to join.')
    return
  }

  // If already connected channel and new chanel are the same to do nothing 
  if (client && currentChannel === channel && client.readyState() === 'OPEN') {
    console.log(`Bot already connected to #${channel}`)
    return
  }

  // Disconnect when switching channels
  if (client) {
    await client.disconnect()
    client = null
  }

  currentChannel = channel

  client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true, secure: true },
    identity: {
      username: process.env.VITE_NICK,
      password: process.env.VITE_TWITCH_OAUTH,
    },
    channels: [channel],
  })

  client.on('connected', (addr, port) => {
    console.log(`Connected to Twitch IRC at ${addr}:${port} (joined #${channel})`)
  })

  client.on('reconnect', () => {
    console.log('Reconnecting to Twitch...')
  })

  client.on('disconnected', (reason) => {
    console.warn('Disconnected from Twitch:', reason)
  })

  // Message handler
  client.on('message', async (chan, tags, message, self) => {
    if (self) return

    const chatMsg = {
      username: tags['display-name'] || tags.username,
      text: message,
      time: new Date().toLocaleTimeString(),
    }
    if (messageCallback) messageCallback(chatMsg)

    const reply = await processCommand(message, tags)
    if (reply) {
      client.say(chan, reply).catch(console.error)
    }
  })

  try {
    await client.connect()
    console.log(`Bot started in #${channel}`)
  } catch (err) {
    console.error('Failed to connect bot:', err)
  }
}

export async function stopBot() {
  if (client) {
    await client.disconnect()
    client = null
    console.log('Bot stopped')
  }
}

export function getCurrentChannel() {
  return currentChannel
}

onWsMessage((data) => {
  if (data.type === 'chat') {
    const { message } = data
    if (client && currentChannel) {
      client.say(currentChannel, message)
    }
  }
})