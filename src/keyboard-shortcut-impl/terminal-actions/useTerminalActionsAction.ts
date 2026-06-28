import { focusSurface } from '@/components/TerminalApp/components/TerminalAppSurface/terminalAppSurfacePool'
import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import { useTerminalPromptStore } from '@/store/terminal-prompt-store'
import { collectLeaves, findLeaf } from '@/store/terminal-app-store/treeUtils'

function cycleTab(direction: 1 | -1): void {
  const s = useTerminalAppStore.getState()
  const leaf = findLeaf(s.tree, s.activeGroupId)
  if (!leaf || leaf.tabs.length === 0) return
  const idx = leaf.tabs.findIndex((t) => t.id === leaf.activeTabId)
  const base = idx === -1 ? 0 : idx
  const next = leaf.tabs[(base + direction + leaf.tabs.length) % leaf.tabs.length]
  s.setActiveTab(next.id, leaf.id)
  focusSurface(next.id)
}

function focusPane(direction: 1 | -1): void {
  const s = useTerminalAppStore.getState()
  const leaves = collectLeaves(s.tree)
  if (leaves.length < 2) return
  const idx = leaves.findIndex((l) => l.id === s.activeGroupId)
  const base = idx === -1 ? 0 : idx
  const next = leaves[(base + direction + leaves.length) % leaves.length]
  s.setActiveGroup(next.id)
  if (next.activeTabId) focusSurface(next.activeTabId)
}

/**
 * Binds the `terminal.*` shortcut handlers. All operate on the active pane
 * (`activeGroupId`) of the Terminal app's split-tree. Bound once at app root;
 * only dispatched while the Terminal app is the active scope.
 */
export function useTerminalActionsAction(): void {
  useBindShortcutActions({
    'terminal.newTab': () => {
      const s = useTerminalAppStore.getState()
      void s.createTab({ groupId: s.activeGroupId })
    },
    'terminal.closeTab': () => {
      const s = useTerminalAppStore.getState()
      const leaf = findLeaf(s.tree, s.activeGroupId)
      if (leaf?.activeTabId) void s.closeTab(leaf.activeTabId)
    },
    'terminal.closeAllTabs': () => {
      void useTerminalAppStore.getState().closeAllTabs()
    },
    'terminal.pinTab': () => {
      const s = useTerminalAppStore.getState()
      const leaf = findLeaf(s.tree, s.activeGroupId)
      if (leaf?.activeTabId) s.togglePinTab(leaf.activeTabId)
    },
    'terminal.nextTab': () => cycleTab(1),
    'terminal.prevTab': () => cycleTab(-1),
    'terminal.splitRight': () => {
      const s = useTerminalAppStore.getState()
      void s.splitGroup(s.activeGroupId, 'horizontal')
    },
    'terminal.splitDown': () => {
      const s = useTerminalAppStore.getState()
      void s.splitGroup(s.activeGroupId, 'vertical')
    },
    'terminal.focusNextPane': () => focusPane(1),
    'terminal.focusPrevPane': () => focusPane(-1),
    'terminal.closePane': () => {
      const s = useTerminalAppStore.getState()
      void s.closeGroup(s.activeGroupId)
    },
    'terminal.insertPrompt': () => {
      const s = useTerminalAppStore.getState()
      const leaf = findLeaf(s.tree, s.activeGroupId)
      if (leaf?.activeTabId) useTerminalPromptStore.getState().open(leaf.id)
    },
  })
}
