import { formatSessionTitle } from '@/components/Terminal/utils/formatSessionTitle'

import type { TermGet, TermSet } from '../types'
import { findLeafByTabId, updateLeaf } from '../treeUtils'

/**
 * Update a session's live working directory (driven by OSC 7 / backend probe)
 * and refresh its folder-derived title. No-op when the cwd is unchanged.
 */
export function setSessionCwdAction(
  set: TermSet,
  _get: TermGet,
  tabId: string,
  cwd: string,
): void {
  set((s) => {
    const leaf = findLeafByTabId(s.tree, tabId)
    if (!leaf) return {}
    const tab = leaf.tabs.find((t) => t.id === tabId)
    if (!tab || tab.cwd === cwd) return {}
    const tree = updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: l.tabs.map((t) =>
        t.id === tabId
          ? { ...t, cwd, title: t.customTitle ? t.title : formatSessionTitle(0, t.shell, cwd) }
          : t,
      ),
    }))
    return { tree }
  })
}
