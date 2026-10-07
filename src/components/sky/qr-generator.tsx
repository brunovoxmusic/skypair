'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QrGeneratorProps {
  value: string
  size?: number
  className?: string
}

export function QrGenerator({ value, size = 240, className }: QrGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#0b0d1a', light: '#ffffff' },
      },
      (err: any) => {
        if (err) setError(err.message)
      },
    )
  }, [value, size])

  return (
    <div className={className}>
      {error ? (
        <div className="text-destructive text-sm">QR chyba: {error}</div>
      ) : (
        <canvas
          ref={canvasRef}
          className="rounded-lg bg-white p-2"
          aria-label={`QR kód: ${value}`}
        />
      )}
    </div>
  )
}
