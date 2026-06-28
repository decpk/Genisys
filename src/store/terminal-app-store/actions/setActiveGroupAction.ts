import type { TermGet, TermGroupId, TermSet } from '../types'
import { findLeaf } from '../treeUtils'

/** Move focus to another leaf (no-op if it doesn't exist or is already active). */
export function setActiveGroupAction(
  set: TermSet,
  get: TermGet,
  groupId: TermGroupId,
): void {
  if (get().activeGroupId === groupId) return
  if (!findLeaf(get().tree, groupId)) return
  set({ activeGroupId: groupId })
}
