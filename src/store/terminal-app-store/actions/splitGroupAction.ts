import { terminalCreate } from '@/components/Terminal/api/terminalCreate'
import { formatSessionTitle } from '@/components/Terminal/utils/formatSessionTitle'

import type { TermGet, TermGroupId, TermSet, TermSplitDirection, TermTab } from '../types'
import {
  collectLeaves,
  collectTabs,
  createLeaf,
  createPersistentId,
  findLeaf,
  splitLeafInTree,
} from '../treeUtils'

/**
 * Split a leaf along `direction`, spawning a fresh terminal in the new pane.
 * The new pane inherits the working directory of the source leaf's active tab.
 * The new pane becomes active.
 */
export async function splitGroupAction(
  set: TermSet,
  get: TermGet,
  groupId: TermGroupId,
  direction: TermSplitDirection,
): Promise<string | null> {
  const target = findLeaf(get().tree, groupId) ?? collectLeaves(get().tree)[0]
  const activeTab = target.tabs.find((t) => t.id === target.activeTabId)
  const cwd = activeTab?.cwd ?? undefined

  try {
    const created = await terminalCreate({ cwd, cols: 80, rows: 24 })
    let newGroupId: TermGroupId | null = null

    set((s) => {
      const liveTarget = findLeaf(s.tree, groupId) ?? collectLeaves(s.tree)[0]
      const index = collectTabs(s.tree).length
      const tab: TermTab = {
        id: created.id,
        persistentId: createPersistentId(),
        title: formatSessionTitle(index, created.shell, created.cwd),
        shell: created.shell,
        cwd: created.cwd,
        createdAt: Date.now(),
        exited: false,
        exitCode: null,
      }
      const newLeaf = createLeaf({ tabs: [tab], activeTabId: tab.id })
      newGroupId = newLeaf.id
      const { tree } = splitLeafInTree(s.tree, {
        targetGroupId: liveTarget.id,
        direction,
        newLeaf,
        side: 'after',
      })
      return { tree, activeGroupId: newLeaf.id }
    })

    return newGroupId
  } catch (err) {
    console.error('[terminal-app-store] splitGroup failed', err)
    return null
  }
}
