'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Header } from '@/components/sky/header'
import { Landing } from '@/components/sky/landing'
import { HostWaiting } from '@/components/sky/host-waiting'
import { JoinScreen } from '@/components/sky/join-screen'
import { Observation } from '@/components/sky/observation'
import { Footer } from '@/components/sky/footer'
import { useSkyStore } from '@/lib/sky-store'
import { useSignaling } from '@/hooks/use-signaling'
import { useWebRTC } from '@/hooks/use-webrtc'
import { parseJoinCodeFromUrl } from '@/lib/sky-utils'
import { useToast } from '@/hooks/use-toast'

type Phase = 'landing' | 'host-waiting' | 'join' | 'observation'

export default function Home() {
  const { toast } = useToast()
  const [phase, setPhase] = useState<Phase>('landing')

  const role = useSkyStore((s) => s.role)
  const code = useSkyStore((s) => s.code)
  const setRole = useSkyStore((s) => s.setRole)
  const setCode = useSkyStore((s) => s.setCode)
  const setView = useSkyStore((s) => s.setView)
  const setPeerConnected = useSkyStore((s) => s.setPeerConnected)
  const reset = useSkyStore((s) => s.reset)
  const addChat = useSkyStore((s) => s.addChat)

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [initialJoinCode, setInitialJoinCode] = useState<string | null>(null)

  // Check for ?join=CODE in URL on mount
  useEffect(() => {
    const c = parseJoinCodeFromUrl()
    if (c) {
      setInitialJoinCode(c)
      setPhase('join')
    }
  }, [])

  // ---------------------------------------------------------
  // Refs to bridge signaling events → webrtc handlers
  // (created before signaling hook so we can pass stable callbacks)
  // ---------------------------------------------------------
  const handleOfferRef = useRef<(from: string, sdp: RTCSessionDescriptionInit) => Promise<void>>(async () => {})
  const handleAnswerRef = useRef<(from: string, sdp: RTCSessionDescriptionInit) => Promise<void>>(async () => {})
  const handleIceRef = useRef<(from: string, candidate: RTCIceCandidateInit) => Promise<void>>(async () => {})

  const onOffer = useCallback((from: string, sdp: RTCSessionDescriptionInit) => {
    handleOfferRef.current(from, sdp)
  }, [])
  const onAnswer = useCallback((from: string, sdp: RTCSessionDescriptionInit) => {
    handleAnswerRef.current(from, sdp)
  }, [])
  const onIce = useCallback((from: string, candidate: RTCIceCandidateInit) => {
    handleIceRef.current(from, candidate)
  }, [])

  // ---------------------------------------------------------
  // HOST: create session
  // ---------------------------------------------------------
  const createSession = useCallback(async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'host' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Chyba pri vytváraní relácie')
      setRole('host')
      setCode(data.code)
      setPhase('host-waiting')
    } catch (e: any) {
      setCreateError(e?.message || 'Neznáma chyba')
    } finally {
      setCreating(false)
    }
  }, [setRole, setCode])

  const startHost = useCallback(() => {
    setPhase('host-waiting')
    createSession()
  }, [createSession])

  // ---------------------------------------------------------
  // JOIN: verify code
  // ---------------------------------------------------------
  const verifyAndJoin = useCallback(
    async (c: string) => {
      setJoinLoading(true)
      setJoinError(null)
      try {
        const res = await fetch('/api/session/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: c }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.error || 'Nepodarilo sa overiť kód')
        }
        setRole('client')
        setCode(c)
        setPhase('observation')
        toast({ title: 'Pripojené', description: `Relácia ${c.slice(0, 3)}-${c.slice(3)} aktívna` })
      } catch (e: any) {
        setJoinError(e?.message || 'Neznáma chyba')
      } finally {
        setJoinLoading(false)
      }
    },
    [setRole, setCode, toast],
  )

  const startJoin = useCallback(() => {
    setPhase('join')
    setJoinError(null)
  }, [])

  const backToLanding = useCallback(() => {
    setPhase('landing')
    setCreateError(null)
    setJoinError(null)
    setInitialJoinCode(null)
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    reset()
  }, [reset])

  // ---------------------------------------------------------
  // Signaling callbacks (sky sync, chat, peer events)
  // ---------------------------------------------------------
  const onSkySync = useCallback(
    (v: { az: number; alt: number; zoom: number; time: number }) => {
      const cur = useSkyStore.getState().view
      if (
        Math.abs(cur.az - v.az) > 0.5 ||
        Math.abs(cur.alt - v.alt) > 0.5 ||
        Math.abs(cur.zoom - v.zoom) > 0.01
      ) {
        setView({ az: v.az, alt: v.alt, zoom: v.zoom })
      }
    },
    [setView],
  )
  const onSkyEvent = useCallback((e: { type: string; payload: any; at: number }) => {
    useSkyStore.getState().addEvent({
      id: Math.random().toString(36).slice(2),
      type: e.type as any,
      x: e.payload?.x ?? 0,
      y: e.payload?.y ?? 0,
      label: e.payload?.label,
      at: e.at,
    })
  }, [])
  const onChat = useCallback(
    (m: { text: string; at: number }) => {
      addChat({ id: Math.random().toString(36).slice(2), text: m.text, from: 'peer', at: m.at })
    },
    [addChat],
  )
  const onPeerReady = useCallback(
    (_clientPeerId: string) => {
      setPeerConnected(true)
      addChat({ id: 'sys-join-' + Date.now(), text: 'Klient sa pripojil', from: 'system', at: Date.now() })
      toast({ title: 'Klient pripojený', description: 'Peer je online' })
      if (useSkyStore.getState().role === 'host') {
        setPhase('observation')
      }
    },
    [setPeerConnected, addChat, toast],
  )
  const onPeerLeft = useCallback(() => {
    setPeerConnected(false)
    addChat({ id: 'sys-left-' + Date.now(), text: 'Peer sa odpojil', from: 'system', at: Date.now() })
    toast({ title: 'Peer sa odpojil', variant: 'destructive' })
  }, [setPeerConnected, addChat, toast])

  const signalingActive = !!code && !!role && (phase === 'host-waiting' || phase === 'observation')

  // Placeholder senders (used before signaling is active)
  const noopSend = useCallback((_: string, __: any) => {}, [])

  // Create signaling hook (always called; inactive when no code/role)
  const signaling = useSignaling({
    code: signalingActive ? code : null,
    role: signalingActive ? role : null,
    onSkySync,
    onSkyEvent,
    onChat,
    onPeerReady,
    onPeerLeft,
    onOffer,
    onAnswer,
    onIce,
  })

  // Create webrtc hook (always called; handlers no-op until PC exists)
  const webRtc = useWebRTC({
    role,
    remotePeerId: signaling.remotePeerId,
    peerPresent: signaling.peerPresent,
    sendOffer: signaling.sendOffer || noopSend,
    sendAnswer: signaling.sendAnswer || noopSend,
    sendIce: signaling.sendIce || noopSend,
  })

  // Sync webrtc handlers into the refs that signaling uses
  useEffect(() => {
    handleOfferRef.current = webRtc.handleOffer
    handleAnswerRef.current = webRtc.handleAnswer
    handleIceRef.current = webRtc.handleIce
  }, [webRtc.handleOffer, webRtc.handleAnswer, webRtc.handleIce])

  const leave = useCallback(() => {
    webRtc.stopLocal()
    signaling.socket?.disconnect()
    backToLanding()
    toast({ title: 'Relácia ukončená' })
  }, [webRtc, signaling.socket, backToLanding, toast])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {phase === 'landing' && <Landing onHost={startHost} onJoin={startJoin} />}

        {phase === 'host-waiting' && (
          <HostWaiting
            onBack={backToLanding}
            onCodeReady={() => {}}
            onAbort={backToLanding}
            code={code}
            loading={creating}
            error={createError}
            onCreate={createSession}
          />
        )}

        {phase === 'join' && (
          <JoinScreen
            onBack={backToLanding}
            onSubmit={verifyAndJoin}
            loading={joinLoading}
            error={joinError}
            initialCode={initialJoinCode}
          />
        )}

        {phase === 'observation' && (
          <Observation
            role={role || 'host'}
            code={code}
            localVideoRef={webRtc.localVideoRef}
            remoteVideoRef={webRtc.remoteVideoRef}
            localStream={webRtc.localStream}
            remoteStream={webRtc.remoteStream}
            pcState={webRtc.pcState}
            sharingMode={webRtc.sharingMode}
            peerPresent={signaling.peerPresent}
            signalingConnected={signaling.connected}
            onCamera={webRtc.startCamera}
            onScreen={webRtc.startScreen}
            onStop={webRtc.stopLocal}
            onLeave={leave}
            onSkySync={signaling.sendSkySync}
            onSkyEvent={signaling.sendSkyEvent}
            onChat={signaling.sendChat}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
