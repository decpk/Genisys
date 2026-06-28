import type { AppView } from '../../settings-store'
import { ALWAYS_ENABLED_APPS } from '../AppView.constants'
import { setEnabledAppsAction } from './setEnabledAppsAction'

/**
 * Toggle a single app's enabled state. Refuses to disable any app in
 * `ALWAYS_ENABLED_APPS` (returns `null` no-op).
 *
 * - If `app` is currently enabled → remove it.
 * - If `app` is currently disabled → append it to the end.
 */
export function toggleAppEnabledAction(
  current: ReadonlyArray<AppView>,
  app: AppView,
): AppView[] | null {
  if (ALWAYS_ENABLED_APPS.includes(app)) return null

  const isEnabled = current.includes(app)
  let next: AppView[]
  if (isEnabled) {
    next = current.filter((id) => id !== app)
  } else {
    next = [...current, app]
  }
  return setEnabledAppsAction(current, next)
}
