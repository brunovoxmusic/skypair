'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Star, CircleDashed, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ALL_STARS, CONSTELLATIONS_INFO, localSiderealTime, equatorialToHorizontal } from '@/lib/stars'
import { MESSIER_CATALOG } from '@/lib/deep-sky'
import { useSkyStore } from '@/lib/sky-store'

export interface SearchResult {
  type: 'star' | 'dso' | 'constellation'
  id: string
  name: string
  nameSk?: string
  ra: number
  dec: number
  mag?: number
  con?: string
  description?: string
}

interface SearchPanelProps {
  onResultClick?: (result: SearchResult) => void
}

export function SearchPanel({ onResultClick }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const view = useSkyStore((s) => s.view)
  const blurTimerRef = useRef<number | null>(null)

  // Build searchable index
  const index = useMemo(() => {
    const items: SearchResult[] = []
    for (const s of ALL_STARS) {
      items.push({
        type: 'star',
        id: s.name,
        name: s.name,
        ra: s.ra,
        dec: s.dec,
        mag: s.mag,
        con: s.con,
      })
    }
    for (const d of MESSIER_CATALOG) {
      items.push({
        type: 'dso',
        id: d.messierId,
        name: d.messierId,
        nameSk: d.nameSk,
        ra: d.ra,
        dec: d.dec,
        mag: d.mag,
        con: d.constellation,
        description: d.description,
      })
    }
    for (const c of CONSTELLATIONS_INFO) {
      // approximate center from stars in constellation
      const conStars = ALL_STARS.filter((s) => s.con === c.abbr)
      if (conStars.length > 0) {
        const avgRa = conStars.reduce((sum, s) => sum + s.ra, 0) / conStars.length
        const avgDec = conStars.reduce((sum, s) => sum + s.dec, 0) / conStars.length
        items.push({
          type: 'constellation',
          id: c.abbr,
          name: c.nameSk,
          ra: avgRa,
          dec: avgDec,
          con: c.abbr,
        })
      }
    }
    return items
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()
    return index
      .filter((item) => {
        const name = item.name.toLowerCase()
        const nameSk = (item.nameSk || '').toLowerCase()
        const id = item.id.toLowerCase()
        return name.includes(q) || nameSk.includes(q) || id.includes(q)
      })
      .slice(0, 8)
  }, [query, index])

  const handleFocus = () => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current)
      blurTimerRef.current = null
    }
    setFocused(true)
  }
  const handleBlur = () => {
    blurTimerRef.current = window.setTimeout(() => setFocused(false), 200)
  }

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Hľadať hviezdu, súhvezdie, Messier…"
          className="h-8 pl-7 pr-6 text-xs"
          aria-label="Vyhľadávanie objektov na oblohe"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Vyčistiť vyhľadávanie"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {focused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-popover border border-border rounded-md shadow-lg max-h-64 overflow-y-auto sky-scroll">
          {results.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">
              Nič sa nenašlo pre „{query}”
            </div>
          ) : (
            <div className="py-1">
              {results.map((r) => {
                // Compute current alt/az
                const lst = localSiderealTime(new Date(), view.lng)
                const altAz = equatorialToHorizontal(r.ra, r.dec, lst, view.lat)
                const visible = altAz.alt > 0
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => {
                      onResultClick?.(r)
                      setQuery('')
                      setFocused(false)
                    }}
                    className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-muted/60 text-left transition-colors"
                  >
                    <span className="shrink-0">
                      {r.type === 'star' && <Star className="w-3.5 h-3.5 text-emerald-400" />}
                      {r.type === 'dso' && <CircleDashed className="w-3.5 h-3.5 text-violet-400" />}
                      {r.type === 'constellation' && <Star className="w-3.5 h-3.5 text-sky-400" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {r.name}
                        {r.nameSk && r.nameSk !== r.name && (
                          <span className="text-muted-foreground ml-1">— {r.nameSk}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        {r.type === 'star' && <span>Hviezda{r.con ? ` · ${r.con}` : ''}{r.mag ? ` · mag ${r.mag.toFixed(1)}` : ''}</span>}
                        {r.type === 'dso' && <span>Deep-sky{r.con ? ` · ${r.con}` : ''}</span>}
                        {r.type === 'constellation' && <span>Súhvezdie</span>}
                        <span className={visible ? 'text-emerald-400' : 'text-amber-400'}>
                          · {visible ? 'viditeľné' : 'pod horizontom'}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
