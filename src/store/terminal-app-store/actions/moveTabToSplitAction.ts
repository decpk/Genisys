import type {
  TermDropEdge,
  TermGet,
  TermGroupId,
  TermSet,
  TermSplitDirection,
} from '../types'
import {
  createLeaf,
  findLeaf,
  findLeafByTabId,
  pruneEmptyLeaves,
  removeTabFromTree,
  splitLeafInTree,
} from '../treeUtils'

const EDGE_TO_SPLIT: Record<
  Exclude<TermDropEdge, 'center'>,
  { direction: TermSplitDirection; side: 'before' | 'after' }
> = {
  left: { direction: 'horizontal', side: 'before' },
  right: { direction: 'horizontal', side: 'after' },
  top: { direction: 'vertical', side: 'before' },
  bottom: { direction: 'vertical', side: 'after' },
}

/**
 * Move an existing tab into a brand-new pane split off one edge of a target
 * pane (drag a tab onto a pane's top/right/bottom/left edge). The PTY session
 * is preserved — the tab is relocated into a fresh leaf placed beside the
 * target. The new pane becomes active. A now-empty source pane collapses.
 *
 * No-op for the `center` edge (use `moveTabToGroup`), when splitting a
 * single-tab pane against itself, or when the tab/target cannot be found.
 */
export function moveTabToSplitAction(
  set: TermSet,
  _get: TermGet,
  tabId: string,
  targetGroupId: TermGroupId,
  edge: TermDropEdge,
): void {
  if (edge === 'center') return
  const { direction, side } = EDGE_TO_SPLIT[edge]

  set((s) => {
    const sourceLeaf = findLeafByTabId(s.tree, tabId)
    if (!sourceLeaf) return {}
    // Splitting a pane's only tab against that same pane is a no-op.
    if (sourceLeaf.id === targetGroupId && sourceLeaf.tabs.length <= 1) return {}
    if (!findLeaf(s.tree, targetGroupId)) return {}

    const removed = removeTabFromTree(s.tree, tabId)
    if (!removed) return {}

    const newLeaf = createLeaf({ tabs: [removed.tab], activeTabId: removed.tab.id })
    const { tree: splitTree, splitId } = splitLeafInTree(removed.tree, {
      targetGroupId,
      direction,
      newLeaf,
      side,
    })
    if (!splitId) return {}

    const { tree } = pruneEmptyLeaves(splitTree, newLeaf.id)
    return { tree, activeGroupId: newLeaf.id }
  })
}
