import { useEffect } from 'react'
import type { RefObject } from 'react'

import { getRowElementByIndex } from '../utils/getRowElementByIndex'

interface UseFocusActiveRowParams {
  activeIndex: number
  scrollRef: RefObject<HTMLDivElement | null>
  /**
   * When true, the effect will call .focus() on the active row whenever
   * activeIndex changes. Set to false to avoid stealing focus (e.g. on initial
   * mount before the user has interacted with the keyboard).
   */
  enabled: boolean
}

/**
 * Effect hook that focuses the DOM element for the currently active row.
 *
 * Uses `requestAnimationFrame` to wait for the virtualizer to mount the row,
 * and passes `{ preventScroll: true }` so the focus call itself doesn't
 * scroll the container (the virtualizer already handled scrolling).
 */
export function useFocusActiveRow(params: UseFocusActiveRowParams): void {
  const { activeIndex, scrollRef, enabled } = params

  useEffect(() => {
    if (!enabled) return
    if (activeIndex < 0) return

    const raf = requestAnimationFrame(() => {
      const el = getRowElementByIndex(scrollRef.current, activeIndex)
      if (el) el.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [activeIndex, scrollRef, enabled])
}
