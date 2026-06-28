import type { TermGet, TermSet } from '../types'
import { findLeafByTabId, updateLeaf } from '../treeUtils'

/**
 * Rename a tab to a user-supplied title and mark it `customTitle`, freezing it
 * from cwd-derived auto-titling (on `cd`, split, or session restore). Empty /
 * whitespace-only titles are ignored so a tab can never lose its label.
 */
export function renameTabAction(set: TermSet, get: TermGet, tabId: string, title: string): void {
  const trimmed = title.trim()
  if (!trimmed) return

  const leaf = findLeafByTabId(get().tree, tabId)
  const tab = leaf?.tabs.find((t) => t.id === tabId)
  if (!leaf || !tab) return
  // No-op only when the label is unchanged *and* already frozen; confirming the
  // current auto-title still freezes it (sets `customTitle`).
  if (tab.title === trimmed && tab.customTitle) return

  set((s) => ({
    tree: updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: l.tabs.map((t) =>
        t.id === tabId ? { ...t, title: trimmed, customTitle: true } : t,
      ),
    })),
  }))
}
