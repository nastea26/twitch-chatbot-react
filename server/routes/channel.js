import { startBot, getCurrentChannel } from '../bot.js'

export default function mountChannelRoutes(app) {
  app.get('/api/channel', (req, res) => {
    res.json({ channel: getCurrentChannel() })
  })

  app.put('/api/channel', async (req, res) => {
    const { channel } = req.body
    if (!channel) return res.status(400).json({ error:'Channel required' })
    await startBot(channel)
    res.json({ message:`Bot moved to #${channel}` })
  })
}
