import { notify } from '@/frameworks/notification'

import type { TermGet, TermSet } from '../types'
import { findLeafByTabId, updateLeaf } from '../treeUtils'

/**
 * Toggle a tab's `pinned` flag. Pinning protects the tab from being closed:
 * bulk closes (Close All + Close Pane) skip it, and an explicit close is
 * refused until it is unpinned. When a tab becomes pinned we surface a
 * notification with an inline Unpin action so the change is discoverable and
 * reversible in one click.
 */
export function togglePinTabAction(set: TermSet, get: TermGet, tabId: string): void {
  const leaf = findLeafByTabId(get().tree, tabId)
  const tab = leaf?.tabs.find((t) => t.id === tabId)
  if (!leaf || !tab) return

  const nextPinned = !tab.pinned

  set((s) => ({
    tree: updateLeaf(s.tree, leaf.id, (l) => ({
      ...l,
      tabs: l.tabs.map((t) => (t.id === tabId ? { ...t, pinned: nextPinned } : t)),
    })),
  }))

  if (nextPinned) {
    notify({
      source: 'terminal',
      type: 'success',
      title: 'Terminal tab pinned',
      message: `"${tab.title}" won't be closed until you unpin it.`,
      actions: [{ label: 'Unpin', onClick: () => get().togglePinTab(tabId) }],
    })
  }
}
