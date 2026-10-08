// ============================================================
// Sky utilities: code generation, formatting, helpers
// ============================================================

// Crockford-style alphabet (no confusing 0/O/1/I) = 32 chars
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_LENGTH = 6
export const CODE_TTL_SECONDS = 600 // 10 minutes

/** Cryptographically safe 6-char code (browser crypto) */
export function generatePairingCode(length = CODE_LENGTH): string {
  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % 32]).join('')
}

/** Normalize user input: uppercase, strip non-alphanumerics, cap length */
export function normalizeCode(input: string): string {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH)
}

/** Format code as XXX-XXX for display */
export function formatCode(code: string): string {
  const c = normalizeCode(code)
  if (c.length <= 3) return c
  return `${c.slice(0, 3)}-${c.slice(3)}`
}

/** Masked display of code while typing */
export function formatCodeInput(input: string): string {
  const c = normalizeCode(input)
  if (c.length <= 3) return c
  return `${c.slice(0, 3)}-${c.slice(3)}`
}

/** Build the join URL embedded in QR */
export function buildJoinUrl(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://sky.local')
  const c = normalizeCode(code)
  return `${base}/?join=${c}`
}

/** Parse join code from URL query (client side) */
export function parseJoinCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const j = params.get('join')
  if (!j) return null
  const c = normalizeCode(j)
  return c.length === CODE_LENGTH ? c : null
}

/** Format remaining seconds as mm:ss */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** Signaling port for XTransformPort query */
export const SIGNALING_PORT = 3003

/** Build socket.io connection options */
export function signalingSocketOptions() {
  return {
    transports: ['websocket', 'polling'] as const,
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
    timeout: 10_000,
  }
}

// ============================================================
// Shared observations — encode/decode via base64 URL parameter
// ============================================================

export interface SharedObservationData {
  v: number
  code?: string
  date: string
  location?: { lat: number; lng: number }
  meteorCount?: number
  events: { type: string; time: string; label?: string | null }[]
}

/** Encode shared observations into a base64 URL-safe string */
export function encodeSharedObservations(data: SharedObservationData): string {
  const json = JSON.stringify(data)
  return btoa(encodeURIComponent(json))
}

/** Decode shared observations from a base64 URL-safe string */
export function decodeSharedObservations(encoded: string): SharedObservationData | null {
  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json)
    if (!data || !Array.isArray(data.events)) return null
    return data as SharedObservationData
  } catch {
    return null
  }
}

/** Parse ?obs= parameter from current URL */
export function parseSharedFromUrl(): SharedObservationData | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const obs = params.get('obs')
  if (!obs) return null
  return decodeSharedObservations(obs)
}

/** Remove ?obs= from URL without reloading */
export function cleanSharedFromUrl() {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete('obs')
  window.history.replaceState({}, '', url.toString())
}

