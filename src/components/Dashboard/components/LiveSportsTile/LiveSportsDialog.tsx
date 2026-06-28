import { useState, useRef } from 'react'
import { Activity, Search, PenLine, ArrowRight } from 'lucide-react'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { useLiveScoresStore } from '@/store/live-scores-store'
import { useSettingsStore } from '@/store/settings-store'
import { SPORTS_CATALOG } from './sports-catalog'

interface LiveSportsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function LiveSportsDialog({ isOpen, onClose }: LiveSportsDialogProps): React.JSX.Element {
  const [customQuery, setCustomQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addSportTile = useLiveScoresStore((s) => s.addSportTile)
  const findTileByQuery = useLiveScoresStore((s) => s.findTileByQuery)
  const tileOrder = useSettingsStore((s) => s.tileOrder)
  const setTileOrder = useSettingsStore((s) => s.setTileOrder)

  const handleSportClick = (sportKey: string, defaultQuery: string): void => {
    const existing = findTileByQuery(defaultQuery)
    if (existing) {
      onClose()
      setTimeout(() => {
        const el = document.getElementById(`tile-${existing.id}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
      return
    }
    const newId = addSportTile({ query: defaultQuery, sportKey: sportKey as any })
    appendTileToOrder(newId)
    onClose()
  }

  const handleCustomSubmit = (): void => {
    const q = customQuery.trim()
    if (!q) return

    const existing = findTileByQuery(q)
    if (existing) {
      onClose()
      setTimeout(() => {
        const el = document.getElementById(`tile-${existing.id}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
      return
    }
    const newId = addSportTile({ query: q, sportKey: 'custom' })
    appendTileToOrder(newId)
    setCustomQuery('')
    onClose()
  }

  const appendTileToOrder = (newId: string): void => {
    if (tileOrder.length > 0) {
      setTileOrder([...tileOrder, newId])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomSubmit()
    } else if (e.key === 'Escape') {
      setCustomQuery('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setCustomQuery('')
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Hero header */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/8 to-transparent">
          <DialogHeader className="gap-1">
            <DialogTitle className="flex items-center gap-2.5 text-base">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/15">
                <Activity size={18} className="text-primary" />
              </div>
              Live Sports
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground/80">
              Pick a sport or enter a custom topic to track live on your dashboard.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Sports grid */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {SPORTS_CATALOG.map((sport) => {
              const ImageIcon = sport.image
              const FallbackIcon = sport.icon
              const color = sport.brandColor
              return (
                <button
                  key={sport.key}
                  onClick={() => handleSportClick(sport.key, sport.defaultQuery)}
                  className="group/sport flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <div
                    className="flex items-center justify-center size-12 rounded-xl transition-colors"
                    style={{ backgroundColor: color ? `${color}1A` : undefined }}
                  >
                    {ImageIcon ? (
                      <ImageIcon size={28} style={{ color: color ?? 'currentColor' }} />
                    ) : (
                      <FallbackIcon size={20} className="text-muted-foreground group-hover/sport:text-primary transition-colors" />
                    )}
                  </div>
                  <span className="text-xs text-foreground font-medium leading-tight">{sport.label}</span>
                </button>
              )
            })}
            {/* Custom Topic tile — visually distinct */}
            <button
              onClick={() => inputRef.current?.focus()}
              className="group/sport relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-b from-primary/10 to-primary/5 hover:border-primary/70 hover:from-primary/15 hover:to-primary/8 hover:shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.15)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-center size-12 rounded-xl bg-primary/15 group-hover/sport:bg-primary/25 transition-colors">
                <PenLine size={22} className="text-primary" />
              </div>
              <span className="text-xs text-primary font-semibold leading-tight">Custom</span>
            </button>
          </div>
        </div>

        {/* Custom topic input — always visible at bottom */}
        <div className="px-6 pb-5 pt-1">
          <div className="flex items-center gap-2 h-10 px-3 border border-transparent rounded-lg bg-muted/30 focus-within:border-input focus-within:ring-1 focus-within:ring-ring/20 focus-within:bg-background transition-colors">
            <Search size={15} className="text-muted-foreground/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search any sport, league, match, or custom topic…"
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
            <button
              onClick={handleCustomSubmit}
              disabled={!customQuery.trim()}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              Track
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
