import type { SettingsSearchIndexedEntry } from '../settings-search.types'

/**
 * Plain (non-fuzzy) substring search over the settings index. Matches when the
 * lowercased query is contained in the label, section label, description, or
 * any keyword.
 */
export function plainSearchSettings(
  index: readonly SettingsSearchIndexedEntry[],
  query: string,
): SettingsSearchIndexedEntry[] {
  const q = query.toLowerCase()
  return index.filter((entry) => {
    if (entry.label.toLowerCase().includes(q)) return true
    if (entry.sectionLabel.toLowerCase().includes(q)) return true
    if (entry.description.toLowerCase().includes(q)) return true
    if (entry.keywords) {
      for (const keyword of entry.keywords) {
        if (keyword.toLowerCase().includes(q)) return true
      }
    }
    return false
  })
}
