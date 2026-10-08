'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Monitor,
  Square,
  Send,
  Sparkles,
  Satellite,
  StickyNote,
  Trash2,
  LogOut,
  Sun,
  Moon,
  Grid3x3,
  Tag,
  Link2,
  Radio,
  Loader2,
  Orbit,
  LocateFixed,
  Spline,
  Stars,
  Compass,
  Info,
  Download,
  Flame,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  CircleDashed,
  FileJson,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SkyMap } from './sky-map'
import { SkyInfoPanel } from './sky-info-panel'
import { MeteorShowersPanel } from './meteor-showers-panel'
import { StarInfoPopup, type StarInfo } from './star-info-popup'
import { useSkyStore } from '@/lib/sky-store'
import { formatCode } from '@/lib/sky-utils'
import { ALL_STARS, localSiderealTime, equatorialToHorizontal } from '@/lib/stars'

interface ObservationProps {
  role: 'host' | 'client'
  code: string
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  pcState: RTCPeerConnectionState | 'new'
  sharingMode: 'camera' | 'screen' | null
  peerPresent: boolean
  signalingConnected: boolean
  onCamera: () => void
  onScreen: () => void
  onStop: () => void
  onLeave: () => void
  onSkySync: (v: { az: number; alt: number; zoom: number; time?: number }) => void
  onSkyEvent: (e: { type: string; payload: any }) => void
  onChat: (text: string) => void
}

export function Observation(props: ObservationProps) {
  const {
    role,
    code,
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    pcState,
    sharingMode,
    peerPresent,
    signalingConnected,
    onCamera,
    onScreen,
    onStop,
    onLeave,
    onSkySync,
    onSkyEvent,
    onChat,
  } = props

  const view = useSkyStore((s) => s.view)
  const setView = useSkyStore((s) => s.setView)
  const events = useSkyStore((s) => s.events)
  const addEvent = useSkyStore((s) => s.addEvent)
  const clearEvents = useSkyStore((s) => s.clearEvents)
  const chat = useSkyStore((s) => s.chat)
  const addChat = useSkyStore((s) => s.addChat)
  const meteorCount = useSkyStore((s) => s.meteorCount)
  const incMeteor = useSkyStore((s) => s.incMeteor)

  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.length])

  // send sky sync when view changes (throttled via rAF)
  const syncRafRef = useRef<number>(0)
  const lastSyncRef = useRef(0)
  useEffect(() => {
    if (!peerPresent) return
    cancelAnimationFrame(syncRafRef.current)
    syncRafRef.current = requestAnimationFrame(() => {
      const now = Date.now()
      if (now - lastSyncRef.current > 80) {
        lastSyncRef.current = now
        onSkySync({ az: view.az, alt: view.alt, zoom: view.zoom })
      }
    })
    return () => cancelAnimationFrame(syncRafRef.current)
  }, [view.az, view.alt, view.zoom, peerPresent, onSkySync])

  const sendChat = useCallback(() => {
    const text = chatInput.trim()
    if (!text) return
    addChat({ id: Math.random().toString(36).slice(2), text, from: 'me', at: Date.now() })
    onChat(text)
    setChatInput('')
  }, [chatInput, addChat, onChat])

  // Audio alerts state (declared before markEvent which uses it)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const playAlert = useCallback((type: string) => {
    if (!audioEnabled) return
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext
        if (Ctx) audioCtxRef.current = new Ctx()
      }
      const ctx = audioCtxRef.current
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      if (type === 'meteor') {
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
      } else if (type === 'satellite') {
        osc.frequency.setValueAtTime(660, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.2)
      } else {
        osc.frequency.setValueAtTime(523, ctx.currentTime)
      }
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      // ignore audio errors
    }
  }, [audioEnabled])

  const markEvent = useCallback(
    (type: 'meteor' | 'satellite' | 'planet' | 'note') => {
      const e = {
        id: Math.random().toString(36).slice(2),
        type,
        x: 0,
        y: 0,
        label: undefined as string | undefined,
        at: Date.now(),
      }
      addEvent(e)
      onSkyEvent({ type, payload: { x: e.x, y: e.y, label: e.label, at: e.at } })
      if (type === 'meteor') incMeteor()
      playAlert(type)
    },
    [addEvent, onSkyEvent, incMeteor, playAlert],
  )

  const [locating, setLocating] = useState(false)
  const [selectedStar, setSelectedStar] = useState<StarInfo | null>(null)
  const handleLocate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      addChat({ id: 'geo-err-' + Date.now(), text: 'Geolokácia nie je podporovaná v tomto prehliadači.', from: 'system', at: Date.now() })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setView({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        addChat({
          id: 'geo-ok-' + Date.now(),
          text: `Poloha nastavená: ${pos.coords.latitude.toFixed(3)}°, ${pos.coords.longitude.toFixed(3)}°`,
          from: 'system',
          at: Date.now(),
        })
        setLocating(false)
      },
      (err) => {
        addChat({
          id: 'geo-err-' + Date.now(),
          text: 'Geolokácia zamietnutá alebo nedostupná: ' + (err.message || 'neznáma chyba'),
          from: 'system',
          at: Date.now(),
        })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [setView, addChat])

  const handleExport = useCallback(() => {
    if (events.length === 0) {
      addChat({ id: 'exp-' + Date.now(), text: 'Žiadne pozorovania na export.', from: 'system', at: Date.now() })
      return
    }
    const rows = [
      ['Typ', 'Čas (ISO)', 'Čas (lokálny)', 'X', 'Y', 'Názov'],
      ...events.map((e) => [
        e.type,
        new Date(e.at).toISOString(),
        new Date(e.at).toLocaleString('sk-SK'),
        e.x.toFixed(0),
        e.y.toFixed(0),
        e.label || '',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skypair-pozorovania-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addChat({ id: 'exp-ok-' + Date.now(), text: `Exportovaných ${events.length} pozorovaní do CSV.`, from: 'system', at: Date.now() })
  }, [events, addChat])

  const handleExportJson = useCallback(() => {
    if (events.length === 0) {
      addChat({ id: 'expj-' + Date.now(), text: 'Žiadne pozorovania na export.', from: 'system', at: Date.now() })
      return
    }
    const data = {
      exportedAt: new Date().toISOString(),
      location: { lat: view.lat, lng: view.lng },
      totalEvents: events.length,
      meteorCount,
      events: events.map((e) => ({
        type: e.type,
        time: new Date(e.at).toISOString(),
        timeLocal: new Date(e.at).toLocaleString('sk-SK'),
        position: { x: e.x, y: e.y },
        label: e.label || null,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skypair-pozorovania-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addChat({ id: 'expj-ok-' + Date.now(), text: `Exportovaných ${events.length} pozorovaní do JSON.`, from: 'system', at: Date.now() })
  }, [events, view.lat, view.lng, meteorCount, addChat])

  // Star bookmarks (localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  useEffect(() => {
    try {
      const stored = localStorage.getItem('skypair-bookmarks')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setBookmarks(JSON.parse(stored))
    } catch {}
  }, [])
  const toggleBookmark = useCallback((starName: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(starName)
        ? prev.filter((n) => n !== starName)
        : [...prev, starName]
      try {
        localStorage.setItem('skypair-bookmarks', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const pcConnected = pcState === 'connected'

  return (
    <div className={`min-h-[calc(100vh-3.5rem)] p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 sm:gap-4 theme-transition ${view.redLight ? 'red-light-mode' : ''}`}>
      {/* LEFT: Sky map + video */}
      <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
        <Card className="flex-1 min-h-[360px] sm:min-h-[460px] relative overflow-hidden bg-[#02030a] border-emerald-500/20">
          <CardContent className="p-0 h-full absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full max-w-[640px] max-h-[640px] aspect-square mx-auto p-2">
              <SkyMap onStarClick={(s) => setSelectedStar(s)} />
            </div>
          </CardContent>
          {/* Star info popup */}
          <StarInfoPopup
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
            onLocate={(az, alt) => { setView({ az, alt }); setSelectedStar(null) }}
            bookmarked={selectedStar ? bookmarks.includes(selectedStar.name) : false}
            onToggleBookmark={toggleBookmark}
          />
          {/* Top overlay status bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={`backdrop-blur ${peerPresent ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-amber-500/15 text-amber-300 border-amber-400/40'}`}
              >
                <Radio className="w-3 h-3 mr-1" />
                {peerPresent ? 'Peer pripojený' : 'Bez peera'}
              </Badge>
              <Badge variant="secondary" className="backdrop-blur bg-sky-500/15 text-sky-300 border-sky-400/40">
                <Link2 className="w-3 h-3 mr-1" />
                {formatCode(code)}
              </Badge>
              <Badge variant="secondary" className="backdrop-blur bg-white/10 text-white/80 border-white/20">
                {role === 'host' ? 'Hostiteľ' : 'Klient'}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${view.redLight ? 'bg-red-500/30 text-red-300 hover:bg-red-500/40' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                onClick={() => setView({ redLight: !view.redLight })}
                title="Červený nočný režim (pre zachovanie nočného videnia)"
                aria-label="Prepnúť červený nočný režim"
              >
                <Flame className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${audioEnabled ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                onClick={() => setAudioEnabled((a) => !a)}
                title="Zvukové upozornenia"
                aria-label="Prepnúť zvukové upozornenia"
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={onLeave} className="text-white/80 hover:text-white hover:bg-white/10">
                <LogOut className="w-4 h-4 mr-1" />
                Odísť
              </Button>
            </div>
          </div>
          {/* Sky info panel — bottom-left overlay */}
          <div className="absolute bottom-3 left-3 z-10 w-56 max-w-[55%] pointer-events-auto opacity-95">
            <SkyInfoPanel />
          </div>
          {/* Bottom overlay: coordinates (right-aligned) */}
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-white/70 font-mono backdrop-blur bg-black/30 px-2 py-1 rounded">
              <span>AZ {view.az.toFixed(0)}°</span>
              <span>ALT {view.alt.toFixed(0)}°</span>
              <span>×{view.zoom.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 backdrop-blur bg-black/30 px-2 py-1 rounded mt-1 justify-end">
              <span>{view.mode === 'night' ? 'Noc' : 'Deň'}</span>
            </div>
          </div>
        </Card>

        {/* Video panel */}
        <Card className="border-sky-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" />
                Obraz kamery / obrazovky
              </span>
              <div className="flex items-center gap-2">
                {pcConnected ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                    P2P aktívne
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-300 border-amber-400/40">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Spája sa…
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {/* Local video */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 border border-border">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: sharingMode === 'camera' ? 'scaleX(-1)' : 'none' }}
                />
                {!localStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                    <Camera className="w-7 h-7 text-muted-foreground mb-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Žiadny obraz. Spustite kameru alebo zdieľanie obrazovky.
                    </p>
                  </div>
                )}
                <Badge className="absolute top-2 left-2 bg-black/60 text-white border-white/20">
                  Lokálne {sharingMode === 'camera' ? '(kamera)' : sharingMode === 'screen' ? '(obrazovka)' : ''}
                </Badge>
              </div>
              {/* Remote video */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black/60 border border-border">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!remoteStream && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                    <Monitor className="w-7 h-7 text-muted-foreground mb-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Čaká sa na obraz od peera…
                    </p>
                  </div>
                )}
                <Badge className="absolute top-2 left-2 bg-black/60 text-white border-white/20">
                  Vzdialené
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {sharingMode ? (
                <Button variant="destructive" size="sm" onClick={onStop}>
                  <Square className="w-4 h-4 mr-1" />
                  Zastaviť zdieľanie
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={onCamera}>
                    <Camera className="w-4 h-4 mr-1" />
                    Spustiť kameru
                  </Button>
                  <Button size="sm" variant="outline" onClick={onScreen}>
                    <Monitor className="w-4 h-4 mr-1" />
                    Zdieľať obrazovku
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Controls + chat + events */}
      <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
        {/* Sky controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Ovládanie oblohy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" /> Režim
                </label>
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                  <Switch
                    checked={view.mode === 'night'}
                    onCheckedChange={(c) => setView({ mode: c ? 'night' : 'day' })}
                    aria-label="Prepnúť deň/noc"
                  />
                  <Moon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <label>Zoom oblohy</label>
                <span className="font-mono text-muted-foreground">×{view.zoom.toFixed(1)}</span>
              </div>
              <Slider
                value={[view.zoom]}
                min={0.5}
                max={4}
                step={0.1}
                onValueChange={(v) => setView({ zoom: v[0] })}
                aria-label="Zoom"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Azimut</label>
                <Slider
                  value={[view.az]}
                  min={0}
                  max={359}
                  step={1}
                  onValueChange={(v) => setView({ az: v[0] })}
                  aria-label="Azimut"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Výška</label>
                <Slider
                  value={[view.alt]}
                  min={0}
                  max={90}
                  step={1}
                  onValueChange={(v) => setView({ alt: v[0] })}
                  aria-label="Výška nad horizontom"
                />
              </div>
            </div>

            {/* Quick view presets */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Compass className="w-3 h-3" /> Rýchle pohľady
              </label>
              <div className="grid grid-cols-5 gap-1">
                <Button variant="outline" size="sm" className="h-7 px-1 text-[10px]" onClick={() => setView({ az: 0, alt: 15 })}>
                  Juh
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[10px]" onClick={() => setView({ az: 90, alt: 15 })}>
                  Západ
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[10px]" onClick={() => setView({ az: 180, alt: 15 })}>
                  Sever
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[10px]" onClick={() => setView({ az: 270, alt: 15 })}>
                  Východ
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-1 text-[10px]" onClick={() => setView({ az: 0, alt: 85 })}>
                  Zenit
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <Grid3x3 className="w-3.5 h-3.5" />
                  Mriežka altitude
                </label>
                <Switch checked={view.showGrid} onCheckedChange={(c) => setView({ showGrid: c })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Názvy hviezd
                </label>
                <Switch checked={view.showLabels} onCheckedChange={(c) => setView({ showLabels: c })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <Spline className="w-3.5 h-3.5 text-sky-400" />
                  Súhvezdia
                </label>
                <Switch checked={view.showConstellations} onCheckedChange={(c) => setView({ showConstellations: c })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <Stars className="w-3.5 h-3.5 text-violet-300" />
                  Mliečna cesta
                </label>
                <Switch checked={view.showMilkyWay} onCheckedChange={(c) => setView({ showMilkyWay: c })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-amber-400" />
                  Planéty
                </label>
                <Switch checked={view.showPlanets} onCheckedChange={(c) => setView({ showPlanets: c })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm flex items-center gap-1.5">
                  <CircleDashed className="w-3.5 h-3.5 text-violet-400" />
                  Deep-sky objekty
                </label>
                <Switch checked={view.showDeepSky} onCheckedChange={(c) => setView({ showDeepSky: c })} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">Šírka (lat)</label>
              <label className="text-xs text-muted-foreground">Dĺžka (lng)</label>
              <Input
                type="number"
                value={view.lat}
                step={0.01}
                onChange={(e) => setView({ lat: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
              <Input
                type="number"
                value={view.lng}
                step={0.01}
                onChange={(e) => setView({ lng: parseFloat(e.target.value) || 0 })}
                className="h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleLocate} disabled={locating}>
              {locating ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Zisťujem polohu…</>
              ) : (
                <><LocateFixed className="w-3.5 h-3.5 mr-1.5" /> Zistiť moju polohu (GPS)</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Predvolené: Bratislava (48.15°N, 17.11°E). Zmeňte pre svoju polohu.
            </p>

            {/* Bookmarked stars */}
            {bookmarks.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3 text-amber-400" />
                  Obľúbené hviezdy ({bookmarks.length})
                </label>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto sky-scroll">
                  {bookmarks.map((name) => {
                    const star = ALL_STARS.find((s) => s.name === name)
                    if (!star) return null
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          const lst = localSiderealTime(new Date(), view.lng)
                          const altAz = equatorialToHorizontal(star.ra, star.dec, lst, view.lat)
                          if (altAz.alt > 0) setView({ az: altAz.az, alt: Math.max(15, altAz.alt) })
                          else setView({ az: altAz.az, alt: 10 })
                          setSelectedStar({
                            name: star.name,
                            con: star.con,
                            ra: star.ra,
                            dec: star.dec,
                            mag: star.mag,
                            altAz,
                          })
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30 hover:bg-amber-500/25 transition-colors"
                        title={`${name} — ${star.con}`}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meteor showers */}
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              Meteorické roje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MeteorShowersPanel />
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pozorovania
              </span>
              <div className="flex items-center gap-2">
                {meteorCount > 0 && (
                  <Badge variant="outline" className="text-rose-300 border-rose-400/40">
                    Meteory: {meteorCount}
                  </Badge>
                )}
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleExport} title="Exportovať do CSV" disabled={events.length === 0}>
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleExportJson} title="Exportovať do JSON" disabled={events.length === 0}>
                  <FileJson className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={clearEvents} title="Vymazať všetky">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="border-rose-400/30 text-rose-300 hover:bg-rose-500/10" onClick={() => markEvent('meteor')}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Meteor
              </Button>
              <Button size="sm" variant="outline" className="border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10" onClick={() => markEvent('satellite')}>
                <Satellite className="w-3.5 h-3.5 mr-1" />
                Satelit
              </Button>
              <Button size="sm" variant="outline" className="border-sky-400/30 text-sky-300 hover:bg-sky-500/10" onClick={() => markEvent('planet')}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Planéta
              </Button>
              <Button size="sm" variant="outline" onClick={() => markEvent('note')}>
                <StickyNote className="w-3.5 h-3.5 mr-1" />
                Poznámka
              </Button>
            </div>
            <ScrollArea className="h-24 sky-scroll rounded border border-border/50">
              <div className="p-2 space-y-1">
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Žiadne zaznamenané pozorovania.
                  </p>
                ) : (
                  [...events].reverse().map((e) => (
                    <div key={e.id} className="text-xs flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0">
                      <span className="flex items-center gap-1.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          e.type === 'meteor' ? 'bg-rose-400' :
                          e.type === 'satellite' ? 'bg-emerald-400' :
                          e.type === 'planet' ? 'bg-sky-400' : 'bg-amber-400'
                        }`} />
                        <span className="capitalize">{e.type}</span>
                        {e.label && <span className="text-muted-foreground">— {e.label}</span>}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        {new Date(e.at).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="flex-1 min-h-[180px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              Poznámky medzi zariadeniami
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[180px]">
            <ScrollArea className="flex-1 sky-scroll pr-2">
              <div className="space-y-2">
                {chat.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Žiadne správy. Pošlite si poznámku medzi zariadeniami.
                  </p>
                ) : (
                  chat.map((m) => (
                    <div
                      key={m.id}
                      className={`text-sm rounded-lg px-3 py-1.5 max-w-[85%] ${
                        m.from === 'me'
                          ? 'ml-auto bg-emerald-500/15 text-emerald-100 border border-emerald-400/20'
                          : m.from === 'system'
                            ? 'mx-auto bg-amber-500/10 text-amber-200 text-center text-xs'
                            : 'mr-auto bg-sky-500/15 text-sky-100 border border-sky-400/20'
                      }`}
                    >
                      {m.text}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChat() }}
                placeholder="Napíšte poznámku…"
                maxLength={500}
                className="h-9"
              />
              <Button size="icon" onClick={sendChat} disabled={!chatInput.trim()} aria-label="Odoslať">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
