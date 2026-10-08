'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWebRTCArgs {
  role: 'host' | 'client' | null
  remotePeerId: string | null
  peerPresent: boolean
  sendOffer: (to: string, sdp: RTCSessionDescriptionInit) => void
  sendAnswer: (to: string, sdp: RTCSessionDescriptionInit) => void
  sendIce: (to: string, candidate: RTCIceCandidateInit) => void
}

export interface WebRtcApi {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  startCamera: () => Promise<void>
  startScreen: () => Promise<void>
  stopLocal: () => void
  pcState: RTCPeerConnectionState | 'new'
  sharingMode: 'camera' | 'screen' | null
  // handlers to wire into signaling onOffer/onAnswer/onIce
  handleOffer: (from: string, sdp: RTCSessionDescriptionInit) => Promise<void>
  handleAnswer: (from: string, sdp: RTCSessionDescriptionInit) => Promise<void>
  handleIce: (from: string, candidate: RTCIceCandidateInit) => Promise<void>
}

// Public STUN servers. For symmetric NAT a TURN server would be required.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function useWebRTC(args: UseWebRTCArgs): WebRtcApi {
  const { role, remotePeerId, peerPresent } = args
  const argsRef = useRef(args)
  useEffect(() => {
    argsRef.current = args
  })

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
  const remoteDescSetRef = useRef(false)
  const offerCreatedRef = useRef(false)
  const renegotiatingRef = useRef(false)

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [pcState, setPcState] = useState<RTCPeerConnectionState | 'new'>('new')
  const [sharingMode, setSharingMode] = useState<'camera' | 'screen' | null>(null)

  const ensurePeer = useCallback(() => {
    if (pcRef.current) return pcRef.current
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    const rs = new MediaStream()
    setRemoteStream(rs)
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = rs

    pc.ontrack = (e) => {
      const stream = e.streams[0] || rs
      if (!e.streams[0]) rs.addTrack(e.track)
      setRemoteStream(stream)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
    }
    pc.onicecandidate = (e) => {
      if (e.candidate && argsRef.current.remotePeerId) {
        argsRef.current.sendIce(argsRef.current.remotePeerId, e.candidate.toJSON())
      }
    }
    pc.onconnectionstatechange = () => setPcState(pc.connectionState)
    pc.onnegotiationneeded = async () => {
      if (role === 'host' && argsRef.current.remotePeerId) {
        const alreadyOffered = offerCreatedRef.current
        offerCreatedRef.current = true
        if (alreadyOffered && !renegotiatingRef.current) return
        renegotiatingRef.current = false
        try {
          const offer = await pc.createOffer({ offerToReceiveVideo: true })
          await pc.setLocalDescription(offer)
          argsRef.current.sendOffer(argsRef.current.remotePeerId, offer)
        } catch (err) {
          console.error('negotiation offer error', err)
        }
      }
    }
    pcRef.current = pc
    return pc
  }, [role])

  const handleOffer = useCallback(
    async (_from: string, sdp: RTCSessionDescriptionInit) => {
      const pc = ensurePeer()
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        remoteDescSetRef.current = true
        for (const c of pendingCandidatesRef.current) {
          try { await pc.addIceCandidate(c) } catch {}
        }
        pendingCandidatesRef.current = []
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        if (argsRef.current.remotePeerId) {
          argsRef.current.sendAnswer(argsRef.current.remotePeerId, answer)
        }
      } catch (err) {
        console.error('handle offer error', err)
      }
    },
    [ensurePeer],
  )

  const handleAnswer = useCallback(
    async (_from: string, sdp: RTCSessionDescriptionInit) => {
      const pc = pcRef.current
      if (!pc) return
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        remoteDescSetRef.current = true
        for (const c of pendingCandidatesRef.current) {
          try { await pc.addIceCandidate(c) } catch {}
        }
        pendingCandidatesRef.current = []
      } catch (err) {
        console.error('handle answer error', err)
      }
    },
    [],
  )

  const handleIce = useCallback(
    async (_from: string, candidate: RTCIceCandidateInit) => {
      const pc = pcRef.current
      if (!pc) return
      try {
        if (remoteDescSetRef.current) {
          await pc.addIceCandidate(candidate)
        } else {
          pendingCandidatesRef.current.push(candidate)
        }
      } catch (err) {
        // ignore
      }
    },
    [],
  )

  const attachLocalStream = useCallback(
    (stream: MediaStream) => {
      const pc = ensurePeer()
      pc.getSenders().forEach((s) => {
        if (s.track) pc.removeTrack(s)
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      stream.getVideoTracks().forEach((t) => pc.addTrack(t, stream))
      if (offerCreatedRef.current) {
        renegotiatingRef.current = true
      }
    },
    [ensurePeer],
  )

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      attachLocalStream(stream)
      setSharingMode('camera')
    } catch (e: any) {
      console.error('camera error', e)
      throw e
    }
  }, [attachLocalStream])

  const stopLocalLocal = useCallback(() => {
    const s = localStreamRef.current
    if (s) s.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    setLocalStream(null)
    setSharingMode(null)
    if (localVideoRef.current) localVideoRef.current.srcObject = null
    const pc = pcRef.current
    if (pc) {
      pc.getSenders().forEach((snd) => {
        if (snd.track) {
          try { pc.removeTrack(snd) } catch {}
        }
      })
      if (offerCreatedRef.current) renegotiatingRef.current = true
    }
  }, [])

  const stopLocalRef = useRef(stopLocalLocal)
  useEffect(() => {
    stopLocalRef.current = stopLocalLocal
  })
  const stopLocal = useCallback(() => stopLocalRef.current(), [])

  const startScreen = useCallback(async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      stream.getVideoTracks().forEach((t) => {
        t.addEventListener('ended', () => stopLocalRef.current())
      })
      attachLocalStream(stream)
      setSharingMode('screen')
    } catch (e: any) {
      console.error('screen error', e)
      throw e
    }
  }, [attachLocalStream])

  // When host gets remotePeerId (peer:ready), ensure PC exists. negotiationneeded fires offer.
  // For client: when remotePeerId is set, ensure PC exists so it's ready to receive offer.
  useEffect(() => {
    if (remotePeerId && peerPresent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      ensurePeer()
    }
  }, [role, remotePeerId, peerPresent, ensurePeer])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocalRef.current()
      try { pcRef.current?.close() } catch {}
      pcRef.current = null
    }
  }, [])

  return {
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    startCamera,
    startScreen,
    stopLocal,
    pcState,
    sharingMode,
    handleOffer,
    handleAnswer,
    handleIce,
  }
}
