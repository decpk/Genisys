import type { AppView } from '../../settings-store'
import { ALWAYS_ENABLED_APPS, INSTALLABLE_APP_VIEWS } from '../AppView.constants'

/**
 * Sanitize an `enabledApps` list:
 *  - drops unknown / removed AppView ids
 *  - deduplicates while preserving order
 *  - guarantees every required (`ALWAYS_ENABLED_APPS`) app is present,
 *    inserted at the front if missing
 *
 * Pure — safe to use in selectors and tests.
 */
export function normalizeEnabledApps(
  input: ReadonlyArray<AppView>,
): AppView[] {
  const seen = new Set<AppView>()
  const result: AppView[] = []

  for (const id of input) {
    if (!INSTALLABLE_APP_VIEWS.has(id)) continue
    if (seen.has(id)) continue
    seen.add(id)
    result.push(id)
  }

  for (let i = ALWAYS_ENABLED_APPS.length - 1; i >= 0; i -= 1) {
    const required = ALWAYS_ENABLED_APPS[i]
    if (seen.has(required)) continue
    seen.add(required)
    result.unshift(required)
  }

  return result
}
