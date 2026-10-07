'use client'

import { Telescope, Github, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Telescope className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm sm:text-base leading-tight truncate">SkyPair</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate">
              Pozorovanie oblohy · P2P · WebRTC
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <a href="/RESEARCH_REPORT.md" target="_blank" rel="noopener">
              <BookOpen className="w-4 h-4 mr-1" />
              Report
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WebRTC docs"
            >
              <Github className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
