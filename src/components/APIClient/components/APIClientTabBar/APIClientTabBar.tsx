import { useCallback } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { METHOD_DOT_COLORS, METHOD_SHORT } from '../../APIClient.constants'
import { APIClientTab } from './APIClientTab'
import { APIClientTabGhost } from './APIClientTabGhost'
import { useAPIClientTabBarData } from './useAPIClientTabBarData'

export function APIClientTabBar() {
  const {
    openRequestTabs,
    tabRequests,
    activeRequestTabId,
    pendingSaveRequestIds,
    sendingByRequestId,
    sensors,
    draggingTabId,
    draggingRequest,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleActivate,
    handleJump,
    handleClose,
    handleCloseOthers,
    handleCloseAll,
    handleNewTab,
  } = useAPIClientTabBarData()

  const onNewTab = useCallback(() => {
    void handleNewTab()
  }, [handleNewTab])

  if (openRequestTabs.length === 0) return null

  const overflowItems: DropdownItem[] = tabRequests.map((req) => ({
    key: req.id,
    label: `${METHOD_SHORT[req.method]}  ${req.name}`,
    prefix: (
      <span
        className={cn('inline-block size-2 rounded-full', METHOD_DOT_COLORS[req.method])}
      />
    ),
    onSelect: () => handleJump(req.id),
  }))

  return (
    <div className="flex items-center border-b border-border/40 bg-muted/30">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={openRequestTabs} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-1 items-center overflow-x-auto scrollbar-none">
            {tabRequests.map((req) => (
              <APIClientTab
                key={req.id}
                request={req}
                isActive={req.id === activeRequestTabId}
                isDirty={pendingSaveRequestIds.includes(req.id)}
                isSending={Boolean(sendingByRequestId[req.id])}
                isDragging={req.id === draggingTabId}
                onActivate={handleActivate}
                onClose={handleClose}
                onCloseOthers={handleCloseOthers}
                onCloseAll={handleCloseAll}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {draggingRequest && <APIClientTabGhost request={draggingRequest} />}
        </DragOverlay>
      </DndContext>

      <div className="flex shrink-0 items-center gap-0.5 border-l border-border/40 px-1.5">
        <Dropdown
          items={overflowItems}
          openOn="click"
          align="right"
          menuWidth="240px"
          trigger={
            <IconButton variant="ghost" size="sm" tooltip="Open tabs">
              <ChevronDown className="h-3.5 w-3.5" />
            </IconButton>
          }
        />
        <IconButton variant="ghost" size="sm" tooltip="New request" onClick={onNewTab}>
          <Plus className="h-3.5 w-3.5" />
        </IconButton>
      </div>
    </div>
  )
}
