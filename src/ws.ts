/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import type { IncomingMessage } from 'node:http'
import type { WebSocket } from 'ws'
import process from 'node:process'
import { WebSocketServer } from 'ws'

const PORT = Number(process.env.PORT) || 5633
let count = 0
const connections = new Map<WebSocket, IncomingMessage['headers']>()

function broadcast(data: { type: 'online' | 'offline' | 'message', msg: string }) {
  connections.forEach((_, ws) => {
    ws.send(JSON.stringify(data))
  })
}
const wss = new WebSocketServer({
  path: '/_ws',
  port: PORT,
}, () => {
  console.log(`server is running at http://127.0.0.1:${PORT}/`)
})
wss.on('connection', async (ws, req) => {
  const token = req.headers.authorization
  broadcast({
    type: 'online',
    msg: `${token}`,
  })
  connections.set(ws, req.headers)
  console.log(`client connected${req.headers['sec-websocket-key']}`)

  count += 1
  ws.on('message', (message) => {
    ws.send(`server received: ${message}`)
  })
  ws.on('close', () => {
    connections.delete(ws)
    broadcast({
      type: 'offline',
      msg: `${req.headers['sec-websocket-key']}`,
    })
  })
  ws.on('pong', () => {

  })
  ws.ping()
})

wss.on('error', (err) => {
  console.error(err)
})
setInterval(() => {
  connections.forEach((_, ws) => {
    ws.ping()
  })
}, 3 * 1000)
