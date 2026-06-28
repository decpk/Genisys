import { useCallback, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'

/**
 * Distance (px) the user must drag the bar's inner edge before the labels
 * toggle. Kept small enough to feel responsive but large enough to avoid
 * accidental toggles on a stray click-drag.
 */
const TOGGLE_THRESHOLD_PX = 36

interface UseActivityBarLabelDragParams {
  /** Current activity-bar edge. Only `left` / `right` enable the drag. */
  position: 'left' | 'right' | 'top' | 'bottom'
  /** When false (horizontal bar or detached window) the handlers are inert. */
  enabled: boolean
}

interface LabelDragHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
}

/**
 * Lets the user drag the inner edge of a vertical ActivityBar to reveal labels
 * (drag outward) or hide them again (drag inward). Reads/writes the canonical
 * `showActivityBarLabels` setting via the store so the change persists.
 *
 * State is read live from `useSettingsStore.getState()` inside the move handler
 * to avoid stale-closure toggling during a single continuous drag.
 */
export function useActivityBarLabelDrag({
  position,
  enabled,
}: UseActivityBarLabelDragParams): LabelDragHandlers {
  const dragStartXRef = useRef<number | null>(null)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return
      e.preventDefault()
      dragStartXRef.current = e.clientX
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        /* setPointerCapture can throw if the pointer is already released */
      }
    },
    [enabled],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const startX = dragStartXRef.current
      if (startX === null) return

      const dx = e.clientX - startX
      // Normalize so a positive value always means "toward more width" (i.e.
      // outward from the content). For a right-docked bar the bar grows to the
      // left, so the sign is flipped.
      const expandDelta = position === 'right' ? -dx : dx

      const { showActivityBarLabels, setShowActivityBarLabels } = useSettingsStore.getState()

      if (!showActivityBarLabels && expandDelta > TOGGLE_THRESHOLD_PX) {
        setShowActivityBarLabels(true)
        dragStartXRef.current = e.clientX
      } else if (showActivityBarLabels && expandDelta < -TOGGLE_THRESHOLD_PX) {
        setShowActivityBarLabels(false)
        dragStartXRef.current = e.clientX
      }
    },
    [position],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragStartXRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* releasePointerCapture can throw if capture was never set */
    }
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp }
}
