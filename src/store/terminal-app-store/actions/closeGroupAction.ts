import { terminalKill } from '@/components/Terminal/api/terminalKill'
import { dropSession } from '@/components/TerminalApp/utils/terminalSessionCapture'
import { deleteTerminalSession } from '@/components/TerminalApp/utils/terminalSessionStore'

import type { TermGet, TermGroupId, TermSet } from '../types'
import { findLeaf, pruneEmptyLeaves, retainPinnedTabs, updateLeaf } from '../treeUtils'

/**
 * Kill the unpinned sessions in a leaf and collapse the pane. Pinned tabs are
 * protected: they survive and keep the pane alive. When no pinned tabs remain
 * the pane collapses (the tree always keeps one leaf as a host).
 */
export async function closeGroupAction(
  set: TermSet,
  get: TermGet,
  groupId: TermGroupId,
): Promise<void> {
  const leaf = findLeaf(get().tree, groupId)
  if (!leaf) return

  const toClose = leaf.tabs.filter((t) => !t.pinned)
  if (toClose.length === 0) return

  toClose.forEach((t) => dropSession(t.id))
  await Promise.all(toClose.map((t) => terminalKill(t.id).catch(() => undefined)))
  toClose.forEach((t) => void deleteTerminalSession(t.persistentId))

  set((s) => {
    const updated = updateLeaf(s.tree, groupId, (l) => ({ ...l, ...retainPinnedTabs(l) }))
    const { tree, activeGroupId } = pruneEmptyLeaves(updated, s.activeGroupId)
    return { tree, activeGroupId }
  })
}
