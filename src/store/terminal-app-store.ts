import { create } from 'zustand'

import { closeAllTabsAction } from './terminal-app-store/actions/closeAllTabsAction'
import { closeGroupAction } from './terminal-app-store/actions/closeGroupAction'
import { closeTabAction } from './terminal-app-store/actions/closeTabAction'
import { createTabAction } from './terminal-app-store/actions/createTabAction'
import { handleSessionExitAction } from './terminal-app-store/actions/handleSessionExitAction'
import { moveTabToGroupAction } from './terminal-app-store/actions/moveTabToGroupAction'
import { moveTabToSplitAction } from './terminal-app-store/actions/moveTabToSplitAction'
import { reorderTabsAction } from './terminal-app-store/actions/reorderTabsAction'
import { renameTabAction } from './terminal-app-store/actions/renameTabAction'
import { replaceTreeAction } from './terminal-app-store/actions/replaceTreeAction'
import { setActiveGroupAction } from './terminal-app-store/actions/setActiveGroupAction'
import { setActiveTabAction } from './terminal-app-store/actions/setActiveTabAction'
import { setGroupSizesAction } from './terminal-app-store/actions/setGroupSizesAction'
import { setSessionCwdAction } from './terminal-app-store/actions/setSessionCwdAction'
import { setTabFontFamilyAction } from './terminal-app-store/actions/setTabFontFamilyAction'
import { setTabThemeAction } from './terminal-app-store/actions/setTabThemeAction'
import { splitGroupAction } from './terminal-app-store/actions/splitGroupAction'
import { togglePinTabAction } from './terminal-app-store/actions/togglePinTabAction'
import { createInitialTree } from './terminal-app-store/treeUtils'
import type { TerminalAppStore } from './terminal-app-store/types'

const initial = createInitialTree()

/**
 * Independent store for the standalone Terminal app. Owns a recursive
 * split-tree of leaves (panes), each holding terminal tabs. PTY I/O is reused
 * from the shared Terminal infrastructure (`terminalOutputBus`, `TerminalSurface`,
 * the Rust backend) — this store only manages tabs, splits, focus, and cwd.
 */
export const useTerminalAppStore = create<TerminalAppStore>((set, get) => ({
  tree: initial.tree,
  activeGroupId: initial.activeGroupId,

  createTab: (input) => createTabAction(set, get, input),
  closeTab: (tabId) => closeTabAction(set, get, tabId),
  setActiveTab: (tabId, groupId) => setActiveTabAction(set, get, tabId, groupId),
  setActiveGroup: (groupId) => setActiveGroupAction(set, get, groupId),
  togglePinTab: (tabId) => togglePinTabAction(set, get, tabId),
  renameTab: (tabId, title) => renameTabAction(set, get, tabId, title),
  setTabTheme: (tabId, themeId) => setTabThemeAction(set, get, tabId, themeId),
  setTabFontFamily: (tabId, fontFamily) => setTabFontFamilyAction(set, get, tabId, fontFamily),
  splitGroup: (groupId, direction) => splitGroupAction(set, get, groupId, direction),
  moveTabToGroup: (tabId, targetGroupId, insertIndex) =>
    moveTabToGroupAction(set, get, tabId, targetGroupId, insertIndex),
  moveTabToSplit: (tabId, targetGroupId, edge) =>
    moveTabToSplitAction(set, get, tabId, targetGroupId, edge),
  closeGroup: (groupId) => closeGroupAction(set, get, groupId),
  closeAllTabs: () => closeAllTabsAction(set, get),
  reorderTabs: (groupId, from, to) => reorderTabsAction(set, get, groupId, from, to),
  setGroupSizes: (splitId, sizes) => setGroupSizesAction(set, get, splitId, sizes),
  setSessionCwd: (tabId, cwd) => setSessionCwdAction(set, get, tabId, cwd),
  handleSessionExit: (tabId, code) => handleSessionExitAction(set, get, tabId, code),
  replaceTree: (tree, activeGroupId) => replaceTreeAction(set, get, tree, activeGroupId),
}))
