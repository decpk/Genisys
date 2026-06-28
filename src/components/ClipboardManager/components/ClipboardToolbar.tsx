import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { useClipboardStore } from '@/store/clipboard-store'
import { Tooltip } from '@/components/Tooltip'
import { getFilteredItems } from '../utils/getFilteredItems'
import { AnalyzePendingImagesButton } from './AnalyzePendingImagesButton'

const FUZZY_TOOLTIP_CONTENT = (
  <div className="flex flex-col gap-2 text-xs w-72">
    <span className="font-medium text-sm">Fuzzy Search</span>
    <span className="text-muted-foreground leading-relaxed">
      Find clipboard items even with typos, missing characters, or partial words.
      Results are ranked by relevance — best matches appear first.
      Works across both text content and image descriptions.
    </span>
    <div className="flex flex-col gap-1 mt-1 rounded-md bg-muted/50 p-2">
      <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Examples</span>
      <div className="flex items-center gap-2">
        <code className="text-primary/80 bg-primary/10 px-1 rounded text-[11px]">helo</code>
        <span className="text-muted-foreground">→</span>
        <span className="text-foreground/80">Hello World</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-primary/80 bg-primary/10 px-1 rounded text-[11px]">jvascript</code>
        <span className="text-muted-foreground">→</span>
        <span className="text-foreground/80">JavaScript Tutorial</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-primary/80 bg-primary/10 px-1 rounded text-[11px]">rct cmp</code>
        <span className="text-muted-foreground">→</span>
        <span className="text-foreground/80">React Component</span>
      </div>
    </div>
  </div>
)

export function ClipboardToolbar(): React.JSX.Element {
  const setSearchQuery = useClipboardStore((s) => s.setSearchQuery)
  const searchQuery = useClipboardStore((s) => s.searchQuery)
  const stats = useClipboardStore((s) => s.stats)
  const items = useClipboardStore((s) => s.items)
  const filter = useClipboardStore((s) => s.filter)
  const isFuzzySearch = useClipboardStore((s) => s.isFuzzySearch)
  const toggleFuzzySearch = useClipboardStore((s) => s.toggleFuzzySearch)
  const filteredCount = useMemo(() => getFilteredItems(items, filter).length, [items, filter])
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        const el = inputRef.current
        if (!el) return
        el.focus()
        el.select()
      })
    }
    window.addEventListener('clipboard:focus-search', handler)
    return () => window.removeEventListener('clipboard:focus-search', handler)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSearchQuery(value), 300)
  }, [setSearchQuery])

  const handleClear = useCallback(() => {
    setLocalQuery('')
    setSearchQuery('')
  }, [setSearchQuery])

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={localQuery}
          onChange={handleChange}
          placeholder={isFuzzySearch ? 'Fuzzy search clipboard...' : 'Search clipboard...'}
          className="w-full h-8 pl-8 pr-8 rounded-md border border-transparent bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-input focus:ring-1 focus:ring-ring/20"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <Tooltip content={FUZZY_TOOLTIP_CONTENT} side="bottom" variant="popover" interactive className="!whitespace-normal">
        <button
          onClick={toggleFuzzySearch}
          className={`flex items-center justify-center size-8 rounded-md border transition-colors ${
            isFuzzySearch
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-border/50 bg-background text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles size={14} />
        </button>
      </Tooltip>
      <AnalyzePendingImagesButton />
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {filteredCount} items
      </span>
    </div>
  )
}
