'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CircleDashed, Navigation, MapPin, Info, Ruler, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDsoStyle } from '@/lib/deep-sky'

export interface DeepSkyInfo {
  messierId: string
  name: string
  nameSk: string
  type: string
  ra: number
  dec: number
  mag: number
  altAz: { az: number; alt: number }
  size?: string
  distance?: string
  constellation?: string
  description?: string
  bestSeen?: string
}

interface DeepSkyInfoPopupProps {
  dso: DeepSkyInfo | null
  onClose: () => void
  onLocate?: (az: number, alt: number) => void
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

export function DeepSkyInfoPopup({ dso, onClose, onLocate }: DeepSkyInfoPopupProps) {
  const style = dso ? getDsoStyle(dso.type as any) : null

  return (
    <AnimatePresence>
      {dso && style && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute top-3 right-3 z-20 w-64 max-w-[70%] pointer-events-auto"
        >
          <div className="rounded-xl bg-card/95 backdrop-blur-md border border-violet-400/30 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-violet-500/10 border-b border-violet-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <CircleDashed className="w-4 h-4 text-violet-400 shrink-0" />
                <h3 className="font-semibold text-sm truncate">{dso.messierId}</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={onClose}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2 text-xs">
              <div>
                <div className="font-medium text-sm">{dso.nameSk}</div>
                <div className="text-[10px] text-muted-foreground italic">{dso.name}</div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4" style={{ color: style.color, borderColor: `${style.color}40` }}>
                  {style.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="text-[9px] uppercase text-muted-foreground">Magnitúda</div>
                  <div className="font-mono text-violet-300 text-sm">{dso.mag.toFixed(1)}</div>
                </div>
                {dso.size && (
                  <div className="rounded bg-muted/40 p-1.5">
                    <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                      <Ruler className="w-2.5 h-2.5" />
                      Veľkosť
                    </div>
                    <div className="font-mono text-[11px]">{dso.size}</div>
                  </div>
                )}
              </div>

              <div className="rounded bg-muted/40 p-1.5">
                <div className="text-[9px] uppercase text-muted-foreground">Rektascenzia / Deklinácia</div>
                <div className="font-mono text-[11px] flex justify-between">
                  <span>{raToHMS(dso.ra)}</span>
                  <span>{decToDMS(dso.dec)}</span>
                </div>
              </div>

              {dso.distance && (
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground mb-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    Vzdialenosť
                  </div>
                  <div className="font-mono text-[11px]">{dso.distance}</div>
                </div>
              )}

              <div className="rounded bg-muted/40 p-1.5">
                <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground mb-0.5">
                  <Navigation className="w-2.5 h-2.5" />
                  Horizontové súradnice
                </div>
                <div className="font-mono text-[11px] flex justify-between">
                  <span>AZ: <span className="text-sky-300">{dso.altAz.az.toFixed(1)}°</span></span>
                  <span>ALT: <span className="text-sky-300">{dso.altAz.alt.toFixed(1)}°</span></span>
                </div>
                <div className={`text-[10px] mt-0.5 ${dso.altAz.alt > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dso.altAz.alt > 0 ? '✓ Nad horizontom' : '✗ Pod horizontom'}
                </div>
              </div>

              {dso.bestSeen && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Najlepšie viditeľné: <span className="font-medium text-foreground">{dso.bestSeen}</span>
                </div>
              )}

              {dso.constellation && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Info className="w-3 h-3" />
                  Súhvezdie: <span className="font-medium text-foreground">{dso.constellation}</span>
                </div>
              )}

              {dso.description && (
                <div className="rounded bg-muted/30 p-1.5 text-[10px] text-muted-foreground italic leading-relaxed">
                  {dso.description}
                </div>
              )}

              {dso.altAz.alt > 0 && onLocate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-[11px]"
                  onClick={() => onLocate(dso.altAz.az, Math.max(15, dso.altAz.alt))}
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
