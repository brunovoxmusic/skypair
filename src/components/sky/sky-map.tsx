'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import {
  BRIGHT_STARS,
  generateFieldStars,
  localSiderealTime,
  equatorialToHorizontal,
  projectAltAz,
  magnitudeToRadius,
  starColor,
} from '@/lib/stars'
import { useSkyStore } from '@/lib/sky-store'

interface SkyMapProps {
  className?: string
}

export function SkyMap({ className }: SkyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const view = useSkyStore((s) => s.view)
  const events = useSkyStore((s) => s.events)
  const setView = useSkyStore((s) => s.setView)
  const addEvent = useSkyStore((s) => s.addEvent)

  const viewRef = useRef(view)
  useEffect(() => {
    viewRef.current = view
  })

  const eventsRef = useRef(events)
  useEffect(() => {
    eventsRef.current = events
  })

  // field stars generated once (deterministic)
  const fieldStars = useMemo(() => generateFieldStars(420, 7), [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const size = Math.min(rect.width, rect.height)
    if (size <= 0) return
    if (canvas.width !== Math.floor(size * dpr) || canvas.height !== Math.floor(size * dpr)) {
      canvas.width = Math.floor(size * dpr)
      canvas.height = Math.floor(size * dpr)
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const v = viewRef.current
    const radius = size / 2
    const cx = radius
    const cy = radius

    // background gradient (night vs day)
    const isNight = v.mode === 'night'
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    if (isNight) {
      bgGrad.addColorStop(0, '#05060f')
      bgGrad.addColorStop(0.6, '#02030a')
      bgGrad.addColorStop(1, '#000000')
    } else {
      bgGrad.addColorStop(0, '#4a7fb5')
      bgGrad.addColorStop(0.6, '#2d5687')
      bgGrad.addColorStop(1, '#16314f')
    }
    ctx.fillStyle = bgGrad
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    // outer ring
    ctx.lineWidth = 2
    ctx.strokeStyle = isNight ? 'rgba(120,160,220,0.4)' : 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2)
    ctx.stroke()

    // altitude rings
    ctx.strokeStyle = isNight ? 'rgba(120,160,220,0.15)' : 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    for (const alt of [30, 60]) {
      const r = radius * ((90 - alt) / 90)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    // zenith marker
    ctx.fillStyle = isNight ? 'rgba(150,180,230,0.5)' : 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.arc(cx, cy, 2, 0, Math.PI * 2)
    ctx.fill()

    // azimuth labels
    ctx.font = 'bold 12px ui-sans-serif, system-ui'
    ctx.fillStyle = isNight ? 'rgba(180,200,240,0.7)' : 'rgba(255,255,255,0.85)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const dirs = [
      { label: 'S', az: 0 },
      { label: 'W', az: 90 },
      { label: 'N', az: 180 },
      { label: 'E', az: 270 },
    ]
    for (const d of dirs) {
      const ang = ((d.az - v.az + 360) % 360) * (Math.PI / 180)
      const rr = radius - 14
      const px = cx + rr * Math.sin(ang)
      const py = cy - rr * Math.cos(ang) * 0.9
      ctx.fillText(d.label, px, py)
    }

    // compute LST
    const now = new Date()
    const lst = localSiderealTime(now, v.lng)

    // field stars (faint)
    for (const fs of fieldStars) {
      const altAz = equatorialToHorizontal(fs.ra, fs.dec, lst, v.lat)
      if (altAz.alt < -2) continue
      const p = projectAltAz(altAz, v.az, radius)
      if (!p.visible) continue
      const r = magnitudeToRadius(fs.mag, v.zoom) * 0.5
      const dist = Math.hypot(p.x - cx, p.y - cy)
      if (dist > radius) continue
      const alpha = Math.max(0.12, 0.6 - (fs.mag - 3.5) * 0.2)
      ctx.fillStyle = isNight
        ? `rgba(200,210,235,${alpha})`
        : `rgba(255,255,255,${Math.max(0.05, alpha * 0.6)})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // bright stars
    for (const star of BRIGHT_STARS) {
      const altAz = equatorialToHorizontal(star.ra, star.dec, lst, v.lat)
      if (altAz.alt < -2) continue
      const p = projectAltAz(altAz, v.az, radius)
      if (!p.visible) continue
      const dist = Math.hypot(p.x - cx, p.y - cy)
      if (dist > radius) continue
      const r = magnitudeToRadius(star.mag, v.zoom)
      // glow
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4)
      glow.addColorStop(0, isNight ? 'rgba(220,235,255,0.5)' : 'rgba(255,255,255,0.7)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2)
      ctx.fill()
      // core
      ctx.fillStyle = starColor(star.mag)
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
      // label
      if (v.showLabels && star.mag < 2.0) {
        ctx.font = '10px ui-sans-serif, system-ui'
        ctx.fillStyle = isNight ? 'rgba(200,215,245,0.85)' : 'rgba(255,255,255,0.95)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(star.name, p.x + r + 2, p.y)
      }
    }

    // events (markers)
    for (const e of eventsRef.current) {
      const dist = Math.hypot(e.x - cx, e.y - cy)
      if (dist > radius) continue
      const colors: Record<string, string> = {
        meteor: '#ff6b6b',
        satellite: '#6bff9e',
        planet: '#6b9eff',
        note: '#ffd86b',
        marker: '#ffffff',
      }
      const col = colors[e.type] || '#ffffff'
      ctx.strokeStyle = col
      ctx.fillStyle = col
      ctx.lineWidth = 2
      if (e.type === 'meteor') {
        ctx.beginPath()
        ctx.moveTo(e.x - 18, e.y - 6)
        ctx.lineTo(e.x, e.y)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(e.x, e.y, 3, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(e.x, e.y, 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(e.x, e.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      if (e.label) {
        ctx.font = '10px ui-sans-serif, system-ui'
        ctx.fillStyle = col
        ctx.textAlign = 'left'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(e.label, e.x + 8, e.y - 6)
      }
    }

    // center crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx - 8, cy)
    ctx.lineTo(cx + 8, cy)
    ctx.moveTo(cx, cy - 8)
    ctx.lineTo(cx, cy + 8)
    ctx.stroke()
  }, [fieldStars])

  // animation loop for smooth LST update
  useEffect(() => {
    let raf = 0
    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [draw])

  // redraw on view change
  useEffect(() => {
    draw()
  }, [view, events, draw])

  // pointer interaction
  const draggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const dx = e.clientX - lastPosRef.current.x
    const dy = e.clientY - lastPosRef.current.y
    lastPosRef.current = { x: e.clientX, y: e.clientY }
    const newAz = (viewRef.current.az + dx * 0.4 + 360) % 360
    const newAlt = Math.max(0, Math.min(90, viewRef.current.alt - dy * 0.3))
    setView({ az: newAz, alt: newAlt })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  }
  const onWheel = (e: React.WheelEvent) => {
    const z = Math.max(0.5, Math.min(4, viewRef.current.zoom * (e.deltaY < 0 ? 1.1 : 0.9)))
    setView({ zoom: z })
  }
  const onDoubleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    addEvent({
      id: Math.random().toString(36).slice(2),
      type: 'marker',
      x,
      y,
      label: 'Poznámka',
      at: Date.now(),
    })
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className || ''}`}
      style={{ touchAction: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        className="rounded-full cursor-grab active:cursor-grabbing"
        aria-label="Hviezdna mapa oblohy – ťahajte pre otáčanie, koliesko pre zoom, dvojklik pre značku"
      />
    </div>
  )
}
