import { useCallback, useRef } from 'react'

import type { UseResizeHandleOptions } from './useResizeHandle.types'

const DOUBLE_CLICK_THRESHOLD = 300

export function useResizeHandle({
  width,
  minWidth,
  maxWidth,
  resetWidth,
  direction = 'right',
  onWidthChange,
  collapseThreshold,
  onCollapse,
  onExpand
}: UseResizeHandleOptions) {
  const isResizing = useRef(false)
  const lastClickTime = useRef(0)
  const rafId = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()

      const now = Date.now()
      if (now - lastClickTime.current < DOUBLE_CLICK_THRESHOLD) {
        onWidthChange(resetWidth)
        lastClickTime.current = 0
        return
      }
      lastClickTime.current = now

      isResizing.current = true
      const isVertical = direction === "up" || direction === "down";
      const startPos = isVertical ? e.clientY : e.clientX;
      const startWidth = width
      const sign = direction === "left" || direction === "up" ? -1 : 1;
      let collapsedDuringDrag = false

      const onMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizing.current) return
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(() => {
          const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX;
          const delta = (currentPos - startPos) * sign;
          const rawWidth = startWidth + delta

          if (collapseThreshold !== undefined) {
            if (!collapsedDuringDrag && rawWidth < collapseThreshold) {
              collapsedDuringDrag = true
              onCollapse?.()
              return
            }
            if (collapsedDuringDrag && rawWidth >= collapseThreshold) {
              collapsedDuringDrag = false
              const clamped = Math.min(maxWidth, Math.max(minWidth, rawWidth))
              onExpand?.(clamped)
              return
            }
            if (collapsedDuringDrag) {
              return
            }
          }

          const newWidth = Math.min(maxWidth, Math.max(minWidth, rawWidth))
          onWidthChange(newWidth)
        })
      }

      const onMouseUp = (): void => {
        isResizing.current = false
        cancelAnimationFrame(rafId.current)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = isVertical ? "row-resize" : "col-resize";
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [width, minWidth, maxWidth, resetWidth, direction, onWidthChange, collapseThreshold, onCollapse, onExpand]
  )

  return { handleMouseDown }
}
