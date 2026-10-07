'use client'

import { ShieldCheck, Radio, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/80 backdrop-blur">
      <div className="px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>P2P šifrované cez WebRTC (DTLS‑SRTP)</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            Signaling: socket.io
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            Bez inštalácie
          </span>
          <span className="hidden sm:inline">© {new Date().getFullYear()} SkyPair</span>
        </div>
      </div>
    </footer>
  )
}
