'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import {
  BRIGHT_STARS,
  ALL_STARS,
  CONSTELLATION_LINES,
  PLANETS,
  generateFieldStars,
  generateMilkyWayPoints,
  localSiderealTime,
  equatorialToHorizontal,
  projectAltAz,
  magnitudeToRadius,
  starColor,
} from '@/lib/stars'
import { MESSIER_CATALOG, getDsoStyle } from '@/lib/deep-sky'
import { useSkyStore } from '@/lib/sky-store'

interface SkyMapProps {
  className?: string
  onStarClick?: (star: { name: string; con: string; ra: number; dec: number; mag: number; altAz: { az: number; alt: number } }) => void
  onDeepSkyClick?: (dso: { messierId: string; name: string; nameSk: string; type: string; ra: number; dec: number; mag: number; altAz: { az: number; alt: number } }) => void
}

export function SkyMap({ className, onStarClick, onDeepSkyClick }: SkyMapProps) {
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

  // stable ref for star click callback (avoid re-creating draw)
  const onStarClickRef = useRef(onStarClick)
  useEffect(() => {
    onStarClickRef.current = onStarClick
  })
  const onDeepSkyClickRef = useRef(onDeepSkyClick)
  useEffect(() => {
    onDeepSkyClickRef.current = onDeepSkyClick
  })

  // field stars + milky way points generated once (deterministic)
  const fieldStars = useMemo(() => generateFieldStars(420, 7), [])
  const milkyWayPoints = useMemo(() => generateMilkyWayPoints(), [])
  // star lookup map for constellation lines
  const starMap = useMemo(() => {
    const m = new Map<string, typeof BRIGHT_STARS[number]>()
    for (const s of ALL_STARS) m.set(s.name, s)
    return m
  }, [])

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

    // background gradient (night vs day) with atmospheric horizon glow
    const isNight = v.mode === 'night'
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    if (isNight) {
      bgGrad.addColorStop(0, '#070914')
      bgGrad.addColorStop(0.45, '#03040c')
      bgGrad.addColorStop(0.85, '#010206')
      bgGrad.addColorStop(1, '#000000')
    } else {
      bgGrad.addColorStop(0, '#5a8fc5')
      bgGrad.addColorStop(0.5, '#3a6a9e')
      bgGrad.addColorStop(0.85, '#1d4068')
      bgGrad.addColorStop(1, '#0f2440')
    }
    ctx.fillStyle = bgGrad
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fill()

    // Atmospheric horizon glow (subtle ring near edge when night)
    if (isNight) {
      const horizonGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius)
      horizonGrad.addColorStop(0, 'rgba(0,0,0,0)')
      horizonGrad.addColorStop(0.7, 'rgba(40,50,80,0.15)')
      horizonGrad.addColorStop(1, 'rgba(80,90,140,0.35)')
      ctx.fillStyle = horizonGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const horizonGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius)
      horizonGrad.addColorStop(0, 'rgba(0,0,0,0)')
      horizonGrad.addColorStop(0.8, 'rgba(255,200,120,0.2)')
      horizonGrad.addColorStop(1, 'rgba(255,170,80,0.45)')
      ctx.fillStyle = horizonGrad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // outer ring
    ctx.lineWidth = 2
    ctx.strokeStyle = isNight ? 'rgba(120,160,220,0.4)' : 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2)
    ctx.stroke()

    // altitude rings with degree labels
    ctx.strokeStyle = isNight ? 'rgba(120,160,220,0.18)' : 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 1
    for (const alt of [15, 30, 45, 60, 75]) {
      const r = radius * ((90 - alt) / 90)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      // degree label at top
      if (v.showGrid) {
        ctx.font = '9px ui-sans-serif, system-ui'
        ctx.fillStyle = isNight ? 'rgba(140,170,220,0.45)' : 'rgba(255,255,255,0.5)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${alt}°`, cx, cy - r)
      }
    }
    // zenith marker (cross)
    ctx.strokeStyle = isNight ? 'rgba(180,200,240,0.6)' : 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - 5, cy)
    ctx.lineTo(cx + 5, cy)
    ctx.moveTo(cx, cy - 5)
    ctx.lineTo(cx, cy + 5)
    ctx.stroke()
    ctx.fillStyle = isNight ? 'rgba(180,200,240,0.7)' : 'rgba(255,255,255,0.8)'
    ctx.beginPath()
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // azimuth compass — cardinal + intercardinal directions
    ctx.font = 'bold 13px ui-sans-serif, system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const dirs = [
      { label: 'S', az: 0, primary: true },
      { label: 'W', az: 90, primary: true },
      { label: 'N', az: 180, primary: true },
      { label: 'E', az: 270, primary: true },
      { label: 'SV', az: 45, primary: false },
      { label: 'JZ', az: 135, primary: false },
      { label: 'JV', az: 225, primary: false },
      { label: 'SZ', az: 315, primary: false },
    ]
    for (const d of dirs) {
      const ang = ((d.az - v.az + 360) % 360) * (Math.PI / 180)
      const rr = radius - (d.primary ? 14 : 12)
      const px = cx + rr * Math.sin(ang)
      const py = cy - rr * Math.cos(ang) * 0.9
      ctx.font = d.primary ? 'bold 13px ui-sans-serif, system-ui' : '9px ui-sans-serif, system-ui'
      if (d.primary) {
        ctx.fillStyle = isNight ? 'rgba(200,220,250,0.85)' : 'rgba(255,255,255,0.95)'
      } else {
        ctx.fillStyle = isNight ? 'rgba(140,160,200,0.5)' : 'rgba(255,255,255,0.6)'
      }
      ctx.fillText(d.label, px, py)
    }

    // compute LST
    const now = new Date()
    const lst = localSiderealTime(now, v.lng)

    // Milky Way band (rendered before stars, with soft glow)
    if (v.showMilkyWay && isNight) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2)
      ctx.clip()
      // draw connected band points as a thick translucent polyline
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const pt of milkyWayPoints) {
        const altAz = equatorialToHorizontal(pt.ra, pt.dec, lst, v.lat)
        if (altAz.alt < -3) continue
        const p = projectAltAz(altAz, v.az, radius)
        const dist = Math.hypot(p.x - cx, p.y - cy)
        if (dist > radius) continue
        const r = 18 * Math.sqrt(v.zoom)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        grad.addColorStop(0, `rgba(180,190,230,${0.05 + pt.intensity * 0.12})`)
        grad.addColorStop(0.5, `rgba(160,170,220,${0.03 + pt.intensity * 0.06})`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

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

    // Constellation lines (drawn under bright stars)
    if (v.showConstellations) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2)
      ctx.clip()
      ctx.strokeStyle = isNight
        ? 'rgba(110,180,220,0.35)'
        : 'rgba(255,255,255,0.45)'
      ctx.lineWidth = 1
      ctx.setLineDash([])
      for (const line of CONSTELLATION_LINES) {
        const s1 = starMap.get(line.from)
        const s2 = starMap.get(line.to)
        if (!s1 || !s2) continue
        const a1 = equatorialToHorizontal(s1.ra, s1.dec, lst, v.lat)
        const a2 = equatorialToHorizontal(s2.ra, s2.dec, lst, v.lat)
        if (a1.alt < -2 || a2.alt < -2) continue
        const p1 = projectAltAz(a1, v.az, radius)
        const p2 = projectAltAz(a2, v.az, radius)
        const d1 = Math.hypot(p1.x - cx, p1.y - cy)
        const d2 = Math.hypot(p2.x - cx, p2.y - cy)
        if (d1 > radius && d2 > radius) continue
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
      ctx.restore()
    }

    // bright stars (use ALL_STARS which includes extras for constellations)
    for (const star of ALL_STARS) {
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

    // Planets (rendered as colored discs with symbol)
    if (v.showPlanets) {
      for (const planet of PLANETS) {
        const altAz = equatorialToHorizontal(planet.ra, planet.dec, lst, v.lat)
        if (altAz.alt < -2) continue
        const p = projectAltAz(altAz, v.az, radius)
        if (!p.visible) continue
        const dist = Math.hypot(p.x - cx, p.y - cy)
        if (dist > radius) continue
        const r = magnitudeToRadius(planet.mag, v.zoom) * 1.2
        // glow ring
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3)
        glow.addColorStop(0, planet.color)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.globalAlpha = isNight ? 0.5 : 0.7
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        // core
        ctx.fillStyle = planet.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fill()
        // symbol + label
        if (v.showLabels) {
          ctx.font = '11px ui-sans-serif, system-ui'
          ctx.fillStyle = planet.color
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${planet.symbol} ${planet.name}`, p.x + r + 3, p.y)
        }
      }
    }

    // Deep sky objects (Messier catalog) — small dashed circles with labels
    if (v.showDeepSky) {
      for (const dso of MESSIER_CATALOG) {
        const altAz = equatorialToHorizontal(dso.ra, dso.dec, lst, v.lat)
        if (altAz.alt < -2) continue
        const p = projectAltAz(altAz, v.az, radius)
        if (!p.visible) continue
        const dist = Math.hypot(p.x - cx, p.y - cy)
        if (dist > radius) continue
        const style = getDsoStyle(dso.type)
        const size = Math.max(4, Math.min(14, (10 - dso.mag) * 1.5)) * Math.sqrt(v.zoom)
        // outer dashed circle
        ctx.save()
        ctx.strokeStyle = style.color
        ctx.globalAlpha = isNight ? 0.7 : 0.85
        ctx.lineWidth = 1.2
        ctx.setLineDash([2, 2])
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        // soft glow for brighter DSOs
        if (dso.mag < 5) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 1.5)
          glow.addColorStop(0, `${style.color}55`)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.globalAlpha = 0.4
          ctx.beginPath()
          ctx.arc(p.x, p.y, size * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        // label
        if (v.showLabels) {
          ctx.font = '9px ui-sans-serif, system-ui'
          ctx.fillStyle = style.color
          ctx.textAlign = 'left'
          ctx.textBaseline = 'middle'
          ctx.fillText(`${dso.messierId}`, p.x + size + 2, p.y)
        }
        ctx.restore()
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

    // Landscape silhouette near horizon (only when altitude center < 30°)
    if (v.alt < 35) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2)
      ctx.clip()
      const horizonY = cy + radius * 0.15 // approximate horizon line
      // Mountain/tree silhouette using deterministic noise
      ctx.fillStyle = isNight ? 'rgba(8,12,20,0.85)' : 'rgba(40,50,70,0.7)'
      ctx.beginPath()
      ctx.moveTo(0, radius)
      // generate silhouette using simple sine-based "hills + trees"
      const seed = 7
      for (let x = 0; x <= size; x += 4) {
        const t = x / size
        // base hills
        const hill = Math.sin(t * Math.PI * 3 + seed) * 8 + Math.sin(t * Math.PI * 7 + 2) * 4
        // occasional tree spikes
        const treeNoise = Math.sin(t * 50.3 + seed * 1.7)
        const tree = treeNoise > 0.7 ? (treeNoise - 0.7) * 25 : 0
        const y = horizonY + hill + tree + 8
        ctx.lineTo(x, y)
      }
      ctx.lineTo(size, radius)
      ctx.lineTo(0, radius)
      ctx.closePath()
      ctx.fill()
      // subtle top edge highlight
      ctx.strokeStyle = isNight ? 'rgba(60,80,120,0.4)' : 'rgba(255,200,150,0.3)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      for (let x = 0; x <= size; x += 4) {
        const t = x / size
        const hill = Math.sin(t * Math.PI * 3 + seed) * 8 + Math.sin(t * Math.PI * 7 + 2) * 4
        const treeNoise = Math.sin(t * 50.3 + seed * 1.7)
        const tree = treeNoise > 0.7 ? (treeNoise - 0.7) * 25 : 0
        const y = horizonY + hill + tree + 8
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()
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
  }, [fieldStars, milkyWayPoints, starMap])

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

  // Single click: hit-test stars and planets
  const onClick = (e: React.MouseEvent) => {
    if (!onStarClickRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.min(rect.width, rect.height)
    const radius = size / 2
    const cx = radius
    const cy = radius
    const v = viewRef.current
    const now = new Date()
    const lst = localSiderealTime(now, v.lng)

    // Hit-test bright stars (within ~12px)
    let best: { star: typeof ALL_STARS[number]; dist: number } | null = null
    for (const star of ALL_STARS) {
      const altAz = equatorialToHorizontal(star.ra, star.dec, lst, v.lat)
      if (altAz.alt < -2) continue
      const p = projectAltAz(altAz, v.az, radius)
      const dist = Math.hypot(p.x - cx, p.y - cy)
      if (dist > radius) continue
      const screenDist = Math.hypot(p.x - x, p.y - y)
      const hitRadius = Math.max(10, magnitudeToRadius(star.mag, v.zoom) * 3)
      if (screenDist < hitRadius) {
        if (!best || screenDist < best.dist) {
          best = { star, dist: screenDist }
        }
      }
    }
    if (best) {
      const altAz = equatorialToHorizontal(best.star.ra, best.star.dec, lst, v.lat)
      onStarClickRef.current({
        name: best.star.name,
        con: best.star.con,
        ra: best.star.ra,
        dec: best.star.dec,
        mag: best.star.mag,
        altAz,
      })
      return
    }

    // Hit-test deep-sky objects (Messier)
    if (onDeepSkyClickRef.current) {
      let bestDso: { dso: typeof MESSIER_CATALOG[number]; dist: number } | null = null
      for (const dso of MESSIER_CATALOG) {
        const altAz = equatorialToHorizontal(dso.ra, dso.dec, lst, v.lat)
        if (altAz.alt < -2) continue
        const p = projectAltAz(altAz, v.az, radius)
        const dist = Math.hypot(p.x - cx, p.y - cy)
        if (dist > radius) continue
        const screenDist = Math.hypot(p.x - x, p.y - y)
        const hitRadius = Math.max(8, Math.min(14, (10 - dso.mag) * 1.5) * Math.sqrt(v.zoom))
        if (screenDist < hitRadius) {
          if (!bestDso || screenDist < bestDso.dist) {
            bestDso = { dso, dist: screenDist }
          }
        }
      }
      if (bestDso) {
        const altAz = equatorialToHorizontal(bestDso.dso.ra, bestDso.dso.dec, lst, v.lat)
        onDeepSkyClickRef.current({
          messierId: bestDso.dso.messierId,
          name: bestDso.dso.name,
          nameSk: bestDso.dso.nameSk,
          type: bestDso.dso.type,
          ra: bestDso.dso.ra,
          dec: bestDso.dso.dec,
          mag: bestDso.dso.mag,
          altAz,
        })
      }
    }
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
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className="rounded-full cursor-grab active:cursor-grabbing"
        aria-label="Hviezdna mapa oblohy – ťahajte pre otáčanie, koliesko pre zoom, klik na hviezdu pre detail, dvojklik pre značku"
      />
    </div>
  )
}
