import { findLeafByTabId, updateLeaf } from '../treeUtils'
import type { TermGet, TermSet } from '../types'

/**
 * Set (or clear, with `null`) a tab's per-tab terminal color scheme. The scheme
 * is applied to the live xterm surface reactively by the surface pool, which
 * watches the store; this action only records the choice on the tab. A no-op
 * when the value is unchanged so it can't churn the persistence effect.
 */
export function setTabThemeAction(
  set: TermSet,
  get: TermGet,
  tabId: string,
  themeId: string | null,
): void {
  const leaf = findLeafByTabId(get().tree, tabId)
  const tab = leaf?.tabs.find((t) => t.id === tabId)
  if (!leaf || !tab) return

  const next = themeId ?? undefined
  if (tab.themeId === next) return

  set((s) => ({
    tree: updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: l.tabs.map((t) => (t.id === tabId ? { ...t, themeId: next } : t)),
    })),
  }))
}
