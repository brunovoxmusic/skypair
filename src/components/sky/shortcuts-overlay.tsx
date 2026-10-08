'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShortcutGroup {
  title: string
  shortcuts: { key: string; label: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Pohyb mapy',
    shortcuts: [
      { key: '← →', label: 'Otáčanie azimutu' },
      { key: '↑ ↓', label: 'Zmena výšky' },
      { key: '+ / -', label: 'Priblíženie / oddialenie' },
    ],
  },
  {
    title: 'Režimy',
    shortcuts: [
      { key: 'N', label: 'Prepnúť deň / noc' },
      { key: 'R', label: 'Červený nočný režim' },
    ],
  },
  {
    title: 'Pozorovania',
    shortcuts: [
      { key: 'M', label: 'Pridať meteor' },
      { key: 'S', label: 'Pridať satelit' },
      { key: 'Esc', label: 'Zatvoriť popupy' },
    ],
  },
]

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false)

  // Listen for '?' key to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        onClick={() => setOpen(true)}
        title="Klávesové skratky (?)"
        aria-label="Zobraziť klávesové skratky"
      >
        <Keyboard className="w-4 h-4" />
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
              className="relative w-full max-w-md bg-card rounded-2xl border border-sky-400/30 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-sky-500/10 border-b border-sky-400/20">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-sky-400" />
                  <h2 className="font-semibold text-base">Klávesové skratky</h2>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4">
                {SHORTCUT_GROUPS.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">
                      {group.title}
                    </h3>
                    <div className="space-y-1.5">
                      {group.shortcuts.map((s) => (
                        <div key={s.key} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">{s.label}</span>
                          <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-mono text-xs text-foreground min-w-[2.5rem] text-center">
                            {s.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-sky-500/10 border border-sky-400/20 p-2.5 mt-2">
                  <p className="text-xs text-sky-300 flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5" />
                    Stlač <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">?</kbd> pre zobrazenie tohto panelu
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
