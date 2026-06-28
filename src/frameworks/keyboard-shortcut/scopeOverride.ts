import { useSettingsStore } from '@/store/settings-store'

import type { ShortcutScope } from './KeyboardShortcut.types'

/**
 * Per-window scope override for the keyboard shortcut framework.
 *
 * Standalone (popped-out) windows render a single app whose scope must drive
 * shortcut dispatching, but they intentionally do NOT write to
 * `settings-store.lastActiveApp` (which is persisted/shared across windows and
 * would clobber the main window's state). Each standalone window installs its
 * own override on mount via `setShortcutScopeOverride(initialApp)`.
 *
 * The main window leaves the override `null` and continues to fall back to
 * `useSettingsStore.lastActiveApp`.
 */

let scopeOverride: ShortcutScope | null = null

export function setShortcutScopeOverride(scope: ShortcutScope | null): void {
  scopeOverride = scope
}

export function getEffectiveActiveApp(): ShortcutScope {
  if (scopeOverride !== null) return scopeOverride
  return useSettingsStore.getState().lastActiveApp as ShortcutScope
}
