import { useSettingsStore } from '@/store/settings-store'

import type { ResolvedShortcut, ShortcutScope } from '../KeyboardShortcut.types'
import { getShortcutOwnerApp } from './getShortcutOwnerApp'

/**
 * Filter+order resolved shortcuts for dispatch: app-scoped first
 * (takes priority over global on duplicate keys), then global.
 * Disabled shortcuts are dropped, as are shortcuts belonging to a
 * disabled app — a disabled app must not respond to any keyboard
 * shortcut, neither its app-scoped actions nor `switchApp` navigation.
 */
export function selectActiveShortcuts(
  resolved: ResolvedShortcut[],
  activeApp: ShortcutScope
): ResolvedShortcut[] {
  const appShortcuts: ResolvedShortcut[] = []
  const globalShortcuts: ResolvedShortcut[] = []
  const enabledApps = useSettingsStore.getState().enabledApps

  for (const shortcut of resolved) {
    if (shortcut.isDisabled) continue
    const owner = getShortcutOwnerApp(shortcut)
    if (owner && !enabledApps.includes(owner)) continue
    if (shortcut.scope === activeApp) {
      appShortcuts.push(shortcut)
    } else if (shortcut.scope === 'global') {
      globalShortcuts.push(shortcut)
    }
  }

  return [...appShortcuts, ...globalShortcuts]
}
