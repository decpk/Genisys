import { useEffect, type MutableRefObject } from 'react'

import { SCROLL_SAVE_DEBOUNCE_MS } from '../useNotesScrollPosition.constants'
import { setScrollPosition } from '../utils/setScrollPosition'

export interface UseSaveScrollPositionParams {
  noteId: string
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>
  isRestoringRef: MutableRefObject<boolean>
}

/**
 * Debounced persistence of the note scroll container's `scrollTop`.
 * Saving is suppressed while a programmatic restore is in progress.
 */
export function useSaveScrollPosition(params: UseSaveScrollPositionParams): void {
  const { noteId, scrollContainerRef, isRestoringRef } = params

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    let timeoutId: number | undefined

    const handleScroll = (): void => {
      if (isRestoringRef.current) {
        return
      }

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        setScrollPosition(noteId, container.scrollTop)
      }, SCROLL_SAVE_DEBOUNCE_MS)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      container.removeEventListener('scroll', handleScroll)
    }
  }, [noteId, scrollContainerRef, isRestoringRef])
}
