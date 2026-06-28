import type { SettingsSection, SettingsSectionGroup } from '../Settings.types'

/**
 * Returns only the nav groups (and items) whose section has a search match,
 * dropping groups that end up empty. Used to filter the Settings sidebar while
 * a search is active.
 */
export function filterSettingsNavGroups(
  groups: ReadonlyArray<SettingsSectionGroup>,
  matchedSections: ReadonlySet<SettingsSection>,
): SettingsSectionGroup[] {
  const result: SettingsSectionGroup[] = []
  for (const group of groups) {
    const items = group.items.filter((item) => matchedSections.has(item.key))
    if (items.length > 0) {
      result.push({ label: group.label, items })
    }
  }
  return result
}
