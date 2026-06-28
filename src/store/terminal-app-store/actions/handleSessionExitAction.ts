import type { TermGet, TermSet } from '../types'
import { findLeafByTabId, updateLeaf } from '../treeUtils'

/** Mark a session as exited (PTY closed) while keeping its tab visible. */
export function handleSessionExitAction(
  set: TermSet,
  _get: TermGet,
  tabId: string,
  code: number | null,
): void {
  set((s) => {
    const leaf = findLeafByTabId(s.tree, tabId)
    if (!leaf) return {}
    const tree = updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: l.tabs.map((t) =>
        t.id === tabId ? { ...t, exited: true, exitCode: code } : t,
      ),
    }))
    return { tree }
  })
}
