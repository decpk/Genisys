import type { TermGet, TermGroupId, TermSet } from '../types'
import { updateSplitSizes } from '../treeUtils'

/** Persist the drag-resized ratios of a split node. */
export function setGroupSizesAction(
  set: TermSet,
  _get: TermGet,
  splitId: TermGroupId,
  sizes: [number, number],
): void {
  set((s) => {
    const tree = updateSplitSizes(s.tree, splitId, sizes)
    return tree === s.tree ? {} : { tree }
  })
}
