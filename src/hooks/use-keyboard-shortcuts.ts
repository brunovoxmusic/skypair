'use client'

import { useEffect } from 'react'
import { useSkyStore } from '@/lib/sky-store'

interface UseKeyboardShortcutsArgs {
  audioEnabled: boolean
  onMeteor?: () => void
  onSatellite?: () => void
  onClosePopups?: () => void
}

/**
 * Keyboard shortcuts for sky observation:
 * - Arrow keys: rotate sky map
 * - + / -: zoom
 * - N: toggle day/night
 * - R: toggle red light mode
 * - M: add meteor event
 * - S: add satellite event
 * - Escape: close popups
 * - H: open help (handled by HelpPanel button focus)
 */
export function useKeyboardShortcuts(args: UseKeyboardShortcutsArgs) {
  const { audioEnabled, onMeteor, onSatellite, onClosePopups } = args
  const argsRef = { audioEnabled, onMeteor, onSatellite, onClosePopups }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      // Skip if modifier keys (except for some combos)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const view = useSkyStore.getState().view
      const setView = useSkyStore.getState().setView

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setView({ az: (view.az - 5 + 360) % 360 })
          break
        case 'ArrowRight':
          e.preventDefault()
          setView({ az: (view.az + 5) % 360 })
          break
        case 'ArrowUp':
          e.preventDefault()
          setView({ alt: Math.min(90, view.alt + 3) })
          break
        case 'ArrowDown':
          e.preventDefault()
          setView({ alt: Math.max(0, view.alt - 3) })
          break
        case '+':
        case '=':
          e.preventDefault()
          setView({ zoom: Math.min(4, view.zoom * 1.2) })
          break
        case '-':
        case '_':
          e.preventDefault()
          setView({ zoom: Math.max(0.5, view.zoom * 0.83) })
          break
        case 'n':
        case 'N':
          e.preventDefault()
          setView({ mode: view.mode === 'night' ? 'day' : 'night' })
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setView({ redLight: !view.redLight })
          break
        case 'm':
        case 'M':
          e.preventDefault()
          argsRef.onMeteor?.()
          break
        case 's':
        case 'S':
          e.preventDefault()
          argsRef.onSatellite?.()
          break
        case 'Escape':
          e.preventDefault()
          argsRef.onClosePopups?.()
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
