import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────

export interface SearchMatch {
  index: number
  text: string
  surroundingText: string
  element: HTMLElement
}

interface ChapterSearchContextValue {
  searchQuery: string
  setSearchQuery: (q: string) => void
  currentMatchIndex: number
  totalMatches: number
  matches: SearchMatch[]
  navigateMatch: (direction: 'next' | 'prev') => void
  scrollToMatch: (index: number) => void
  clearSearch: () => void
  registerScrollRef: (ref: HTMLDivElement | null) => void
  activateSearch: () => void
  registerFocusCallback: (cb: (() => void) | null) => void
}

const ChapterSearchContext = createContext<ChapterSearchContextValue | null>(null)

// ── Helpers ──────────────────────────────────────────────────────

const CONTEXT_CHARS = 30
const MARK_CLASS_DEFAULT = 'bg-yellow-300/50 dark:bg-yellow-500/30 rounded-sm px-px'
const MARK_CLASS_ACTIVE = 'bg-orange-400/60 dark:bg-orange-500/50 rounded-sm px-px ring-2 ring-orange-400/40'

function extractSurroundingText(element: HTMLElement): string {
  const parent = element.parentElement
  if (!parent) return element.textContent || ''

  const fullText = parent.textContent || ''
  const matchText = element.textContent || ''

  // Walk text content to find approximate position
  const textBefore = fullText.substring(0, fullText.indexOf(matchText))
  const textAfter = fullText.substring(fullText.indexOf(matchText) + matchText.length)

  const before = textBefore.length > CONTEXT_CHARS
    ? '…' + textBefore.slice(-CONTEXT_CHARS)
    : textBefore
  const after = textAfter.length > CONTEXT_CHARS
    ? textAfter.slice(0, CONTEXT_CHARS) + '…'
    : textAfter

  return `${before}${matchText}${after}`
}

// ── Provider ─────────────────────────────────────────────────────

export function ChapterSearchProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [searchQuery, setSearchQueryState] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const [matches, setMatches] = useState<SearchMatch[]>([])
  const scrollRefInternal = useRef<HTMLDivElement | null>(null)
  const searchMatchesRef = useRef<HTMLElement[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusCallbackRef = useRef<(() => void) | null>(null)

  const registerFocusCallback = useCallback((cb: (() => void) | null) => {
    focusCallbackRef.current = cb
  }, [])

  const registerScrollRef = useCallback((ref: HTMLDivElement | null) => {
    scrollRefInternal.current = ref
  }, [])

  const clearSearchMarks = useCallback(() => {
    const container = scrollRefInternal.current
    if (!container) return
    const marks = container.querySelectorAll('mark[data-chapter-search]')
    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark)
        parent.normalize()
      }
    })
    searchMatchesRef.current = []
  }, [])

  const highlightActiveMatch = useCallback((idx: number) => {
    const allMatches = searchMatchesRef.current
    for (let i = 0; i < allMatches.length; i++) {
      allMatches[i].setAttribute('class', MARK_CLASS_DEFAULT)
    }
    if (idx >= 0 && idx < allMatches.length) {
      allMatches[idx].setAttribute('class', MARK_CLASS_ACTIVE)
      allMatches[idx].scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [])

  const performSearch = useCallback((query: string) => {
    const container = scrollRefInternal.current
    if (!container) return

    clearSearchMarks()

    if (!query) {
      setTotalMatches(0)
      setCurrentMatchIndex(0)
      setMatches([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const foundElements: HTMLElement[] = []

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        const tag = parent.tagName
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return NodeFilter.FILTER_REJECT
        if (parent.closest('mark[data-chapter-search]')) return NodeFilter.FILTER_REJECT
        if (!node.textContent || !node.textContent.toLowerCase().includes(lowerQuery)) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    })

    const nodesToProcess: Text[] = []
    while (walker.nextNode()) {
      nodesToProcess.push(walker.currentNode as Text)
    }

    for (const textNode of nodesToProcess) {
      const text = textNode.textContent || ''
      const lowerText = text.toLowerCase()
      const fragments: (string | { match: string })[] = []
      let lastIndex = 0
      let idx = lowerText.indexOf(lowerQuery, lastIndex)

      while (idx !== -1) {
        if (idx > lastIndex) fragments.push(text.slice(lastIndex, idx))
        fragments.push({ match: text.slice(idx, idx + lowerQuery.length) })
        lastIndex = idx + lowerQuery.length
        idx = lowerText.indexOf(lowerQuery, lastIndex)
      }
      if (lastIndex < text.length) fragments.push(text.slice(lastIndex))
      if (fragments.length <= 1) continue

      const parent = textNode.parentNode
      if (!parent) continue

      const frag = document.createDocumentFragment()
      for (const part of fragments) {
        if (typeof part === 'string') {
          frag.appendChild(document.createTextNode(part))
        } else {
          const mark = document.createElement('mark')
          mark.setAttribute('data-chapter-search', 'true')
          mark.className = 'bg-yellow-300/50 dark:bg-yellow-500/30 rounded-sm px-px'
          mark.textContent = part.match
          frag.appendChild(mark)
          foundElements.push(mark)
        }
      }
      parent.replaceChild(frag, textNode)
    }

    searchMatchesRef.current = foundElements

    // Build structured match results with surrounding context
    const structuredMatches: SearchMatch[] = foundElements.map((el, i) => ({
      index: i,
      text: el.textContent || '',
      surroundingText: extractSurroundingText(el),
      element: el,
    }))

    setTotalMatches(foundElements.length)
    setMatches(structuredMatches)

    if (foundElements.length > 0) {
      setCurrentMatchIndex(1)
      highlightActiveMatch(0)
    } else {
      setCurrentMatchIndex(0)
    }
  }, [clearSearchMarks, highlightActiveMatch])

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => performSearch(q), 150)
  }, [performSearch])

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    const allMatches = searchMatchesRef.current
    if (allMatches.length === 0) return

    setCurrentMatchIndex((prev) => {
      let nextIdx: number
      if (direction === 'next') {
        nextIdx = prev >= allMatches.length ? 1 : prev + 1
      } else {
        nextIdx = prev <= 1 ? allMatches.length : prev - 1
      }
      highlightActiveMatch(nextIdx - 1)
      return nextIdx
    })
  }, [highlightActiveMatch])

  const scrollToMatch = useCallback((index: number) => {
    const allMatches = searchMatchesRef.current
    if (index < 0 || index >= allMatches.length) return
    setCurrentMatchIndex(index + 1)
    highlightActiveMatch(index)
  }, [highlightActiveMatch])

  const clearSearch = useCallback(() => {
    setSearchQueryState('')
    clearSearchMarks()
    setTotalMatches(0)
    setCurrentMatchIndex(0)
    setMatches([])
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [clearSearchMarks])

  const activateSearch = useCallback(() => {
    focusCallbackRef.current?.()
  }, [])

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      currentMatchIndex,
      totalMatches,
      matches,
      navigateMatch,
      scrollToMatch,
      clearSearch,
      registerScrollRef,
      activateSearch,
      registerFocusCallback,
    }),
    [searchQuery, setSearchQuery, currentMatchIndex, totalMatches, matches, navigateMatch, scrollToMatch, clearSearch, registerScrollRef, activateSearch, registerFocusCallback],
  )

  return (
    <ChapterSearchContext.Provider value={value}>
      {children}
    </ChapterSearchContext.Provider>
  )
}

export function useChapterSearch(): ChapterSearchContextValue {
  const ctx = useContext(ChapterSearchContext)
  if (!ctx) throw new Error('useChapterSearch must be used within ChapterSearchProvider')
  return ctx
}
