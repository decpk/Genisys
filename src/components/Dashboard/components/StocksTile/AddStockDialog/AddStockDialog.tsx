import { useCallback } from 'react'
import { Search, TrendingUp } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import type { AddStockDialogProps } from './AddStockDialog.types'
import { useAddStockDialogData } from './useAddStockDialogData'

export function AddStockDialog({
  isOpen,
  onClose,
  existingSymbols,
  onAdd,
}: AddStockDialogProps): React.JSX.Element {
  const data = useAddStockDialogData({ isOpen, existingSymbols, onAdd, onClose })
  const { query, setQuery, results, loading, error, selectedIndex, setSelectedIndex, pickResult } = data

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(Math.min(selectedIndex + 1, Math.max(results.length - 1, 0)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(Math.max(selectedIndex - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const hit = results[selectedIndex]
        if (hit) pickResult(hit)
        else if (query.trim()) {
          // Allow free-form symbol entry when no results yet
          pickResult({
            symbol: query.trim().toUpperCase(),
            shortName: '',
            longName: '',
            exchange: '',
            quoteType: '',
          })
        }
      }
    },
    [results, selectedIndex, setSelectedIndex, query, pickResult],
  )

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight inline-flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Add a ticker
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Search Yahoo Finance for any stock, ETF, index, crypto, or FX pair.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none"
          />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AAPL, MSFT, BTC-USD, EURUSD=X…"
            className="h-9 pl-8 text-sm"
          />
          {loading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <AppLoaderGlyph size={12} />
            </div>
          )}
        </div>

        {error && (
          <div className="text-xs text-rose-500">{error}</div>
        )}

        <div className="max-h-[280px] overflow-y-auto -mx-1">
          {results.length === 0 && !loading && query.trim() && !error && (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              No matches. Press <span className="font-mono">Enter</span> to add{' '}
              <span className="font-mono">{query.trim().toUpperCase()}</span> anyway.
            </div>
          )}
          {results.map((r, idx) => {
            const active = idx === selectedIndex
            return (
              <button
                key={`${r.symbol}-${idx}`}
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => pickResult(r)}
                className={`
                  w-full text-left px-3 py-2 flex items-center gap-3 cursor-pointer transition-colors
                  ${active ? 'bg-accent/40' : 'hover:bg-accent/20'}
                `}
              >
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">
                    {r.symbol.slice(0, 4)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {r.symbol}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {r.shortName ?? r.longName ?? '—'}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  {r.quoteType ?? ''} {r.exchange ? `· ${r.exchange}` : ''}
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
