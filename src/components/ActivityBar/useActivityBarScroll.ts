import { useCallback, useEffect, useState } from 'react'

interface UseActivityBarScrollArgs {
  /** Ref to the scrollable nav element. */
  navRef: React.RefObject<HTMLElement | null>
  /** Only track overflow for the horizontal (top/bottom) bar. */
  enabled: boolean
  /**
   * Value that changes whenever the nav's scrollWidth might change without the
   * element itself resizing (e.g. toggling labels or adding/removing apps). A
   * ResizeObserver only fires on size changes, so we re-measure on this key too.
   */
  recomputeKey: unknown
}

interface UseActivityBarScrollResult {
  canScrollLeft: boolean
  canScrollRight: boolean
  /** Scroll the nav by ~70% of its width in the given direction. */
  scrollByStep: (direction: -1 | 1) => void
}

/**
 * Tracks horizontal overflow of the ActivityBar's nav row so the bar can render
 * left/right chevron affordances. The row already scrolls (overflow-x-auto with
 * a hidden scrollbar + wheel translation) but gives no visual hint that more
 * apps exist off-screen — these flags drive that hint.
 */
export function useActivityBarScroll({
  navRef,
  enabled,
  recomputeKey,
}: UseActivityBarScrollArgs): UseActivityBarScrollResult {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const update = useCallback(() => {
    const el = navRef.current
    if (!el || !enabled) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    // 1px tolerance avoids flicker from sub-pixel rounding at the extremes.
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [navRef, enabled])

  useEffect(() => {
    // Defer the first measurement to the next frame so we never call setState
    // synchronously inside the effect body. `recomputeKey` is a dependency so
    // toggling labels / changing the app count re-runs this and re-measures,
    // even though those don't resize the element (ResizeObserver wouldn't fire).
    const raf = requestAnimationFrame(update)
    const el = navRef.current
    if (!el || !enabled) {
      return () => cancelAnimationFrame(raf)
    }

    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', update)
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [navRef, enabled, update, recomputeKey])

  const scrollByStep = useCallback(
    (direction: -1 | 1) => {
      const el = navRef.current
      if (!el) return
      el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' })
    },
    [navRef],
  )

  return { canScrollLeft, canScrollRight, scrollByStep }
}
