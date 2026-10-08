'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Calendar, MapPin, Sparkles, Satellite, StickyNote, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SharedObservationData } from '@/lib/sky-utils'

interface SharedObservationsModalProps {
  data: SharedObservationData | null
  onClose: () => void
  onImport?: () => void
}

const EVENT_ICONS: Record<string, typeof Star> = {
  meteor: Sparkles,
  satellite: Satellite,
  planet: Star,
  note: StickyNote,
  marker: MapPin,
}

const EVENT_COLORS: Record<string, string> = {
  meteor: 'text-rose-400',
  satellite: 'text-emerald-400',
  planet: 'text-sky-400',
  note: 'text-amber-400',
  marker: 'text-white',
}

export function SharedObservationsModal({ data, onClose, onImport }: SharedObservationsModalProps) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden bg-card rounded-2xl border border-sky-400/30 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-sky-500/10 border-b border-sky-400/20">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <h2 className="font-semibold text-base">Zdieľané pozorovania</h2>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto sky-scroll p-4 space-y-3">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2">
                {data.code && (
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[9px] uppercase text-muted-foreground">Kód relácie</div>
                    <div className="font-mono text-sm">{data.code.slice(0, 3)}-{data.code.slice(3)}</div>
                  </div>
                )}
                <div className="rounded-lg bg-muted/40 p-2">
                  <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                    <Calendar className="w-2.5 h-2.5" />
                    Dátum
                  </div>
                  <div className="font-mono text-[11px]">{new Date(data.date).toLocaleString('sk-SK')}</div>
                </div>
                {data.location && (
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" />
                      Poloha
                    </div>
                    <div className="font-mono text-[11px]">
                      {data.location.lat.toFixed(2)}°, {data.location.lng.toFixed(2)}°
                    </div>
                  </div>
                )}
                {data.meteorCount !== undefined && data.meteorCount > 0 && (
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="flex items-center gap-0.5 text-[9px] uppercase text-muted-foreground">
                      <Sparkles className="w-2.5 h-2.5" />
                      Meteory
                    </div>
                    <div className="font-mono text-rose-300 text-sm">{data.meteorCount}</div>
                  </div>
                )}
              </div>

              {/* Events list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                    Pozorovania ({data.events.length})
                  </h3>
                  {onImport && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={onImport}>
                      Importovať do aktuálnej relácie
                    </Button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto sky-scroll pr-1">
                  {data.events.map((e, i) => {
                    const Icon = EVENT_ICONS[e.type] || Star
                    const color = EVENT_COLORS[e.type] || 'text-white'
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30"
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium capitalize">{e.type}</div>
                          {e.label && <div className="text-[10px] text-muted-foreground">{e.label}</div>}
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">
                          {new Date(e.time).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border/50 text-[10px] text-muted-foreground text-center">
              Tieto pozorovania boli zdieľané ako link. Kliknite „Importovať" pre pridanie do aktuálnej relácie.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
