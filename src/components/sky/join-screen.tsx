'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ScanLine, Keyboard, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrScanner } from './qr-scanner'
import { normalizeCode, formatCodeInput } from '@/lib/sky-utils'

interface JoinScreenProps {
  onBack: () => void
  onSubmit: (code: string) => void
  loading: boolean
  error: string | null
  initialCode?: string | null
}

export function JoinScreen({ onBack, onSubmit, loading, error, initialCode }: JoinScreenProps) {
  const [tab, setTab] = useState<'scan' | 'manual'>(initialCode ? 'manual' : 'scan')
  const [rawCode, setRawCode] = useState(initialCode ?? '')
  const [scannerActive, setScannerActive] = useState(initialCode ? false : true)

  const normalized = normalizeCode(rawCode)
  const canSubmit = normalized.length === 6 && !loading

  const handleScan = useCallback(
    (code: string) => {
      setRawCode(code)
      setScannerActive(false)
      onSubmit(code)
    },
    [onSubmit],
  )

  const handleManualSubmit = () => {
    if (canSubmit) onSubmit(normalized)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Späť
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-sky-400" />
              Pripojiť sa k relácii
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'scan' | 'manual')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="scan" disabled={loading}>
                  <ScanLine className="w-4 h-4 mr-1" />
                  QR sken
                </TabsTrigger>
                <TabsTrigger value="manual" disabled={loading}>
                  <Keyboard className="w-4 h-4 mr-1" />
                  Manuálne
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-3">
                <QrScanner onCode={handleScan} active={scannerActive && !loading} />
                {!scannerActive && !loading && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setScannerActive(true)}
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                    Spustiť skenovanie znova
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zadajte 6‑miestny kód</label>
                  <Input
                    value={rawCode}
                    onChange={(e) => {
                      // Allow only A-Z and 0-9, max 6 chars, uppercase
                      const cleaned = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 6)
                      setRawCode(cleaned)
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && canSubmit) handleManualSubmit() }}
                    placeholder="ABC123"
                    maxLength={6}
                    disabled={loading}
                    className="font-mono text-2xl font-bold tracking-[0.3em] text-center h-14"
                    autoComplete="one-time-code"
                    inputMode="text"
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formát: ABC‑123 (bez pomlčky pri zadávaní) — {normalized.length}/6 znakov
                  </p>
                </div>
                <Button
                  className="w-full"
                  disabled={!canSubmit}
                  onClick={handleManualSubmit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Overuje sa…
                    </>
                  ) : (
                    <>
                      Pripojiť sa
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
