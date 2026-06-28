import { terminalKill } from '@/components/Terminal/api/terminalKill'
import { dropSession } from '@/components/TerminalApp/utils/terminalSessionCapture'
import { deleteTerminalSession } from '@/components/TerminalApp/utils/terminalSessionStore'

import type { TermGet, TermNode, TermSet } from '../types'
import { collectTabs, pruneEmptyLeaves, retainPinnedTabs } from '../treeUtils'

/**
 * Close every unpinned terminal across all panes (the Terminal app's
 * `Close All` / cmd+k+w). Pinned tabs are protected and survive; panes left
 * empty collapse into their siblings. When nothing is pinned the tree falls
 * back to a single empty host leaf, mirroring closing the last tab.
 */
export async function closeAllTabsAction(set: TermSet, get: TermGet): Promise<void> {
  const toClose = collectTabs(get().tree).filter((t) => !t.pinned)
  if (toClose.length === 0) return

  toClose.forEach((t) => dropSession(t.id))
  await Promise.all(toClose.map((t) => terminalKill(t.id).catch(() => undefined)))
  toClose.forEach((t) => void deleteTerminalSession(t.persistentId))

  set((s) => {
    const strip = (node: TermNode): TermNode =>
      node.kind === 'leaf'
        ? { ...node, ...retainPinnedTabs(node) }
        : { ...node, children: [strip(node.children[0]), strip(node.children[1])] }

    const { tree, activeGroupId } = pruneEmptyLeaves(strip(s.tree), s.activeGroupId)
    return { tree, activeGroupId }
  })
}
