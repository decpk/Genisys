import { createContext, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { applyScrollPercentLabel } from '@/lib/scroll-progress/applyScrollPercentLabel'
import type { ChapterHighlight } from './chapter-highlights'

/** How long the percentage label stays visible after scrolling stops (ms). */
const LABEL_HIDE_DELAY_MS = 1200

interface ChapterTocContextValue {
  highlights: ChapterHighlight[]
  setHighlights: (h: ChapterHighlight[]) => void
  setActiveHighlightId: (id: string | null) => void
  /** Subscribe to activeHighlightId changes (only re-renders the subscribing component). */
  subscribeActiveHighlight: (cb: () => void) => () => void
  getActiveHighlightId: () => string | null
  /** Register a DOM element whose width% will be driven by scroll progress (no React re-render). */
  registerProgressBarRef: (el: HTMLDivElement | null) => void
  /** Register the percentage label element pinned to the fill's leading edge. */
  registerPercentLabelRef: (el: HTMLDivElement | null) => void
  /** Update scroll progress (0–1). Mutates the progress bar DOM element directly. */
  setScrollProgress: (p: number) => void
  scrollToHighlight: (id: string) => void
  registerScrollRef: (ref: HTMLDivElement | null) => void
}

const ChapterTocContext = createContext<ChapterTocContextValue | null>(null)

export function ChapterTocProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [highlights, setHighlights] = useState<ChapterHighlight[]>([])
  const scrollRefInternal = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const percentLabelRef = useRef<HTMLDivElement | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Active highlight (ref + subscription, no React state) ──
  const activeHighlightIdRef = useRef<string | null>(null)
  const activeHighlightListeners = useRef(new Set<() => void>())

  const subscribeActiveHighlight = useCallback((cb: () => void) => {
    activeHighlightListeners.current.add(cb)
    return () => { activeHighlightListeners.current.delete(cb) }
  }, [])

  const getActiveHighlightId = useCallback(() => activeHighlightIdRef.current, [])

  const setActiveHighlightId = useCallback((id: string | null) => {
    if (activeHighlightIdRef.current === id) return
    activeHighlightIdRef.current = id
    activeHighlightListeners.current.forEach((cb) => cb())
  }, [])

  const registerProgressBarRef = useCallback((el: HTMLDivElement | null) => {
    progressBarRef.current = el
  }, [])

  const registerPercentLabelRef = useCallback((el: HTMLDivElement | null) => {
    percentLabelRef.current = el
  }, [])

  const setScrollProgress = useCallback((p: number) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${(p * 100).toFixed(1)}%`
    }
    const label = percentLabelRef.current
    if (label) {
      applyScrollPercentLabel(label, p)
      label.style.opacity = '1'
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => {
        label.style.opacity = '0'
      }, LABEL_HIDE_DELAY_MS)
    }
  }, [])

  const registerScrollRef = useCallback((ref: HTMLDivElement | null) => {
    scrollRefInternal.current = ref
  }, [])

  const scrollToHighlight = useCallback((id: string) => {
    const el = scrollRefInternal.current?.querySelector(`#${CSS.escape(id)}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const value = useMemo(
    () => ({
      highlights,
      setHighlights,
      setActiveHighlightId,
      subscribeActiveHighlight,
      getActiveHighlightId,
      registerProgressBarRef,
      registerPercentLabelRef,
      setScrollProgress,
      scrollToHighlight,
      registerScrollRef,
    }),
    [highlights, setActiveHighlightId, subscribeActiveHighlight, getActiveHighlightId, registerProgressBarRef, registerPercentLabelRef, setScrollProgress, scrollToHighlight, registerScrollRef]
  )

  return (
    <ChapterTocContext.Provider value={value}>
      {children}
    </ChapterTocContext.Provider>
  )
}

export function useChapterToc(): ChapterTocContextValue {
  const ctx = useContext(ChapterTocContext)
  if (!ctx) throw new Error('useChapterToc must be used within ChapterTocProvider')
  return ctx
}

/** Subscribe to activeHighlightId without re-rendering the whole tree. */
export function useActiveHighlightId(): string | null {
  const { subscribeActiveHighlight, getActiveHighlightId } = useChapterToc()
  return useSyncExternalStore(subscribeActiveHighlight, getActiveHighlightId)
}
