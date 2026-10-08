'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Telescope, MousePointerClick, Search, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'skypair-onboarding-seen'

interface OnboardingStep {
  icon: typeof Telescope
  title: string
  description: string
  color: string
}

const STEPS: OnboardingStep[] = [
  {
    icon: Telescope,
    title: 'Vitajte v SkyPair',
    description: 'Webová aplikácia na pozorovanie oblohy. Spárujte dve zariadenia cez 6-miestny kód alebo QR kód a zdieľajte obraz kamery so synchronizovanou hviezdou mapou.',
    color: 'text-emerald-400',
  },
  {
    icon: MousePointerClick,
    title: 'Interaktívna obloha',
    description: 'Kliknite na hviezdu, planétu alebo deep-sky objekt pre detailné informácie. Ťahajte pre otáčanie mapy, koliesko pre zoom, dvojklik pre značku.',
    color: 'text-sky-400',
  },
  {
    icon: Search,
    title: 'Vyhľadávanie objektov',
    description: 'Použite vyhľadávanie pre rýchly presun k hviezdam, súhvezdiam a Messier objektom. Zobrazi sa aj status viditeľnosti nad/pod horizontom.',
    color: 'text-violet-400',
  },
  {
    icon: Sparkles,
    title: 'Pozorovania a upozornenia',
    description: 'Zaznamenávajte meteory, satelity a planéty. Exportujte pozorovania do CSV/JSON. Povoľte zvukové upozornenia pre audio alert pri novom objekte.',
    color: 'text-amber-400',
  },
]

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) {
        // Small delay to let the app render
        const t = setTimeout(() => setVisible(true), 800)
        return () => clearTimeout(t)
      }
    } catch {}
  }, [])

  const handleClose = () => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-card rounded-2xl border border-emerald-400/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-3 right-3 z-10">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSkip} aria-label="Preskočiť návod">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress dots */}
            <div className="absolute top-4 left-4 z-10 flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-6 bg-emerald-400' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/60'
                  }`}
                  aria-label={`Krok ${i + 1}`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="p-8 pt-12">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4 ${current.color}`}>
                  <current.icon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">{current.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between mt-6 gap-2">
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs">
                  Preskočiť
                </Button>
                <Button onClick={handleNext} size="sm" className="min-w-32">
                  {step < STEPS.length - 1 ? (
                    <>Ďalej <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
                  ) : (
                    <>Začať pozorovať <Telescope className="w-3.5 h-3.5 ml-1" /></>
                  )}
                </Button>
              </div>

              {/* Step counter */}
              <div className="text-center mt-3 text-[10px] text-muted-foreground">
                {step + 1} z {STEPS.length}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
