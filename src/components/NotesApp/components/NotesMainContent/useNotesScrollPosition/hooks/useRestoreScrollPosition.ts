import { useEffect, useRef, type MutableRefObject } from 'react'
import type { Editor } from '@tiptap/react'

import {
  SCROLL_RESTORE_MAX_WAIT_MS,
  SCROLL_RESTORE_MIN_OFFSET,
} from '../useNotesScrollPosition.constants'
import { getScrollPosition } from '../utils/getScrollPosition'

/** Approximate duration of the smooth scroll animation before saving is re-enabled. */
const SMOOTH_SCROLL_SETTLE_MS = 700

export interface UseRestoreScrollPositionParams {
  noteId: string
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>
  editor: Editor | null
  isRestoringRef: MutableRefObject<boolean>
}

/**
 * Restores the saved scroll position for a note exactly once per mount, waiting
 * (via rAF polling) for Tiptap content to hydrate so the target offset becomes
 * reachable, then smoothly scrolls to it.
 */
export function useRestoreScrollPosition(params: UseRestoreScrollPositionParams): void {
  const { noteId, scrollContainerRef, editor, isRestoringRef } = params

  const restoredRef = useRef(false)

  // Allow a fresh restore attempt whenever the active note changes.
  useEffect(() => {
    restoredRef.current = false
  }, [noteId])

  useEffect(() => {
    if (restoredRef.current) {
      return
    }

    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const target = getScrollPosition(noteId)
    if (target === undefined || target < SCROLL_RESTORE_MIN_OFFSET) {
      restoredRef.current = true
      return
    }

    const startTime = performance.now()
    let rafId: number | undefined
    let settleTimeoutId: number | undefined

    const tick = (): void => {
      const maxScroll = container.scrollHeight - container.clientHeight
      const isReachable = maxScroll >= target
      const isTimedOut = performance.now() - startTime >= SCROLL_RESTORE_MAX_WAIT_MS

      if (isReachable || isTimedOut) {
        restoredRef.current = true
        isRestoringRef.current = true

        const finalTop = Math.min(target, Math.max(0, maxScroll))
        container.scrollTo({ top: finalTop, behavior: 'smooth' })

        settleTimeoutId = window.setTimeout(() => {
          isRestoringRef.current = false
        }, SMOOTH_SCROLL_SETTLE_MS)

        rafId = undefined
        return
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId)
      }
      if (settleTimeoutId !== undefined) {
        window.clearTimeout(settleTimeoutId)
      }
      isRestoringRef.current = false
    }
  }, [noteId, editor, scrollContainerRef, isRestoringRef])
}
