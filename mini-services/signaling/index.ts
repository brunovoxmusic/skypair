import { createServer } from 'http'
import { Server } from 'socket.io'

// ============================================================
// Signaling mini-service for Sky Observation Web App
// Port: 3003 (forwarded by Caddy via XTransformPort query)
// Path: '/' (required by Caddy gateway)
// ============================================================

interface PeerInfo {
  socketId: string
  role: 'host' | 'client'
  code: string
  joinedAt: number
}

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// rooms keyed by 6-digit code -> set of peer socket ids
const rooms = new Map<string, Map<string, PeerInfo>>()

function log(msg: string) {
  console.log(`[signaling ${new Date().toISOString()}] ${msg}`)
}

function getRoom(code: string): Map<string, PeerInfo> {
  if (!rooms.has(code)) rooms.set(code, new Map())
  return rooms.get(code)!
}

function emitRoomMembers(code: string, event: string, payload: any, except?: string) {
  const room = getRoom(code)
  for (const [sid, peer] of room.entries()) {
    if (sid === except) continue
    io.to(sid).emit(event, payload)
  }
}

io.on('connection', (socket) => {
  log(`connected: ${socket.id}`)

  // ----------------------------------------------------------
  // JOIN ROOM (host or client) by 6-digit code
  // ----------------------------------------------------------
  socket.on('room:join', (data: { code: string; role: 'host' | 'client' }) => {
    const code = String(data?.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    const role = data?.role === 'host' ? 'host' : 'client'

    if (!code) {
      socket.emit('room:error', { message: 'Missing code' })
      return
    }

    const room = getRoom(code)
    // Enforce at most 2 peers per room (1 host + 1 client)
    if (!room.has(socket.id) && room.size >= 2) {
      socket.emit('room:error', { message: 'Room is full' })
      return
    }

    const peer: PeerInfo = {
      socketId: socket.id,
      role,
      code,
      joinedAt: Date.now(),
    }
    room.set(socket.id, peer)
    socket.join(code)
    log(`join ${code} as ${role}: ${socket.id} (room size=${room.size})`)

    socket.emit('room:joined', { code, role, peerId: socket.id })

    // Notify others in room
    emitRoomMembers(
      code,
      'peer:update',
      { peerId: socket.id, role, roomSize: room.size },
      socket.id,
    )

    // If both peers present, tell host a client arrived
    if (room.size === 2) {
      const hostPeer = [...room.values()].find((p) => p.role === 'host')
      if (hostPeer && hostPeer.socketId !== socket.id) {
        io.to(hostPeer.socketId).emit('peer:ready', { clientPeerId: socket.id })
      }
    }
  })

  // ----------------------------------------------------------
  // WEBRTC SIGNALING: forward SDP offer/answer and ICE
  // ----------------------------------------------------------
  socket.on('signal:offer', (data: { to: string; sdp: any }) => {
    log(`offer from ${socket.id} -> ${data.to}`)
    io.to(data.to).emit('signal:offer', { from: socket.id, sdp: data.sdp })
  })

  socket.on('signal:answer', (data: { to: string; sdp: any }) => {
    log(`answer from ${socket.id} -> ${data.to}`)
    io.to(data.to).emit('signal:answer', { from: socket.id, sdp: data.sdp })
  })

  socket.on('signal:ice', (data: { to: string; candidate: any }) => {
    io.to(data.to).emit('signal:ice', { from: socket.id, candidate: data.candidate })
  })

  // ----------------------------------------------------------
  // SKY SYNC: synchronize star map view between peers
  // ----------------------------------------------------------
  socket.on('sky:sync', (data: { code: string; az: number; alt: number; zoom: number; time?: number }) => {
    emitRoomMembers(
      data.code,
      'sky:sync',
      { az: data.az, alt: data.alt, zoom: data.zoom, time: data.time ?? Date.now(), from: socket.id },
      socket.id,
    )
  })

  socket.on('sky:event', (data: { code: string; type: string; payload: any }) => {
    emitRoomMembers(
      data.code,
      'sky:event',
      { type: data.type, payload: data.payload, from: socket.id, at: Date.now() },
      socket.id,
    )
  })

  // ----------------------------------------------------------
  // CHAT / NOTE between peers
  // ----------------------------------------------------------
  socket.on('chat:message', (data: { code: string; text: string }) => {
    emitRoomMembers(
      data.code,
      'chat:message',
      { text: String(data.text).slice(0, 500), from: socket.id, at: Date.now() },
      socket.id,
    )
  })

  // ----------------------------------------------------------
  // DISCONNECT
  // ----------------------------------------------------------
  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      if (room.has(socket.id)) {
        const peer = room.get(socket.id)!
        room.delete(socket.id)
        log(`left ${code} (${peer.role}): ${socket.id}`)
        emitRoomMembers(code, 'peer:left', { peerId: socket.id, role: peer.role })
        if (room.size === 0) rooms.delete(code)
        break
      }
    }
  })

  socket.on('error', (err) => {
    log(`socket error ${socket.id}: ${err}`)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  log(`Signaling server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down...')
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  log('SIGINT received, shutting down...')
  httpServer.close(() => process.exit(0))
})
