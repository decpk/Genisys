import { useCallback, useRef } from 'react'

import type { RepoItem } from '../../../ProjectExplorer.types'
import { findPrefixMatch } from '../utils/findPrefixMatch'
import { isPrintableTypeAheadKey } from '../utils/isPrintableTypeAheadKey'

interface UseTypeAheadHandlerParams {
  items: RepoItem[]
  activeIndex: number
  navigateToIndex: (index: number) => void
}

const RESET_MS = 500

/**
 * Returns a keydown handler that builds up a short prefix from printable
 * keystrokes and jumps to the first matching item by basename
 * (case-insensitive). The prefix resets after 500ms of inactivity, matching
 * Finder / Explorer / VSCode behavior.
 *
 * When the user types a single character repeatedly, the search advances to
 * the *next* match each time (cycling through items starting with that letter).
 */
export function useTypeAheadHandler(params: UseTypeAheadHandlerParams) {
  const { items, activeIndex, navigateToIndex } = params
  const prefixRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    prefixRef.current = ''
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const scheduleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      prefixRef.current = ''
      timerRef.current = null
    }, RESET_MS)
  }, [])

  const handler = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!isPrintableTypeAheadKey(event)) return false
      if (items.length === 0) return false

      prefixRef.current += event.key

      // If the user pressed the same single char repeatedly, treat as "next match"
      // by starting the search from the current active index. Otherwise restart at 0.
      const isRepeatChar =
        prefixRef.current.length >= 2 &&
        prefixRef.current
          .split('')
          .every((c) => c.toLowerCase() === event.key.toLowerCase())
      const startIndex = isRepeatChar ? activeIndex : -1
      const searchPrefix = isRepeatChar ? event.key : prefixRef.current

      const matchIndex = findPrefixMatch(items, searchPrefix, startIndex)
      scheduleReset()

      if (matchIndex < 0) return false
      navigateToIndex(matchIndex)
      return true
    },
    [items, activeIndex, navigateToIndex, scheduleReset]
  )

  return { handler, reset }
}
