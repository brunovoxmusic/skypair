'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, ChevronDown, MousePointerClick, Search, Camera, Sparkles, Keyboard, Flame, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FaqItem {
  icon: typeof HelpCircle
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    icon: MousePointerClick,
    question: 'Ako ovládam hviezdnu mapu?',
    answer: 'Ťahajte myšou (alebo prstom) pre otáčanie mapy. Koliesko myši približuje/odďaľuje. Kliknite na hviezdu, planétu alebo deep-sky objekt pre detailné informácie. Dvojklik pridá značku.',
  },
  {
    icon: Search,
    question: 'Ako vyhľadám objekt na oblohe?',
    answer: 'Použite vyhľadávací panel vpravo hore. Zadajte názov hviezdy (napr. „Vega"), Messier objektu („M31") alebo súhvezdia („Orion"). Výsledky ukazujú typ, magnitúdu a či je objekt nad horizontom.',
  },
  {
    icon: Camera,
    question: 'Ako zdieľam obraz kamery?',
    answer: 'Kliknite „Spustiť kameru" pre zdieľanie zadnej kamery mobilu, alebo „Zdieľať obrazovku" pre zobrazenie obrazovky počítača. Obraz sa prenesie cez WebRTC na druhé zariadenie.',
  },
  {
    icon: Sparkles,
    question: 'Čo sú meteorické roje?',
    answer: 'Meteorické roje sú obdobia zvýšenej aktivity meteorov. Panel „Meteorické roje" ukazuje aktívne roje s radiantom (miestom na oblohe, odkiaľ meteory vyletujú). Klikom na „Zamerať radiant" nastavíte mapu na danú pozíciu.',
  },
  {
    icon: Flame,
    question: 'Červený nočný režim?',
    answer: 'Červené svetlo zachováva nočné videnie — špecialne pre astronómov. Kliknite na ikonu plameňa v hornej lište. Filter sa aplikuje na celú aplikáciu okrem samotnej hviezdnej mapy.',
  },
  {
    icon: Download,
    question: 'Ako exportujem pozorovania?',
    answer: 'Po zaznamenaní udalostí (meteor, satelit, planéta) kliknite na ikonu stiahnutia (CSV) alebo JSON ikonu vedľa nej. Exportuje sa súbor s dátumom, časom a typom všetkých pozorovaní.',
  },
  {
    icon: Keyboard,
    question: 'Klávesové skratky',
    answer: 'Šípky: otáčanie mapy. + / -: zoom. N: prepnutie deň/noc. R: červený režim. M: pridaj meteor. S: pridaj satelit. Esc: zatvorenie popupov.',
  },
]

export function HelpPanel() {
  const [open, setOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => setOpen(true)}
        title="Pomocník / FAQ"
        aria-label="Otvoriť pomocníka"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-hidden bg-card rounded-2xl border border-emerald-400/30 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border-b border-emerald-400/20">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <h2 className="font-semibold text-base">Pomocník &amp; FAQ</h2>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto sky-scroll p-4 space-y-2">
                {FAQ_ITEMS.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/50 overflow-hidden bg-muted/20"
                  >
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm font-medium flex-1">{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${
                          expandedIdx === idx ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedIdx === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 pt-0 text-xs text-muted-foreground leading-relaxed pl-9">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/20 p-3 mt-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-300 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-medium">Tip</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Pre presné pozorovania povoľte GPS polohu a použite červený nočný režim. Vyhľadajte Messier objekty (M31, M42, M45) — sú to najjasnejšie deep-sky ciele pre ďalekohľad.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
