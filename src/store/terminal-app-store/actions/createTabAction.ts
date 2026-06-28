import { terminalCreate } from '@/components/Terminal/api/terminalCreate'
import { formatSessionTitle } from '@/components/Terminal/utils/formatSessionTitle'

import type { CreateTabInput, TermGet, TermSet, TermTab } from '../types'
import {
  collectLeaves,
  collectTabs,
  createPersistentId,
  findLeaf,
  updateLeaf,
} from '../treeUtils'

/**
 * Spawn a PTY session and append it as a tab to the target leaf (or the active
 * leaf). The new tab inherits the working directory of the target leaf's active
 * tab (so `+` / Cmd+T continue in the same path), unless an explicit `cwd` is
 * given. The target leaf becomes active and the new tab is focused.
 */
export async function createTabAction(
  set: TermSet,
  get: TermGet,
  input?: CreateTabInput,
): Promise<string | null> {
  const targetGroupId = input?.groupId ?? get().activeGroupId
  // Default the new tab's cwd to the target pane's active tab, so it opens where
  // the user currently is. An explicit `input.cwd` still takes priority.
  const targetLeaf = findLeaf(get().tree, targetGroupId) ?? collectLeaves(get().tree)[0]
  const activeTab = targetLeaf?.tabs.find((t) => t.id === targetLeaf.activeTabId)
  const cwd = input?.cwd ?? activeTab?.cwd ?? undefined

  try {
    const created = await terminalCreate({
      cwd,
      shell: input?.shell,
      args: input?.args,
      cols: input?.cols ?? 80,
      rows: input?.rows ?? 24,
    })

    set((s) => {
      const leaf = findLeaf(s.tree, targetGroupId) ?? collectLeaves(s.tree)[0]
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
      const tree = updateLeaf(s.tree, leaf.id, (l) => ({
        ...l,
        tabs: [...l.tabs, tab],
        activeTabId: tab.id,
      }))
      return { tree, activeGroupId: leaf.id }
    })

    return created.id
  } catch (err) {
    console.error('[terminal-app-store] createTab failed', err)
    return null
  }
}
