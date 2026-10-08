'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, MapPin, Clock, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONSTELLATIONS_INFO } from '@/lib/stars'

export interface StarInfo {
  name: string
  con: string
  ra: number
  dec: number
  mag: number
  altAz: { az: number; alt: number }
}

interface StarInfoPopupProps {
  star: StarInfo | null
  onClose: () => void
  onLocate?: (az: number, alt: number) => void
}

// Magnitude to description
function magDescription(mag: number): string {
  if (mag < 0) return 'Veľmi jasná — viditeľná aj za svetla'
  if (mag < 1) return 'Veľmi jasná — medzi najjasnejšími na oblohe'
  if (mag < 2) return 'Jasná — ľahko viditeľná voľným okom'
  if (mag < 3) return 'Stredne jasná — viditeľná voľným okom'
  if (mag < 4) return 'Slabšia — viditeľná mimo mesta'
  return 'Slabá — vyžaduje tmavú oblohu'
}

// RA hours to HH:MM
function raToHMS(raHours: number): string {
  const h = Math.floor(raHours)
  const m = Math.floor((raHours - h) * 60)
  const s = Math.floor(((raHours - h) * 60 - m) * 60)
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

// Dec degrees to DD° MM' SS"
function decToDMS(dec: number): string {
  const sign = dec >= 0 ? '+' : '−'
  const abs = Math.abs(dec)
  const d = Math.floor(abs)
  const m = Math.floor((abs - d) * 60)
  const s = Math.floor(((abs - d) * 60 - m) * 60)
  return `${sign}${d}° ${m.toString().padStart(2, '0')}′ ${s.toString().padStart(2, '0')}″`
}

export function StarInfoPopup({ star, onClose, onLocate }: StarInfoPopupProps) {
  const constellation = star ? CONSTELLATIONS_INFO.find((c) => c.abbr === star.con) : null

  return (
    <AnimatePresence>
      {star && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute top-3 right-3 z-20 w-64 max-w-[70%] pointer-events-auto"
        >
          <div className="rounded-xl bg-card/95 backdrop-blur-md border border-emerald-400/30 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 border-b border-emerald-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <Star className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="font-semibold text-sm truncate">{star.name}</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={onClose}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2 text-xs">
              {constellation && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Súhvezdie:</span>
                  <span className="font-medium">{constellation.nameSk}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{star.con}</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="text-[9px] uppercase text-muted-foreground">Magnitúda</div>
                  <div className="font-mono text-emerald-300 text-sm">{star.mag.toFixed(2)}</div>
                </div>
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="text-[9px] uppercase text-muted-foreground">Rektascenzia</div>
                  <div className="font-mono text-[11px]">{raToHMS(star.ra)}</div>
                </div>
              </div>

              <div className="rounded bg-muted/40 p-1.5">
                <div className="text-[9px] uppercase text-muted-foreground">Deklinácia</div>
                <div className="font-mono text-[11px]">{decToDMS(star.dec)}</div>
              </div>

              <div className="rounded bg-muted/40 p-1.5">
                <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground mb-0.5">
                  <Navigation className="w-2.5 h-2.5" />
                  Horizontové súradnice
                </div>
                <div className="font-mono text-[11px] flex justify-between">
                  <span>AZ: <span className="text-sky-300">{star.altAz.az.toFixed(1)}°</span></span>
                  <span>ALT: <span className="text-sky-300">{star.altAz.alt.toFixed(1)}°</span></span>
                </div>
                <div className={`text-[10px] mt-0.5 ${star.altAz.alt > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {star.altAz.alt > 0 ? '✓ Nad horizontom' : '✗ Pod horizontom'}
                </div>
              </div>

              <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{magDescription(star.mag)}</span>
              </div>

              {star.altAz.alt > 0 && onLocate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-[11px]"
                  onClick={() => onLocate(star.altAz.az, Math.max(15, star.altAz.alt))}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Zamerať v mape
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
