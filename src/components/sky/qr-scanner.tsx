'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import jsQR from 'jsqr'
import { normalizeCode } from '@/lib/sky-utils'

interface QrScannerProps {
  onCode: (code: string) => void
  active: boolean
  className?: string
}

export function QrScanner({ onCode, active, className }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const onCodeRef = useRef(onCode)
  useEffect(() => {
    onCodeRef.current = onCode
  })
  const lastCodeRef = useRef<string>('')
  const lastCodeAtRef = useRef<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  // tick loop stored in ref so it can schedule itself
  const tickRef = useRef<() => void>(() => {})
  useEffect(() => {
    tickRef.current = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) {
        rafRef.current = requestAnimationFrame(tickRef.current)
        return
      }
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth
        const h = video.videoHeight
        if (w && h) {
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h)
            const imageData = ctx.getImageData(0, 0, w, h)
            const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' })
            if (code && code.data) {
              let extracted = ''
              try {
                const url = new URL(code.data)
                const j = url.searchParams.get('join')
                if (j) extracted = normalizeCode(j)
              } catch {
                extracted = normalizeCode(code.data)
              }
              if (extracted.length === 6) {
                const now = Date.now()
                if (extracted !== lastCodeRef.current || now - lastCodeAtRef.current > 2500) {
                  lastCodeRef.current = extracted
                  lastCodeAtRef.current = now
                  onCodeRef.current(extracted)
                }
              }
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tickRef.current)
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      rafRef.current = requestAnimationFrame(tickRef.current)
    } catch (e: any) {
      setError(
        e?.name === 'NotAllowedError'
          ? 'Prístup ku kamere zamietnutý. Povoľte kameru v nastaveniach prehliadača.'
          : 'Nepodarilo sa spustiť kameru: ' + (e?.message || 'neznáma chyba'),
      )
    }
  }, [])

  useEffect(() => {
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      start()
    } else {
      stop()
    }
    return () => stop()
  }, [active, start, stop])

  return (
    <div className={`relative ${className || ''}`}>
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full rounded-lg bg-black aspect-[4/3] object-cover"
        aria-label="Náhľad zadnej kamery pre skenovanie QR"
      />
      <canvas ref={canvasRef} className="hidden" />
      {/* Scan overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-3/5 aspect-square border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
          <div className="w-full h-full relative overflow-hidden rounded-md">
            <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 animate-scan" />
          </div>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}
      {scanning && !error && (
        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Skenovanie aktívne – namierte na QR kód
        </div>
      )}
    </div>
  )
}
