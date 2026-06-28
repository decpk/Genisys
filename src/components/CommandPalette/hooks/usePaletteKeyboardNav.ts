import type { KeyboardEvent } from 'react'
import { useCallback } from 'react'

import type {
  PaletteItem,
  PaletteKind,
  PaletteMode,
} from '../CommandPalette.types'

interface UsePaletteKeyboardNavInput {
  results: PaletteItem[]
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  close: () => void
  mode: PaletteMode
  setKindFilter: (kind: PaletteKind | null) => void
  currentKindFilter: PaletteKind | null
  markUsed: (id: string, kind: PaletteKind) => void
}

const KIND_CYCLE: PaletteKind[] = [
  'app',
  'note',
  'book',
  'task',
  'apirequest',
  'chat',
  'mockendpoint',
  'bookmark',
  'clipboard',
]

function nextKindFilter(current: PaletteKind | null): PaletteKind | null {
  if (!current) return KIND_CYCLE[0]
  const idx = KIND_CYCLE.indexOf(current)
  if (idx === -1) return KIND_CYCLE[0]
  if (idx === KIND_CYCLE.length - 1) return null
  return KIND_CYCLE[idx + 1]
}

function invokeItem(
  item: PaletteItem,
  markUsed: (id: string, kind: PaletteKind) => void,
  close: () => void,
): void {
  try {
    void item.action()
  } catch {
    /* swallow */
  }
  markUsed(item.id, item.kind)
  close()
}

export function usePaletteKeyboardNav(input: UsePaletteKeyboardNavInput): (e: KeyboardEvent) => void {
  const {
    results,
    selectedIndex,
    setSelectedIndex,
    close,
    mode,
    setKindFilter,
    currentKindFilter,
    markUsed,
  } = input

  return useCallback(
    (event: KeyboardEvent) => {
      const total = results.length

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (total === 0) return
        const next = selectedIndex >= total - 1 ? 0 : selectedIndex + 1
        setSelectedIndex(next)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (total === 0) return
        const next = selectedIndex <= 0 ? total - 1 : selectedIndex - 1
        setSelectedIndex(next)
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        setSelectedIndex(0)
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        setSelectedIndex(Math.max(0, total - 1))
        return
      }
      if (event.key === 'Enter') {
        if (total === 0) return
        event.preventDefault()
        const item = results[selectedIndex] ?? results[0]
        invokeItem(item, markUsed, close)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
      }
      if (event.key === 'Tab' && mode === 'quick-open') {
        event.preventDefault()
        setKindFilter(nextKindFilter(currentKindFilter))
        return
      }
    },
    [results, selectedIndex, setSelectedIndex, close, mode, setKindFilter, currentKindFilter, markUsed],
  )
}
