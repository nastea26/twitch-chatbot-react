import { WebSocketServer } from 'ws'

let wss
const clients = new Set()
let messageHandlers = []

export function startWsServer(server) {
  wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    clients.add(ws)
    console.log('WebSocket client connected')

    ws.on('message', (data) => {
      try {
        const parsed = JSON.parse(data)
        for (const handler of messageHandlers) {
          handler(parsed)
        }
      } catch (err) {
        console.error('Invalid WS message:', err)
      }
    })

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

// Register a message handler
export function onWsMessage(handler) {
  messageHandlers.push(handler)
}
