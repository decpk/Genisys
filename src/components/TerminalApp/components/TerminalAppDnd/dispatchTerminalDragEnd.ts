import type { DragEndEvent } from '@dnd-kit/core'

import { useTerminalAppStore } from '@/store/terminal-app-store'
import { findLeaf } from '@/store/terminal-app-store/treeUtils'

import { parseTerminalDropZoneId, parseTerminalTabSortableId } from './terminalAppDragIds'

/**
 * Central drag-end router for the Terminal app. dnd-kit fires `onDragEnd`
 * outside React render, so this reads store state via `getState()`. The active
 * draggable is always a tab (`ttab:…`); the drop target is either:
 *
 *  - a pane drop zone (`tdz:<gid>:<edge>`):
 *      · `center` → move the tab into that pane's tab strip
 *      · an edge  → split a new pane off that edge holding the tab
 *  - another tab (`ttab:<gid>:<tabId>`):
 *      · same pane  → reorder
 *      · other pane → move next to the dropped-on tab
 */
export function dispatchTerminalDragEnd(event: DragEndEvent): void {
  const { active, over } = event
  if (!over) return
  const activeId = String(active.id)
  const overId = String(over.id)
  if (activeId === overId) return

  const activeTab = parseTerminalTabSortableId(activeId)
  if (!activeTab) return

  const store = useTerminalAppStore.getState()

  const overZone = parseTerminalDropZoneId(overId)
  if (overZone) {
    if (overZone.edge === 'center') {
      store.moveTabToGroup(activeTab.tabId, overZone.groupId)
    } else {
      store.moveTabToSplit(activeTab.tabId, overZone.groupId, overZone.edge)
    }
    return
  }

  const overTab = parseTerminalTabSortableId(overId)
  if (!overTab) return

  const targetLeaf = findLeaf(store.tree, overTab.groupId)
  if (!targetLeaf) return
  const overIndex = targetLeaf.tabs.findIndex((t) => t.id === overTab.tabId)
  if (overIndex === -1) return

  if (activeTab.groupId === overTab.groupId) {
    const fromIndex = targetLeaf.tabs.findIndex((t) => t.id === activeTab.tabId)
    if (fromIndex === -1 || fromIndex === overIndex) return
    store.reorderTabs(overTab.groupId, fromIndex, overIndex)
    return
  }

  store.moveTabToGroup(activeTab.tabId, overTab.groupId, overIndex)
}
