// server/routes/commands.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const DATA_FILE  = path.join(__dirname, '../../src/data/commands.json')

function loadCommands() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) }
  catch { return [] }
}
function saveCommands(cmds) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cmds, null, 2), 'utf-8')
}

export default function mountCommandsRoutes(app) {
  app.get('/api/commands', (req, res) => res.json(loadCommands()))

  app.get('/api/commands/:trigger', (req, res) => {
    const trg = req.params.trigger
    const cmd = loadCommands().find(c => c.trigger === trg)
    if (!cmd) return res.status(404).json({ error: 'Not found' })
    res.json(cmd)
  })

  app.post('/api/commands', (req, res) => {
    let { trigger, response, aliases = [], active = true } = req.body
    if (!trigger||!response) return res.status(400).json({ error:'trigger & response required' })
    const cmds = loadCommands()
    if (cmds.some(c=>c.trigger===trigger))
      return res.status(409).json({ error:'Trigger exists' })
    aliases = Array.isArray(aliases)?aliases:[]
    const newCmd = { trigger, response, aliases, active:!!active }
    cmds.push(newCmd); saveCommands(cmds)
    res.status(201).json(newCmd)
  })

  app.put('/api/commands/:trigger', (req, res) => {
    const oldT = req.params.trigger
    let { newTrigger, response, aliases, active } = req.body
    const cmds = loadCommands()
    const i = cmds.findIndex(c => c.trigger === oldT)
    if (i === -1) return res.status(404).json({ error: 'Not found' })

    if (newTrigger && newTrigger !== oldT) {
      if (cmds.some(c => c.trigger === newTrigger))
        return res.status(409).json({ error: 'Exists' })
      cmds[i].trigger = newTrigger
    }

    if (response != null) cmds[i].response = response
    if (Array.isArray(aliases)) cmds[i].aliases = aliases
    if (active != null) cmds[i].active = !!active

    saveCommands(cmds)
    res.json(cmds[i])
  })


  app.delete('/api/commands/:trigger', (req, res) => {
    const trg = req.params.trigger
    let cmds = loadCommands(), before = cmds.length
    cmds = cmds.filter(c => c.trigger !== trg)
    if (cmds.length === before) return res.status(404).json({ error: 'Not found' })
    saveCommands(cmds)
    res.status(204).end()
  })
}
