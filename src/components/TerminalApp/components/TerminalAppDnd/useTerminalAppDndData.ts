import {
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useCallback, useState } from 'react'

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { findLeafByTabId } from '@/store/terminal-app-store/treeUtils'
import type { TermTab } from '@/store/terminal-app-store/types'

import { dispatchTerminalDragEnd } from './dispatchTerminalDragEnd'
import { parseTerminalTabSortableId } from './terminalAppDragIds'

interface UseTerminalAppDndDataResult {
  sensors: ReturnType<typeof useSensors>
  collisionDetection: CollisionDetection
  /** Tab currently being dragged (for the drag overlay), else null. */
  activeTab: TermTab | null
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
}

export function useTerminalAppDndData(): UseTerminalAppDndDataResult {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    dispatchTerminalDragEnd(event)
  }, [])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  let activeTab: TermTab | null = null
  if (activeId) {
    const parsed = parseTerminalTabSortableId(activeId)
    if (parsed) {
      const leaf = findLeafByTabId(useTerminalAppStore.getState().tree, parsed.tabId)
      activeTab = leaf?.tabs.find((t) => t.id === parsed.tabId) ?? null
    }
  }

  return {
    sensors,
    collisionDetection: pointerWithin,
    activeTab,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  }
}
