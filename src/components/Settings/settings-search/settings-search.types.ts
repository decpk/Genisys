import type { ComponentType } from 'react'

import type { SettingsSection } from '../Settings.types'

export type SettingsSearchEntryKind = 'setting' | 'card'

/**
 * A single searchable settings entry authored in the search index.
 * - `setting` entries map to a real `SettingRow` rendered inside its section.
 * - `card` entries map to a custom / full-page section surfaced as a
 *   navigable result card.
 */
export interface SettingsSearchEntry {
  id: string
  section: SettingsSection
  kind: SettingsSearchEntryKind
  label: string
  description: string
  keywords?: string[]
}

/** Index entry with the section's display label attached for fuzzy matching. */
export interface SettingsSearchIndexedEntry extends SettingsSearchEntry {
  sectionLabel: string
}

/** Resolved card shown in the flat search results. */
export interface SettingsSearchCardResult {
  id: string
  section: SettingsSection
  title: string
  description: string
  icon: ComponentType<{ size: number }>
}

/** Value shared via context so `SettingRow` can self-filter while searching. */
export interface SettingsSearchContextValue {
  isActive: boolean
  query: string
  matchedLabels: ReadonlySet<string>
  allLabels: ReadonlySet<string>
}

/** Full result of running the settings search for the current query. */
export interface SettingsSearchResult {
  isActive: boolean
  inlineSections: SettingsSection[]
  cards: SettingsSearchCardResult[]
  matchedSections: ReadonlySet<SettingsSection>
  contextValue: SettingsSearchContextValue
}
