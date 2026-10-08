'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { searchCities, type City } from '@/lib/cities'

interface CitySearchPanelProps {
  onSelect: (city: City) => void
}

export function CitySearchPanel({ onSelect }: CitySearchPanelProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const blurTimerRef = useRef<number | null>(null)

  const results = useMemo(() => searchCities(query), [query])

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
          placeholder="Hľadať mesto…"
          className="h-8 pl-7 pr-6 text-xs"
          aria-label="Vyhľadávanie miest pre polohu"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Vyčistiť"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {focused && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto sky-scroll">
          {results.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">
              Nič sa nenašlo pre „{query}”
            </div>
          ) : (
            <div className="py-1">
              {results.map((city, i) => (
                <button
                  key={`${city.name}-${i}`}
                  onClick={() => {
                    onSelect(city)
                    setQuery('')
                    setFocused(false)
                  }}
                  className="w-full px-2.5 py-1.5 flex items-center gap-2 hover:bg-muted/60 text-left transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{city.nameSk}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {city.countrySk} · {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
