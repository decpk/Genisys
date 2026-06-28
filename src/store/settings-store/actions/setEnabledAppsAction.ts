import { patchAppData } from '../../app-data'
import type { AppData } from '../../app-data'
import type { AppView } from '../../settings-store'
import { areEnabledAppsEqual } from '../utils/areEnabledAppsEqual'
import { normalizeEnabledApps } from '../utils/normalizeEnabledApps'

/**
 * Compute the next `enabledApps` value, persist it to disk, and return
 * the canonical normalized array. Returns `null` when the input is a
 * no-op (already equal to `current` after normalization), letting the
 * store thin-wrapper skip a re-render.
 */
export function setEnabledAppsAction(
  current: ReadonlyArray<AppView>,
  next: ReadonlyArray<AppView>,
): AppView[] | null {
  const sanitized = normalizeEnabledApps(next)
  if (areEnabledAppsEqual(current, sanitized)) return null
  patchAppData((d) => {
    d.settings.enabledApps = sanitized as AppData['settings']['enabledApps']
  })
  return sanitized
}
