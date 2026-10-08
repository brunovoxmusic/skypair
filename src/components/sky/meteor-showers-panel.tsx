'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Calendar, Activity, ArrowRight } from 'lucide-react'
import { METEOR_SHOWERS, isShowerActive, daysUntilPeak, getActiveShowers } from '@/lib/meteor-showers'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSkyStore } from '@/lib/sky-store'
import { equatorialToHorizontal, localSiderealTime } from '@/lib/stars'

export function MeteorShowersPanel({ onLocateRadiant }: { onLocateRadiant?: (az: number, alt: number) => void }) {
  const view = useSkyStore((s) => s.view)
  const setView = useSkyStore((s) => s.setView)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const active = METEOR_SHOWERS.filter((s) => isShowerActive(s, now))
  const allUpcoming = METEOR_SHOWERS.map((s) => ({ s, days: daysUntilPeak(s, now) }))
    .filter((x) => x.days >= -3 && x.days <= 60)
    .sort((a, b) => Math.abs(a.days) - Math.abs(b.days))

  // Compute radiant alt/az for each active shower
  const lst = localSiderealTime(now, view.lng)
  const computeRadiant = (ra: number, dec: number) => {
    const altAz = equatorialToHorizontal(ra / 15, dec, lst, view.lat)
    return altAz
  }

  const locateRadiant = (ra: number, dec: number) => {
    const altAz = computeRadiant(ra, dec)
    if (altAz.alt > 0) {
      setView({ az: altAz.az, alt: Math.max(10, altAz.alt) })
    } else {
      // Radiant below horizon — point to general direction
      setView({ az: altAz.az, alt: 10 })
    }
    onLocateRadiant?.(altAz.az, altAz.alt)
  }

  const intensityColor = (i: string) => {
    if (i === 'major') return 'text-rose-300 border-rose-400/40 bg-rose-500/10'
    if (i === 'variable') return 'text-amber-300 border-amber-400/40 bg-amber-500/10'
    return 'text-sky-300 border-sky-400/40 bg-sky-500/10'
  }

  return (
    <div className="space-y-3">
      {/* Active now */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-xs uppercase font-medium tracking-wide text-muted-foreground">
            Aktívne teraz {active.length > 0 && `(${active.length})`}
          </span>
        </div>
        {active.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-2 py-3 text-center bg-muted/30 rounded">
            Žiadne aktívne meteorické roje.
          </p>
        ) : (
          <div className="space-y-1.5">
            {active.map((s) => {
              const r = computeRadiant(s.radiantRA, s.radiantDec)
              const days = daysUntilPeak(s, now)
              return (
                <div
                  key={s.id}
                  className="p-2 rounded-lg bg-muted/40 border border-border/50 hover:border-emerald-400/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium truncate">{s.nameSk}</span>
                        <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${intensityColor(s.intensity)}`}>
                          {s.intensity === 'major' ? 'hlavný' : s.intensity === 'variable' ? 'premenný' : 'vedľajší'}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        ZHR {s.zhr}/h · {s.speed} km/s · {s.parentBody}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className={days <= 0 ? 'text-rose-300 font-medium' : 'text-muted-foreground'}>
                      {days <= 0 ? `Maximum dnes!` : `Maximum o ${days} ${days === 1 ? 'deň' : days < 5 ? 'dni' : 'dní'}`}
                    </span>
                    <span className={r.alt > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      Radiant: {r.alt > 0 ? `${r.alt.toFixed(0)}° nad horizontom` : 'pod horizontom'}
                    </span>
                  </div>
                  <button
                    onClick={() => locateRadiant(s.radiantRA, s.radiantDec)}
                    className="mt-1.5 w-full text-[10px] flex items-center justify-center gap-1 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors"
                  >
                    Zamerať radiant
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs uppercase font-medium tracking-wide text-muted-foreground">
            Nadchádzajúce (60 dní)
          </span>
        </div>
        <ScrollArea className="h-32 sky-scroll rounded border border-border/50">
          <div className="p-1.5 space-y-1">
            {allUpcoming
              .filter((x) => !isShowerActive(x.s, now))
              .slice(0, 6)
              .map(({ s, days }) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 p-1.5 rounded hover:bg-muted/40 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{s.nameSk}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {s.peak[0]}.{s.peak[1]}. · ZHR {s.zhr}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {days <= 0 ? `dnes` : `${days}d`}
                  </Badge>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
