import type { StoreApi } from 'zustand'

import { useSettingsStore } from './settings-store'
import { useThemeStore } from './theme-store'
import { useDebugStore } from './debug-store'
import { useNavigationStore } from './navigation-store'
import { useDashboardStore } from './dashboard-store'
import { useExplorerHistoryStore } from './explorer-history-store'
import { useChatHistoryStore } from './chat-history-store'
import { useLibraryStore } from './library-store'
import { useBookmarkStore } from './bookmark-store'
import { useSnippetsStore } from './snippets-store'
import { usePromptManagerStore } from './prompt-manager-store'
import { useKeyboardStore } from '@/frameworks/keyboard-shortcut'
import { useAIInspectorStore } from './ai-inspector-store'
import { useDailyPlanStore } from './daily-plan-store'
import { useClipboardStore } from './clipboard-store'
import { useTimerStore } from './timer-store'
import { useRemoteTerminalStore } from './remote-terminal-store'
import { useMonitorStore } from './monitor-store'
import { useQuickShareStore } from './quickshare-store'
import { useContentShareStore } from './content-share-store'
import { useTerminalRenameStore } from './terminal-rename-store'
import { useTerminalPromptStore } from './terminal-prompt-store'
import { useTerminalGitDiffStore } from './terminal-git-diff-store'
import { useTerminalGitPanelStore } from './terminal-git-panel-store'
import { useAppDragStore } from './app-drag-store'

export interface StoreRegistryEntry {
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api: StoreApi<any>
}

// Zustand's `create()` returns a hook that doubles as a StoreApi
// (it has .getState, .setState, .subscribe, .getInitialState)
export const STORE_REGISTRY: readonly StoreRegistryEntry[] = [
  { name: 'settings', description: 'App settings & preferences', api: useSettingsStore },
  { name: 'theme', description: 'Active theme state', api: useThemeStore },
  { name: 'debug', description: 'API request interceptor', api: useDebugStore },
  { name: 'navigation', description: 'Cross-app navigation', api: useNavigationStore },
  { name: 'dashboard', description: 'Dashboard projects', api: useDashboardStore },
  { name: 'explorerHistory', description: 'Explorer repo history', api: useExplorerHistoryStore },
  { name: 'chatHistory', description: 'Chat conversations', api: useChatHistoryStore },
  { name: 'library', description: 'Books & chapters', api: useLibraryStore },
  { name: 'bookmark', description: 'Library bookmarks', api: useBookmarkStore },
  { name: 'snippets', description: 'Code snippets', api: useSnippetsStore },
  { name: 'promptManager', description: 'Prompt folders & prompts', api: usePromptManagerStore },
  { name: 'keyboard', description: 'Keyboard shortcut overrides', api: useKeyboardStore },
  { name: 'aiInspector', description: 'AI network request inspector', api: useAIInspectorStore },
  { name: 'dailyPlan', description: 'Daily plan tasks & meetings', api: useDailyPlanStore },
  { name: 'clipboard', description: 'Clipboard manager history', api: useClipboardStore },
  { name: 'timer', description: 'Timer instances, sessions & goals', api: useTimerStore },
  { name: 'remoteTerminal', description: 'Remote terminal LAN sharing', api: useRemoteTerminalStore },
  { name: 'monitor', description: 'Monitor camera + mic LAN streaming', api: useMonitorStore },
  { name: 'quickShare', description: 'QuickShare LAN file/text drop hub', api: useQuickShareStore },
  { name: 'contentShare', description: 'Share books + notes between Genisys devices on the LAN', api: useContentShareStore },
  { name: 'terminalRename', description: 'Terminal tab rename modal', api: useTerminalRenameStore },
  { name: 'terminalGitDiff', description: 'Terminal git diff overlay target', api: useTerminalGitDiffStore },
  { name: 'terminalPrompt', description: 'Terminal insert-prompt picker', api: useTerminalPromptStore },
  { name: 'terminalGitPanel', description: 'Terminal git panel per-pane visibility', api: useTerminalGitPanelStore },
  { name: 'appDrag', description: 'ActivityBar drag-to-main drop overlay state', api: useAppDragStore },
] as const

export function getStoreData(api: StoreApi<Record<string, unknown>>): {
  state: Record<string, unknown>
  actions: Record<string, (...args: unknown[]) => unknown>
} {
  const snapshot = api.getState()
  const state: Record<string, unknown> = {}
  const actions: Record<string, (...args: unknown[]) => unknown> = {}

  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value === 'function') {
      actions[key] = value as (...args: unknown[]) => unknown
    } else {
      state[key] = value
    }
  }

  return { state, actions }
}
