import type { SettingsSection } from '../../Settings.types'

const FULL_PAGE_SECTIONS: ReadonlySet<SettingsSection> = new Set([
  'about',
  'keyboard',
  'notifications',
])

/**
 * Returns true if the given section renders its own full-page layout
 * (no title/description header injected by the shell).
 */
export function isFullPageSection(section: SettingsSection): boolean {
  return FULL_PAGE_SECTIONS.has(section)
}
