import { useCallback, useRef, useState } from 'react'

import { useResizeHandle } from '@/hooks'

interface UseResizablePanelOptions {
  minWidth: number;
  maxWidth: number;
  defaultWidth: number;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  onWidthChange?: (width: number) => void;
  direction?: "left" | "right";
}

export function useResizablePanel({
  minWidth,
  maxWidth,
  defaultWidth,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapseChange,
  onWidthChange,
  direction
}: UseResizablePanelOptions) {
  const isControlled = controlledCollapsed !== undefined
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed

  const [width, setWidth] = useState(defaultWidth)
  const lastWidth = useRef(defaultWidth)

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth)
    lastWidth.current = newWidth
    onWidthChange?.(newWidth)
  }, [onWidthChange])

  const collapseViaResize = useCallback(() => {
    lastWidth.current = width;
    if (!isControlled) {
      setInternalCollapsed(true);
    }
    onCollapseChange?.(true);
  }, [width, isControlled, onCollapseChange]);

  const expandViaResize = useCallback((newWidth: number) => {
    const w = Math.min(maxWidth, Math.max(minWidth, newWidth))
    setWidth(w)
    lastWidth.current = w
    onWidthChange?.(w)
    if (!isControlled) {
      setInternalCollapsed(false)
    }
    onCollapseChange?.(false)
  }, [minWidth, maxWidth, isControlled, onCollapseChange, onWidthChange])

  const { handleMouseDown: handleResizeMouseDown } = useResizeHandle({
    width,
    minWidth,
    maxWidth,
    resetWidth: defaultWidth,
    direction,
    onWidthChange: handleWidthChange,
    collapseThreshold: minWidth * 0.5,
    onCollapse: collapseViaResize,
    onExpand: expandViaResize,
  });

  const rafId = useRef(0)

  const handleExpandMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const startPos = e.clientX
      const sign = direction === 'left' ? -1 : 1
      let dragWidth = 0
      let expanded = false

      const onMouseMove = (moveEvent: MouseEvent): void => {
        cancelAnimationFrame(rafId.current)
        rafId.current = requestAnimationFrame(() => {
          const currentPos = moveEvent.clientX
          const delta = (currentPos - startPos) * sign
          dragWidth = delta
          if (!expanded && dragWidth >= minWidth * 0.5) {
            expanded = true
            expandViaResize(dragWidth)
          }
          if (expanded) {
            const w = Math.min(maxWidth, Math.max(minWidth, dragWidth))
            setWidth(w)
            lastWidth.current = w
            onWidthChange?.(w)
          }
        })
      }

      const onMouseUp = (): void => {
        cancelAnimationFrame(rafId.current)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [direction, minWidth, maxWidth, expandViaResize, onWidthChange]
  )

  const toggleCollapse = useCallback(() => {
    const next = !collapsed
    if (next) {
      lastWidth.current = width
    } else {
      setWidth(lastWidth.current)
    }
    if (!isControlled) {
      setInternalCollapsed(next)
    }
    onCollapseChange?.(next)
  }, [collapsed, width, isControlled, onCollapseChange])

  return { width, collapsed, handleResizeMouseDown, handleExpandMouseDown, toggleCollapse }
}
