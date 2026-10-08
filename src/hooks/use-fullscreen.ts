'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Fullscreen API hook — toggles fullscreen on a target element
 * Falls back to document.fullscreenElement
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    document.addEventListener('webkitfullscreenchange', handler as any)
    return () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler as any)
    }
  }, [])

  const enter = useCallback((element?: HTMLElement | null) => {
    const el = element || document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen()
    }
  }, [])

  const exit = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    }
  }, [])

  const toggle = useCallback((element?: HTMLElement | null) => {
    if (isFullscreen) {
      exit()
    } else {
      enter(element)
    }
  }, [isFullscreen, enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
