import {
  getShortcutOwnerApp,
  keyComboToDisplayString,
  resolveShortcuts,
  runShortcut,
} from '@/frameworks/keyboard-shortcut'
import { useSettingsStore } from '@/store/settings-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

function formatKeybinding(keys: string): string {
  if (!keys) return ''
  try {
    return keyComboToDisplayString(keys).join(' ')
  } catch {
    return keys
  }
}

export const shortcutsSource: PaletteSource = {
  id: 'shortcuts',
  kinds: ['command'],
  getItems(): PaletteItem[] {
    try {
      const resolved = resolveShortcuts()
      const { isAppEnabled } = useSettingsStore.getState()
      return resolved
        .filter((s) => {
          if (s.isDisabled || !s.keys || s.keys.trim() === '') return false
          // Drop shortcuts owned by a disabled app — they must not run.
          const owner = getShortcutOwnerApp(s)
          return !owner || isAppEnabled(owner)
        })
        .map((shortcut): PaletteItem => ({
          id: `command:shortcut:${shortcut.id}`,
          kind: 'command',
          title: shortcut.label,
          subtitle: shortcut.description || shortcut.category,
          keybinding: formatKeybinding(shortcut.keys),
          keywords: [
            'shortcut',
            'keybinding',
            'hotkey',
            shortcut.category ?? '',
            shortcut.scope,
            shortcut.keys,
            shortcut.id,
          ].filter(Boolean) as string[],
          group: 'commands',
          action: () => safeRun(() => runShortcut(shortcut.id)),
        }))
    } catch {
      return []
    }
  },
}
