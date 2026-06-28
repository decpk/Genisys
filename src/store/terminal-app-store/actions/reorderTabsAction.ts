import type { TermGet, TermGroupId, TermSet } from '../types'
import { findLeaf, updateLeaf } from '../treeUtils'

/** Reorder tabs within a leaf (drag-and-drop). Out-of-range indices are clamped. */
export function reorderTabsAction(
  set: TermSet,
  _get: TermGet,
  groupId: TermGroupId,
  fromIndex: number,
  toIndex: number,
): void {
  set((s) => {
    const leaf = findLeaf(s.tree, groupId)
    if (!leaf) return {}
    if (fromIndex === toIndex) return {}
    if (fromIndex < 0 || fromIndex >= leaf.tabs.length) return {}
    const tabs = [...leaf.tabs]
    const [moved] = tabs.splice(fromIndex, 1)
    const dest = Math.max(0, Math.min(toIndex, tabs.length))
    tabs.splice(dest, 0, moved)
    const tree = updateLeaf(s.tree, groupId, (l) => ({ ...l, tabs }))
    return { tree }
  })
}
