'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, RefreshCw, Share2, Clock, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { QrGenerator } from './qr-generator'
import { formatCode, formatCountdown, buildJoinUrl, CODE_TTL_SECONDS } from '@/lib/sky-utils'

interface HostWaitingProps {
  onBack: () => void
  onCodeReady: (code: string) => void
  onAbort: () => void
  code: string | null
  loading: boolean
  error: string | null
  onCreate: () => void
}

export function HostWaiting({
  onBack,
  onCodeReady,
  onAbort,
  code,
  loading,
  error,
  onCreate,
}: HostWaitingProps) {
  const { toast } = useToast()
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)

  // start countdown when code arrives
  useEffect(() => {
    if (code) {
      const exp = Date.now() + CODE_TTL_SECONDS * 1000
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpiresAt(exp)
    } else {
      setExpiresAt(null)
    }
  }, [code])

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => {
      const r = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) {
        onAbort()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onAbort])

  const joinUrl = code ? buildJoinUrl(code) : ''
  const displayCode = code ? formatCode(code) : ''

  const copyCode = useCallback(() => {
    if (!code) return
    navigator.clipboard?.writeText(code).then(
      () => toast({ title: 'Kód skopírovaný', description: displayCode }),
      () => toast({ title: 'Nepodarilo sa skopírovať', variant: 'destructive' }),
    )
  }, [code, displayCode, toast])

  const copyLink = useCallback(() => {
    if (!joinUrl) return
    navigator.clipboard?.writeText(joinUrl).then(
      () => toast({ title: 'Odkaz skopírovaný', description: 'Odkaz na pripojenie je v schránke' }),
      () => toast({ title: 'Nepodarilo sa skopírovať', variant: 'destructive' }),
    )
  }, [joinUrl, toast])

  const share = useCallback(async () => {
    if (!joinUrl || !navigator.share) return
    try {
      await navigator.share({ title: 'SkyPair relácia', text: `Pripoj sa: ${displayCode}`, url: joinUrl })
    } catch {
      // user cancelled
    }
  }, [joinUrl, displayCode])

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Späť
        </Button>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Čaká sa na pripojenie…
              </span>
              {code && expiresAt && (
                <Badge variant="outline" className="font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatCountdown(remaining)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading && (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
                <p className="text-sm text-muted-foreground">Generuje sa relácia…</p>
              </div>
            )}

            {error && !loading && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
                <Button onClick={onCreate} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Skúsiť znova
                </Button>
              </div>
            )}

            {code && !loading && !error && (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="shrink-0">
                    <QrGenerator value={joinUrl} size={220} />
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Kód relácie
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          readOnly
                          value={displayCode}
                          className="font-mono text-2xl font-bold tracking-[0.3em] text-center"
                        />
                        <Button size="icon" variant="outline" onClick={copyCode} aria-label="Skopírovať kód">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-muted-foreground">
                        Odkaz na pripojenie
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input readOnly value={joinUrl} className="text-xs font-mono" />
                        <Button size="icon" variant="outline" onClick={copyLink} aria-label="Skopírovať odkaz">
                          <Copy className="w-4 h-4" />
                        </Button>
                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                          <Button size="icon" variant="outline" onClick={share} aria-label="Zdieľať">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>
                        Na druhom zariadení otvorte aplikáciu, vyberte „Pripojiť sa“
                        a naskenujte tento QR kód, alebo zadajte kód ručne.
                        Po pripojení sa obrazovka prepne do režimu pozorovania.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Signaling server: pripojený, čaká sa na peer…
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
