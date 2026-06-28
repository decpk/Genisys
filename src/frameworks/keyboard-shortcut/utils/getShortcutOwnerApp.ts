import type { AppView } from '@/store/settings-store'
import { INSTALLABLE_APP_VIEWS } from '@/store/settings-store/AppView.constants'

import type { ShortcutDef } from '../KeyboardShortcut.types'

const SWITCH_APP_PREFIX = 'global.switchApp.'

/**
 * Derive the installable app a shortcut belongs to, or `null` for genuinely
 * global / meta shortcuts that must never be gated by app-enablement.
 *
 * - App-scoped shortcuts (e.g. `clipboard.focusSearch`): the `scope` IS the
 *   owning app.
 * - `global.switchApp.<id>` navigation shortcuts: the trailing app id.
 *
 * Only ids that are real installable apps are returned; meta/dev surfaces
 * (settings, inspectors) and unknown/legacy ids resolve to `null` so their
 * shortcuts keep working.
 */
export function getShortcutOwnerApp(
  shortcut: Pick<ShortcutDef, 'id' | 'scope'>,
): AppView | null {
  if (shortcut.scope !== 'global') {
    return INSTALLABLE_APP_VIEWS.has(shortcut.scope) ? shortcut.scope : null
  }
  if (shortcut.id.startsWith(SWITCH_APP_PREFIX)) {
    const candidate = shortcut.id.slice(SWITCH_APP_PREFIX.length) as AppView
    return INSTALLABLE_APP_VIEWS.has(candidate) ? candidate : null
  }
  return null
}
