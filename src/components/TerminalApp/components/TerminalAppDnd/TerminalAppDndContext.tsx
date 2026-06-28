import { DndContext, DragOverlay } from '@dnd-kit/core'

import { TerminalAppTabGhost } from './TerminalAppTabGhost'
import { useTerminalAppDndData } from './useTerminalAppDndData'

/**
 * Wraps the Terminal app's pane area in a dnd-kit context so tabs can be
 * dragged to reorder within a pane, moved between panes, or dropped on a pane
 * edge to create a split. Owns the shared drag overlay.
 */
export function TerminalAppDndContext({ children }: { children: React.ReactNode }) {
  const {
    sensors,
    collisionDetection,
    activeTab,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useTerminalAppDndData()

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTab ? <TerminalAppTabGhost tab={activeTab} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
