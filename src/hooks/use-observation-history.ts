'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SkyEvent } from '@/lib/sky-store'

const STORAGE_KEY = 'skypair-observation-history'
const MAX_HISTORY = 100

export interface HistoryEntry {
  sessionId: string
  sessionCode: string
  date: string // ISO date
  eventCount: number
  meteorCount: number
  events: SkyEvent[]
}

export function useObservationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  const saveSession = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      // Remove if same sessionId exists
      const filtered = prev.filter((h) => h.sessionId !== entry.sessionId)
      const next = [entry, ...filtered].slice(0, MAX_HISTORY)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const deleteEntry = useCallback((sessionId: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.sessionId !== sessionId)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  return { history, saveSession, deleteEntry, clearAll }
}
