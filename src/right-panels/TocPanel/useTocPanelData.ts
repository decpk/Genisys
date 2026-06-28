import { useCallback, useRef } from 'react'

import { useTocPanelContextData } from './TocPanel.context'

export function useTocPanelData() {
  const { data, actions } = useTocPanelContextData()
  const { items, activeItemId } = data
  const { onNavigate } = actions
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevActiveId = useRef<string | null>(null)

  const activeItemRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!node || !scrollContainerRef.current) return
      if (activeItemId === prevActiveId.current) return
      prevActiveId.current = activeItemId

      const container = scrollContainerRef.current
      const itemRect = node.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const isAbove = itemRect.top < containerRect.top
      const isBelow = itemRect.bottom > containerRect.bottom

      if (isAbove || isBelow) {
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    },
    [activeItemId],
  )

  return {
    items,
    activeItemId,
    scrollContainerRef,
    activeItemRef,
    onNavigate,
  }
}
