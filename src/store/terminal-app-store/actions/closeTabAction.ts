import { terminalKill } from '@/components/Terminal/api/terminalKill'
import { dropSession } from '@/components/TerminalApp/utils/terminalSessionCapture'
import { deleteTerminalSession } from '@/components/TerminalApp/utils/terminalSessionStore'
import { notify } from '@/frameworks/notification'

import type { TermGet, TermSet } from '../types'
import { findLeafByTabId, pruneEmptyLeaves, updateLeaf } from '../treeUtils'

/**
 * Kill the backend session (best-effort) and remove its tab. When the tab was
 * active, focus falls back to the neighbouring tab. When the leaf empties out
 * and is not the only leaf, the pane collapses into its sibling.
 *
 * Pinned tabs are protected: an explicit close is refused and an error toast
 * (with an inline Unpin action) is surfaced instead. The tab must be unpinned
 * before it can be closed.
 */
export async function closeTabAction(
  set: TermSet,
  get: TermGet,
  tabId: string,
): Promise<void> {
  const containingLeaf = findLeafByTabId(get().tree, tabId)
  const tab = containingLeaf?.tabs.find((t) => t.id === tabId)
  if (tab?.pinned) {
    notify({
      source: "terminal",
      type: "error",
      title: "Tab is pinned",
      message: `"${tab.title}" is pinned. Unpin it to close.`,
      actions: [{ label: "Unpin", onClick: () => get().togglePinTab(tabId) }],
      // Coalesce repeats: hammering close on a pinned tab refreshes this one
      // toast instead of stacking a new identical copy each time.
      dedupeKey: `tab-pinned-${tabId}`,
    });
    return
  }

  // The tab is being closed for good — stop capturing it (cancel any pending
  // save) and drop its saved scrollback from disk.
  if (tab) {
    dropSession(tab.id)
    void deleteTerminalSession(tab.persistentId)
  }

  try {
    await terminalKill(tabId)
  } catch {
    /* session may already be gone — proceed to remove the tab */
  }

  set((s) => {
    const leaf = findLeafByTabId(s.tree, tabId)
    if (!leaf) return {}

    const idx = leaf.tabs.findIndex((t) => t.id === tabId)
    const remaining = leaf.tabs.filter((t) => t.id !== tabId)
    let nextActive = leaf.activeTabId
    if (nextActive === tabId) {
      const fallback = remaining[idx] ?? remaining[idx - 1] ?? null
      nextActive = fallback ? fallback.id : null
    }

    const updated = updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: remaining,
      activeTabId: nextActive,
    }))
    const { tree, activeGroupId } = pruneEmptyLeaves(updated, s.activeGroupId)
    return { tree, activeGroupId }
  })
}
