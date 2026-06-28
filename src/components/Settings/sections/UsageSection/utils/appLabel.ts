import { findAppItem } from '@/components/ActivityBar'
import type { AppView } from '@/components/ActivityBar/ActivityBar.types'

/**
 * Resolves a raw app-view id into a friendly label using the
 * ActivityBar catalog. Falls back to a prettified version of the id
 * (e.g. `dailyplan` → `Dailyplan`) for unknown / session ids.
 */
export function appLabel(appView: string): string {
  if (!appView || appView === '__session__') return 'Genisys Session'

  const item = findAppItem(appView as AppView)
  if (item) return item.label

  const cleaned = appView.replace(/[-_]+/g, ' ').trim()
  if (!cleaned) return appView
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}
