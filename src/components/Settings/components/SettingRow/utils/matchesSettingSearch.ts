import type { SettingsSearchContextValue } from '../../../settings-search'
import { normalizeSettingLabel } from '../../../settings-search/utils/normalizeSettingLabel'

/**
 * Decides whether a `SettingRow` should stay visible while a settings search is
 * active. Primary signal is membership in the fuzzy-matched label set; a plain
 * substring fallback guarantees a clearly-relevant row is never hidden if the
 * search index happens to be missing it.
 */
export function matchesSettingSearch(
  search: SettingsSearchContextValue,
  label: string,
  description: string,
): boolean {
  const normalized = normalizeSettingLabel(label)
  if (search.matchedLabels.has(normalized)) return true

  const query = search.query.toLowerCase()
  if (normalized.includes(query)) return true
  return description.toLowerCase().includes(query)
}
