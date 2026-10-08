'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { SIGNALING_PORT, signalingSocketOptions, getSignalingUrl } from '@/lib/sky-utils'

interface UseSignalingArgs {
  code: string | null
  role: 'host' | 'client' | null
  onSkySync?: (v: { az: number; alt: number; zoom: number; time: number }) => void
  onSkyEvent?: (e: { type: string; payload: any; at: number }) => void
  onChat?: (m: { text: string; at: number }) => void
  onPeerReady?: (clientPeerId: string) => void
  onPeerLeft?: () => void
  onOffer?: (from: string, sdp: RTCSessionDescriptionInit) => void
  onAnswer?: (from: string, sdp: RTCSessionDescriptionInit) => void
  onIce?: (from: string, candidate: RTCIceCandidateInit) => void
}

export interface SignalingApi {
  socket: Socket | null
  connected: boolean
  peerId: string | null
  peerPresent: boolean
  remotePeerId: string | null
  sendOffer: (to: string, sdp: RTCSessionDescriptionInit) => void
  sendAnswer: (to: string, sdp: RTCSessionDescriptionInit) => void
  sendIce: (to: string, candidate: RTCIceCandidateInit) => void
  sendSkySync: (v: { az: number; alt: number; zoom: number; time?: number }) => void
  sendSkyEvent: (e: { type: string; payload: any }) => void
  sendChat: (text: string) => void
}

export function useSignaling(args: UseSignalingArgs): SignalingApi {
  const { code, role } = args
  const cbRef = useRef(args)
  useEffect(() => {
    cbRef.current = args
  })
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [peerId, setPeerId] = useState<string | null>(null)
  const [peerPresent, setPeerPresent] = useState(false)
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const remotePeerIdRef = useRef<string | null>(null)

  const setRemote = useCallback((id: string | null) => {
    remotePeerIdRef.current = id
    setRemotePeerId(id)
  }, [])

  useEffect(() => {
    if (!code || !role) return
    const { url, useGateway } = getSignalingUrl()
    const connectionUrl = useGateway
      ? `${url}?XTransformPort=${SIGNALING_PORT}`
      : url
    const s = io(connectionUrl, signalingSocketOptions())
    socketRef.current = s
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(s)

    const onConnect = () => {
      setConnected(true)
      setPeerId(s.id || null)
      s.emit('room:join', { code, role })
    }
    s.on('connect', onConnect)
    s.on('disconnect', () => setConnected(false))
    s.on('reconnect', onConnect)

    s.on('room:joined', () => {
      // room acknowledged
    })
    s.on('room:error', (data: { message: string }) => {
      cbRef.current.onPeerLeft?.()
    })
    s.on('peer:update', () => {
      setPeerPresent(true)
    })
    s.on('peer:ready', (data: { clientPeerId: string }) => {
      setPeerPresent(true)
      setRemote(data.clientPeerId)
      cbRef.current.onPeerReady?.(data.clientPeerId)
    })
    s.on('peer:left', () => {
      setPeerPresent(false)
      setRemote(null)
      cbRef.current.onPeerLeft?.()
    })

    s.on('signal:offer', (data: { from: string; sdp: RTCSessionDescriptionInit }) => {
      setRemote(data.from)
      cbRef.current.onOffer?.(data.from, data.sdp)
    })
    s.on('signal:answer', (data: { from: string; sdp: RTCSessionDescriptionInit }) => {
      setRemote(data.from)
      cbRef.current.onAnswer?.(data.from, data.sdp)
    })
    s.on('signal:ice', (data: { from: string; candidate: RTCIceCandidateInit }) => {
      cbRef.current.onIce?.(data.from, data.candidate)
    })
    s.on('sky:sync', (v: { az: number; alt: number; zoom: number; time: number }) => {
      cbRef.current.onSkySync?.(v)
    })
    s.on('sky:event', (e: { type: string; payload: any; at: number }) => {
      cbRef.current.onSkyEvent?.(e)
    })
    s.on('chat:message', (m: { text: string; at: number }) => {
      cbRef.current.onChat?.(m)
    })

    return () => {
      s.disconnect()
      socketRef.current = null
    }
  }, [code, role, setRemote])

  const sendOffer = useCallback((to: string, sdp: RTCSessionDescriptionInit) => {
    socketRef.current?.emit('signal:offer', { to, sdp })
  }, [])
  const sendAnswer = useCallback((to: string, sdp: RTCSessionDescriptionInit) => {
    socketRef.current?.emit('signal:answer', { to, sdp })
  }, [])
  const sendIce = useCallback((to: string, candidate: RTCIceCandidateInit) => {
    socketRef.current?.emit('signal:ice', { to, candidate })
  }, [])
  const sendSkySync = useCallback(
    (v: { az: number; alt: number; zoom: number; time?: number }) => {
      if (!code) return
      socketRef.current?.emit('sky:sync', { code, ...v, time: v.time ?? Date.now() })
    },
    [code],
  )
  const sendSkyEvent = useCallback(
    (e: { type: string; payload: any }) => {
      if (!code) return
      socketRef.current?.emit('sky:event', { code, ...e })
    },
    [code],
  )
  const sendChat = useCallback(
    (text: string) => {
      if (!code) return
      socketRef.current?.emit('chat:message', { code, text })
    },
    [code],
  )

  return {
    socket,
    connected,
    peerId,
    peerPresent,
    remotePeerId,
    sendOffer,
    sendAnswer,
    sendIce,
    sendSkySync,
    sendSkyEvent,
    sendChat,
  }
}
