'use client'

import { create } from 'zustand'

export interface SkyState {
  az: number
  alt: number
  zoom: number
  lat: number
  lng: number
  mode: 'day' | 'night'
  redLight: boolean
  showGrid: boolean
  showLabels: boolean
  showConstellations: boolean
  showMilkyWay: boolean
  showPlanets: boolean
  followPeer: boolean
}

export interface SkyEvent {
  id: string
  type: 'meteor' | 'satellite' | 'planet' | 'note' | 'marker'
  x: number
  y: number
  label?: string
  at: number
}

export interface ChatMessage {
  id: string
  text: string
  from: 'me' | 'peer' | 'system'
  at: number
}

interface SkyStore {
  // connection
  role: 'host' | 'client' | null
  code: string
  sessionId: string | null
  status: 'idle' | 'creating' | 'waiting' | 'verifying' | 'connected' | 'error'
  error: string | null
  expiresAt: number | null
  peerConnected: boolean

  // sky state
  view: SkyState
  events: SkyEvent[]
  chat: ChatMessage[]
  meteorCount: number

  // actions
  setRole: (r: 'host' | 'client') => void
  setCode: (c: string) => void
  setSession: (id: string | null) => void
  setStatus: (s: SkyStore['status']) => void
  setError: (e: string | null) => void
  setExpiresAt: (t: number | null) => void
  setPeerConnected: (b: boolean) => void
  setView: (v: Partial<SkyState>) => void
  addEvent: (e: SkyEvent) => void
  clearEvents: () => void
  addChat: (m: ChatMessage) => void
  incMeteor: () => void
  reset: () => void
}

const DEFAULT_VIEW: SkyState = {
  az: 0,
  alt: 45,
  zoom: 1,
  lat: 48.1486,
  lng: 17.1077,
  mode: 'night',
  redLight: false,
  showGrid: true,
  showLabels: true,
  showConstellations: true,
  showMilkyWay: true,
  showPlanets: true,
  followPeer: true,
}

export const useSkyStore = create<SkyStore>((set) => ({
  role: null,
  code: '',
  sessionId: null,
  status: 'idle',
  error: null,
  expiresAt: null,
  peerConnected: false,
  view: DEFAULT_VIEW,
  events: [],
  chat: [],
  meteorCount: 0,

  setRole: (r) => set({ role: r }),
  setCode: (c) => set({ code: c }),
  setSession: (id) => set({ sessionId: id }),
  setStatus: (s) => set({ status: s }),
  setError: (e) => set({ error: e }),
  setExpiresAt: (t) => set({ expiresAt: t }),
  setPeerConnected: (b) => set({ peerConnected: b }),
  setView: (v) => set((s) => ({ view: { ...s.view, ...v } })),
  addEvent: (e) => set((s) => ({ events: [...s.events, e].slice(-50) })),
  clearEvents: () => set({ events: [] }),
  addChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-100) })),
  incMeteor: () => set((s) => ({ meteorCount: s.meteorCount + 1 })),
  reset: () =>
    set({
      role: null,
      code: '',
      sessionId: null,
      status: 'idle',
      error: null,
      expiresAt: null,
      peerConnected: false,
      view: DEFAULT_VIEW,
      events: [],
      chat: [],
      meteorCount: 0,
    }),
}))
