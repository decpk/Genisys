/**
 * Normalizes a setting label for membership comparison between the search
 * index and rendered `SettingRow`s (lowercase, trimmed, collapsed whitespace).
 */
export function normalizeSettingLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, ' ')
}
