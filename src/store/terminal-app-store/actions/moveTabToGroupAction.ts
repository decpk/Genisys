import type { TermGet, TermGroupId, TermSet } from '../types'
import {
  findLeaf,
  findLeafByTabId,
  pruneEmptyLeaves,
  removeTabFromTree,
  updateLeaf,
} from '../treeUtils'

/**
 * Move an existing tab into another pane's tab strip (drag a tab onto the
 * centre of another pane, or onto a tab in another pane). The PTY session is
 * preserved — only the tab's place in the split-tree changes. The moved tab
 * becomes active in the target pane and the target pane becomes the active
 * group. A now-empty source pane collapses into its sibling.
 *
 * No-op when the tab is dropped on its own pane (intra-pane ordering is handled
 * by `reorderTabs`) or when the target/tab cannot be found.
 */
export function moveTabToGroupAction(
  set: TermSet,
  _get: TermGet,
  tabId: string,
  targetGroupId: TermGroupId,
  insertIndex?: number,
): void {
  set((s) => {
    const sourceLeaf = findLeafByTabId(s.tree, tabId)
    if (!sourceLeaf) return {}
    if (sourceLeaf.id === targetGroupId) return {}
    const target = findLeaf(s.tree, targetGroupId)
    if (!target) return {}

    const removed = removeTabFromTree(s.tree, tabId)
    if (!removed) return {}

    const insertAt =
      insertIndex === undefined
        ? target.tabs.length
        : Math.max(0, Math.min(insertIndex, target.tabs.length))

    const inserted = updateLeaf(removed.tree, targetGroupId, (l) => {
      const tabs = [...l.tabs]
      tabs.splice(insertAt, 0, removed.tab)
      return { ...l, tabs, activeTabId: removed.tab.id }
    })

    const { tree } = pruneEmptyLeaves(inserted, targetGroupId)
    return { tree, activeGroupId: targetGroupId }
  })
}
