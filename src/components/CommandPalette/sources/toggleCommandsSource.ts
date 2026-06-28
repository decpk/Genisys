import { RotateCw, Settings as SettingsIcon } from 'lucide-react'

import { runShortcut } from '@/frameworks/keyboard-shortcut'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

/**
 * Palette-only commands that don't have a dedicated keyboard shortcut and
 * therefore wouldn't be emitted by `shortcutsSource`. Includes a small set of
 * convenience entries (open settings, reload app).
 */
export const toggleCommandsSource: PaletteSource = {
  id: 'toggleCommands',
  kinds: ['command'],
  getItems(): PaletteItem[] {
    return [
      {
        id: 'command:open-settings',
        kind: 'command',
        title: 'Open Settings',
        subtitle: 'View',
        icon: SettingsIcon,
        keywords: ['settings', 'preferences', 'config', 'configuration', 'options', 'prefs'],
        group: 'commands',
        action: () => safeRun(() => useNavigationStore.getState().setActiveApp('settings')),
      },
      {
        id: 'command:reload-app',
        kind: 'command',
        title: 'Reload App',
        subtitle: 'View',
        icon: RotateCw,
        keywords: ['reload', 'refresh', 'restart', 'reset'],
        group: 'commands',
        action: () => safeRun(() => window.location.reload()),
      },
      {
        id: 'command:run-toggle-sidebar',
        kind: 'command',
        title: 'Toggle Sidebar',
        subtitle: 'View',
        keywords: ['toggle', 'sidebar', 'left', 'panel', 'hide', 'show', 'collapse'],
        group: 'commands',
        action: () => safeRun(() => runShortcut('global.toggleSidebar')),
      },
      {
        id: 'command:run-toggle-right-panel',
        kind: 'command',
        title: 'Toggle Right Panel',
        subtitle: 'View',
        keywords: ['toggle', 'right', 'panel', 'sidebar', 'hide', 'show', 'collapse'],
        group: 'commands',
        action: () => safeRun(() => runShortcut('global.toggleRightPanel')),
      },
    ]
  },
}
