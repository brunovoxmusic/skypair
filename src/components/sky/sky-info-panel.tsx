'use client'

import { useEffect, useState } from 'react'
import { Clock, Globe, Telescope, Eye } from 'lucide-react'
import { localSiderealTime, equatorialToHorizontal, CONSTELLATIONS_INFO, BRIGHT_STARS, ALL_STARS } from '@/lib/stars'
import { useSkyStore } from '@/lib/sky-store'
import { Badge } from '@/components/ui/badge'

export function SkyInfoPanel() {
  const view = useSkyStore((s) => s.view)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const lst = localSiderealTime(now, view.lng)
  const lstH = Math.floor(lst)
  const lstM = Math.floor((lst - lstH) * 60)
  const lstS = Math.floor(((lst - lstH) * 60 - lstM) * 60)

  // Compute currently visible constellations (at least 1 bright star above horizon)
  const visibleCons = new Set<string>()
  for (const star of ALL_STARS) {
    const altAz = equatorialToHorizontal(star.ra, star.dec, lst, view.lat)
    if (altAz.alt > 5) {
      visibleCons.add(star.con)
    }
  }
  const visibleInfo = CONSTELLATIONS_INFO.filter((c) => visibleCons.has(c.abbr))

  // Count visible bright stars
  let visibleBright = 0
  for (const s of BRIGHT_STARS) {
    const a = equatorialToHorizontal(s.ra, s.dec, lst, view.lat)
    if (a.alt > 0) visibleBright++
  }

  const utcTime = now.toUTCString().split(' ').slice(4, 5)[0] || ''

  return (
    <div className="space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] uppercase">Miestny čas</span>
          </div>
          <div className="font-mono text-sm">
            {now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
            <Globe className="w-3 h-3" />
            <span className="text-[10px] uppercase">Hviezdny čas</span>
          </div>
          <div className="font-mono text-sm text-emerald-300">
            {lstH.toString().padStart(2, '0')}:{lstM.toString().padStart(2, '0')}:{lstS.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/40 p-2">
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <Telescope className="w-3 h-3" />
          <span className="text-[10px] uppercase">Pozorovateľné</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>Jasných hviezd:</span>
          <Badge variant="outline" className="font-mono">{visibleBright} / {BRIGHT_STARS.length}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs mt-0.5">
          <span>Súhvezdí:</span>
          <Badge variant="outline" className="font-mono">{visibleCons.size}</Badge>
        </div>
      </div>

      {visibleInfo.length > 0 && (
        <div className="rounded-lg bg-muted/40 p-2">
          <div className="flex items-center gap-1 text-muted-foreground mb-1">
            <Eye className="w-3 h-3" />
            <span className="text-[10px] uppercase">Viditeľné súhvezdia</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {visibleInfo.slice(0, 8).map((c) => (
              <span key={c.abbr} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-400/20" title={c.nameSk}>
                {c.nameSk}
              </span>
            ))}
            {visibleInfo.length > 8 && (
              <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
                +{visibleInfo.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="rounded-lg bg-muted/30 p-2 text-[10px] text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Poloha:</span>
          <span className="font-mono">{view.lat.toFixed(2)}°, {view.lng.toFixed(2)}°</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span>Dátum:</span>
          <span className="font-mono">{now.toLocaleDateString('sk-SK')}</span>
        </div>
      </div>
    </div>
  )
}
