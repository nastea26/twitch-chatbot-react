import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleSpotifyPlaceholders } from './spotifyPlaceholders.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, '../../src/data/commands.json')

function loadCommands() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return []
  }
}

export async function processCommand(message, tags) {
  const commands = loadCommands()
  const parts = message.trim().split(/\s+/)
  const cmdTrigger = parts[0]

  const cmd = commands.find(c =>
    c.active && (c.trigger === cmdTrigger || (c.aliases || []).includes(cmdTrigger))
  )
  if (!cmd) return null

  let response = cmd.response
    .replace(/\$\{mention\}/g, parts.slice(1).join(' ') || tags.username)
    .replace(/\$\{user\}/g, tags.username)

  const hasSpotifyPlaceholders = response.includes('${spotify.')

  if (hasSpotifyPlaceholders) {
    response = await handleSpotifyPlaceholders(response, parts, tags)
  }

  return response
}
