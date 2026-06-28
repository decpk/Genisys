import type { TermGet, TermGroupId, TermSet } from '../types'
import { findLeaf, findLeafByTabId, updateLeaf } from '../treeUtils'

/**
 * Focus a tab. When `groupId` is omitted the owning leaf is located by tab id.
 * The owning leaf also becomes the active group.
 */
export function setActiveTabAction(
  set: TermSet,
  _get: TermGet,
  tabId: string,
  groupId?: TermGroupId,
): void {
  set((s) => {
    const leaf = groupId ? findLeaf(s.tree, groupId) : findLeafByTabId(s.tree, tabId)
    if (!leaf || !leaf.tabs.some((t) => t.id === tabId)) return {}
    const tree = updateLeaf(s.tree, leaf.id, (l) => ({ ...l, activeTabId: tabId }))
    return { tree, activeGroupId: leaf.id }
  })
}
