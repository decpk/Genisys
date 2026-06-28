import type { KeyboardEvent } from 'react'
import { useEffect, useState } from 'react'

import { useCommandPaletteRecentsStore } from '@/store/command-palette-recents-store'
import { useCommandPaletteStore } from '@/store/command-palette-store'

import type {
  PaletteItem,
  PaletteKind,
  PaletteMode,
} from '../CommandPalette.types'
import { useCommandPaletteSources } from './useCommandPaletteSources'
import { usePaletteKeyboardNav } from './usePaletteKeyboardNav'
import { usePaletteSearch } from './usePaletteSearch'

export interface CommandPaletteData {
  isOpen: boolean
  mode: PaletteMode
  kindFilter: PaletteKind | null
  query: string
  cleanedQuery: string
  selectedIndex: number
  results: PaletteItem[]
  firstNonRecentIndex: number
  isLoading: boolean
  setQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
  setKindFilter: (k: PaletteKind | null) => void
  close: () => void
  invokeItem: (item: PaletteItem) => void
  onKeyDown: (e: KeyboardEvent) => void
}

const REVISION_DEBOUNCE_MS = 200

export function useCommandPaletteData(): CommandPaletteData {
  const isOpen = useCommandPaletteStore((s) => s.isOpen)
  const mode = useCommandPaletteStore((s) => s.mode)
  const kindFilter = useCommandPaletteStore((s) => s.kindFilter)
  const query = useCommandPaletteStore((s) => s.query)
  const cleanedQuery = useCommandPaletteStore((s) => s.cleanedQuery)
  const selectedIndex = useCommandPaletteStore((s) => s.selectedIndex)
  const setQuery = useCommandPaletteStore((s) => s.setQuery)
  const setSelectedIndex = useCommandPaletteStore((s) => s.setSelectedIndex)
  const setKindFilter = useCommandPaletteStore((s) => s.setKindFilter)
  const close = useCommandPaletteStore((s) => s.close)

  const recents = useCommandPaletteRecentsStore((s) => s.recents)
  const initRecents = useCommandPaletteRecentsStore((s) => s.initRecents)
  const markUsed = useCommandPaletteRecentsStore((s) => s.markUsed)
  const isRecentsLoaded = useCommandPaletteRecentsStore((s) => s.isLoaded)

  // Load persisted recents once.
  useEffect(() => {
    if (!isRecentsLoaded) {
      void initRecents()
    }
  }, [isRecentsLoaded, initRecents])

  // Bump revision on a tiny debounce after each query change so freshly-loaded
  // data appears. Opening the palette already re-evaluates sources because
  // `isOpen` is a dep of `useCommandPaletteSources`.
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!isOpen) return
    const handle = window.setTimeout(() => {
      setRevision((r) => r + 1)
    }, REVISION_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [isOpen, query])

  const { allItems, isLoading } = useCommandPaletteSources(isOpen, revision)
  const { results, firstNonRecentIndex } = usePaletteSearch({
    allItems,
    mode,
    kindFilter,
    cleanedQuery,
    recents,
  })

  const onKeyDown = usePaletteKeyboardNav({
    results,
    selectedIndex,
    setSelectedIndex,
    close,
    mode,
    setKindFilter,
    currentKindFilter: kindFilter,
    markUsed,
  })

  const invokeItem = (item: PaletteItem): void => {
    try {
      void item.action()
    } catch {
      /* swallow */
    }
    markUsed(item.id, item.kind)
    close()
  }

  return {
    isOpen,
    mode,
    kindFilter,
    query,
    cleanedQuery,
    selectedIndex,
    results,
    firstNonRecentIndex,
    isLoading,
    setQuery,
    setSelectedIndex,
    setKindFilter,
    close,
    invokeItem,
    onKeyDown,
  }
}
