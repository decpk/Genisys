import type { AppView } from '../../settings-store'

/**
 * Shallow-equal check for two `enabledApps` lists. Order-sensitive, so
 * reordering counts as a change (used by the App Store to allow drag-to-
 * reorder later).
 */
export function areEnabledAppsEqual(
  a: ReadonlyArray<AppView>,
  b: ReadonlyArray<AppView>,
): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}
