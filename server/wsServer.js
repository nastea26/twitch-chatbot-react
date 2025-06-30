// wsServer.js
import { WebSocketServer } from 'ws'

let wss
const clients = new Set()

export function startWsServer(server) {
  wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log('WebSocket client connected')

    ws.on('close', () => {
      clients.delete(ws)
      console.log('WebSocket client disconnected')
    })
  })
}

export function broadcastMessage(data) {
  const message = JSON.stringify(data)
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message)
    }
  }
}
