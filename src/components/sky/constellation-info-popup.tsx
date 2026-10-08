'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Stars, Calendar, Eye, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CONSTELLATIONS_INFO, ALL_STARS, equatorialToHorizontal, localSiderealTime } from '@/lib/stars'

export interface ConstellationInfo {
  abbr: string
  name: string
  nameSk: string
  bestMonth: string
  altAz: { az: number; alt: number }
  visibleStars: number
  totalStars: number
}

interface ConstellationInfoPopupProps {
  constellation: ConstellationInfo | null
  onClose: () => void
  onLocate?: (az: number, alt: number) => void
}

export function ConstellationInfoPopup({ constellation, onClose, onLocate }: ConstellationInfoPopupProps) {
  return (
    <AnimatePresence>
      {constellation && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute top-3 right-3 z-20 w-64 max-w-[70%] pointer-events-auto"
        >
          <div className="rounded-xl bg-card/95 backdrop-blur-md border border-sky-400/30 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-sky-500/10 border-b border-sky-400/20">
              <div className="flex items-center gap-2 min-w-0">
                <Stars className="w-4 h-4 text-sky-400 shrink-0" />
                <h3 className="font-semibold text-sm truncate">{constellation.nameSk}</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={onClose}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Latinský názov:</span>
                <span className="italic">{constellation.name}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-auto">{constellation.abbr}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                    <Eye className="w-2.5 h-2.5" />
                    Viditeľné hviezdy
                  </div>
                  <div className="font-mono text-sky-300 text-sm">
                    {constellation.visibleStars} / {constellation.totalStars}
                  </div>
                </div>
                <div className="rounded bg-muted/40 p-1.5">
                  <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                    <Calendar className="w-2.5 h-2.5" />
                    Najlepšie
                  </div>
                  <div className="font-mono text-[11px]">{constellation.bestMonth}</div>
                </div>
              </div>

              <div className="rounded bg-muted/40 p-1.5">
                <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground mb-0.5">
                  <Navigation className="w-2.5 h-2.5" />
                  Stred súhvezdia
                </div>
                <div className="font-mono text-[11px] flex justify-between">
                  <span>AZ: <span className="text-sky-300">{constellation.altAz.az.toFixed(1)}°</span></span>
                  <span>ALT: <span className="text-sky-300">{constellation.altAz.alt.toFixed(1)}°</span></span>
                </div>
                <div className={`text-[10px] mt-0.5 ${constellation.altAz.alt > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {constellation.altAz.alt > 0 ? '✓ Nad horizontom' : '✗ Pod horizontom'}
                </div>
              </div>

              <div className="rounded bg-muted/30 p-1.5 text-[10px] text-muted-foreground leading-relaxed">
                Súhvezdie obsahuje {constellation.totalStars} jasných hviezd z katalógu. Najlepšie pozorovateľné v mesiaci {constellation.bestMonth.toLowerCase()}.
              </div>

              {constellation.altAz.alt > 0 && onLocate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-[11px]"
                  onClick={() => onLocate(constellation.altAz.az, Math.max(15, constellation.altAz.alt))}
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

/** Helper to build constellation info from abbr + current view */
export function buildConstellationInfo(
  abbr: string,
  lat: number,
  lng: number,
): ConstellationInfo | null {
  const info = CONSTELLATIONS_INFO.find((c) => c.abbr === abbr)
  if (!info) return null
  const conStars = ALL_STARS.filter((s) => s.con === abbr)
  if (conStars.length === 0) return null
  const avgRa = conStars.reduce((sum, s) => sum + s.ra, 0) / conStars.length
  const avgDec = conStars.reduce((sum, s) => sum + s.dec, 0) / conStars.length
  const lst = localSiderealTime(new Date(), lng)
  const altAz = equatorialToHorizontal(avgRa, avgDec, lst, lat)
  const visibleStars = conStars.filter((s) => {
    const a = equatorialToHorizontal(s.ra, s.dec, lst, lat)
    return a.alt > 0
  }).length
  return {
    abbr: info.abbr,
    name: info.name,
    nameSk: info.nameSk,
    bestMonth: info.bestMonth,
    altAz,
    visibleStars,
    totalStars: conStars.length,
  }
}
