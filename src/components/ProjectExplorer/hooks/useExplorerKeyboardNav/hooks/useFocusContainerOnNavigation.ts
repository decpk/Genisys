import { useEffect } from 'react'
import type { RefObject } from 'react'

interface UseFocusContainerOnNavigationParams {
  /** Scroll container ref to focus. */
  scrollRef: RefObject<HTMLDivElement | null>
  /** Current folder path; effect re-runs when this changes. */
  currentPath: string
}

/**
 * Effect hook that focuses the explorer scroll container whenever the current
 * folder path changes (including on initial mount).
 *
 * This makes keyboard navigation work immediately after the user clicks a
 * folder row (or on first render), without requiring an extra "click on empty
 * space" step to focus the container.
 *
 * Safety: if an interactive element (input / textarea / contenteditable) is
 * currently focused, we leave it alone — typing in a search box or rename
 * input must never be interrupted by an auto-focus call.
 */
export function useFocusContainerOnNavigation(
  params: UseFocusContainerOnNavigationParams
): void {
  const { scrollRef, currentPath } = params

  useEffect(() => {
    const active = document.activeElement as HTMLElement | null
    const isInteractive =
      !!active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable)
    if (isInteractive) return

    scrollRef.current?.focus({ preventScroll: true })
  }, [currentPath, scrollRef])
}
