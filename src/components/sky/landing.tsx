'use client'

import { motion } from 'framer-motion'
import { Telescope, QrCode, Radio, ShieldCheck, Wifi, Globe, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LandingProps {
  onHost: () => void
  onJoin: () => void
}

export function Landing({ onHost, onJoin }: LandingProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* starry bg overlay */}
      <div className="absolute inset-0 starry-bg opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 mb-4"
          >
            <Telescope className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
            SkyPair
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Pozorovanie nočnej a dennej oblohy s prepojením dvoch zariadení.
            Spárujte telefón s notebookom cez 6‑miestny kód alebo QR kód a
            zdieľajte obraz kamery so synchronizovanou hviezdou mapou.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* HOST */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group h-full overflow-hidden border-emerald-500/20 hover:border-emerald-400/50 transition-colors bg-card/80 backdrop-blur">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Vytvoriť reláciu</h2>
                    <p className="text-xs text-muted-foreground">Hostiteľ / primárne zariadenie</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5 flex-1">
                  Vygeneruje sa 6‑miestny kód a QR kód. Zobrazí sa na obrazovke
                  pre spárovanie s druhým zariadením. Po spárovaní môžete zdieľať
                  obraz kamery alebo obrazovky.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <Radio className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <span>Jedinečný kód s platnosťou 10 min</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <span>Šifrované P2P cez WebRTC (DTLS‑SRTP)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    <span>Funguje na lokálnej Wi‑Fi aj cez internet</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full group/btn" onClick={onHost}>
                  Vytvoriť reláciu
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* JOIN */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="group h-full overflow-hidden border-sky-500/20 hover:border-sky-400/50 transition-colors bg-card/80 backdrop-blur">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <Telescope className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Pripojiť sa</h2>
                    <p className="text-xs text-muted-foreground">Klient / družobné zariadenie</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5 flex-1">
                  Naskenujte QR kód zo zariadenia hostiteľa alebo zadajte
                  6‑miestny kód ručne. Pripojíte sa k relácii a uvidíte
                  zdieľaný obraz kamery a synchronizovanú hviezdnu mapu.
                </p>
                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-start gap-2">
                    <QrCode className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />
                    <span>QR čítačka cez zadnú kameru</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Wifi className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />
                    <span>Manuálne zadanie kódu ako alternatíva</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 text-sky-400 shrink-0" />
                    <span>Rate‑limited overenie kódu</span>
                  </li>
                </ul>
                <Button size="lg" variant="secondary" className="w-full group/btn" onClick={onJoin}>
                  Pripojiť sa k relácii
                  <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
        >
          {[
            { icon: ShieldCheck, label: 'E2E šifrovanie', sub: 'DTLS‑SRTP' },
            { icon: Globe, label: 'Bez inštalácie', sub: 'čistý web' },
            { icon: Radio, label: 'Realtime sync', sub: '< 1 s' },
            { icon: Telescope, label: '80+ hviezd', sub: 'jasný katalóg' },
          ].map((f) => (
            <div key={f.label} className="p-3 rounded-lg bg-card/40 border border-border/50">
              <f.icon className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground" />
              <div className="text-xs font-medium">{f.label}</div>
              <div className="text-[10px] text-muted-foreground">{f.sub}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
