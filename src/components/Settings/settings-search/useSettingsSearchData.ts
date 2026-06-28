import Fuse from 'fuse.js'
import { useMemo } from 'react'

import type { SettingsSection } from '../Settings.types'

import {
  SECTION_ICON_BY_KEY,
  SETTINGS_SEARCH_ALL_LABELS,
  SETTINGS_SEARCH_FUSE_OPTIONS,
  SETTINGS_SEARCH_INDEX,
  SETTINGS_SEARCH_MIN_QUERY_LENGTH,
} from './settings-search.constants'
import { DEFAULT_SETTINGS_SEARCH_CONTEXT } from './settings-search-context'
import type {
  SettingsSearchCardResult,
  SettingsSearchContextValue,
  SettingsSearchResult,
} from './settings-search.types'
import { normalizeSettingLabel } from './utils/normalizeSettingLabel'
import { plainSearchSettings } from './utils/plainSearchSettings'

const EMPTY_SECTIONS: SettingsSection[] = []
const EMPTY_CARDS: SettingsSearchCardResult[] = []
const EMPTY_SECTION_SET: ReadonlySet<SettingsSection> = new Set()

const INACTIVE_RESULT: SettingsSearchResult = {
  isActive: false,
  inlineSections: EMPTY_SECTIONS,
  cards: EMPTY_CARDS,
  matchedSections: EMPTY_SECTION_SET,
  contextValue: DEFAULT_SETTINGS_SEARCH_CONTEXT,
}

/**
 * Searches the settings index for the given query and returns the sections to
 * render inline (with their rows self-filtered via context), the navigable
 * result cards, and the context value consumed by `SettingRow`. Uses fuzzy
 * (Fuse) matching when `fuzzy` is true, otherwise plain substring matching.
 */
export function useSettingsSearchData(query: string, fuzzy: boolean): SettingsSearchResult {
  const fuse = useMemo(
    () => new Fuse(SETTINGS_SEARCH_INDEX, SETTINGS_SEARCH_FUSE_OPTIONS),
    [],
  )

  const trimmed = query.trim()
  const isActive = trimmed.length >= SETTINGS_SEARCH_MIN_QUERY_LENGTH

  return useMemo<SettingsSearchResult>(() => {
    if (!isActive) return INACTIVE_RESULT

    const entries = fuzzy
      ? fuse.search(trimmed).map((match) => match.item)
      : plainSearchSettings(SETTINGS_SEARCH_INDEX, trimmed)

    const inlineSections: SettingsSection[] = []
    const seenSections = new Set<SettingsSection>()
    const cards: SettingsSearchCardResult[] = []
    const matchedLabels = new Set<string>()

    for (const entry of entries) {
      if (entry.kind === 'card') {
        const icon = SECTION_ICON_BY_KEY[entry.section]
        if (icon) {
          cards.push({
            id: entry.id,
            section: entry.section,
            title: entry.label,
            description: entry.description,
            icon,
          })
        }
        continue
      }

      matchedLabels.add(normalizeSettingLabel(entry.label))
      if (!seenSections.has(entry.section)) {
        seenSections.add(entry.section)
        inlineSections.push(entry.section)
      }
    }

    const matchedSections = new Set<SettingsSection>(inlineSections)
    for (const card of cards) {
      matchedSections.add(card.section)
    }

    const contextValue: SettingsSearchContextValue = {
      isActive: true,
      query: trimmed,
      matchedLabels,
      allLabels: SETTINGS_SEARCH_ALL_LABELS,
    }

    return { isActive: true, inlineSections, cards, matchedSections, contextValue }
  }, [fuse, isActive, trimmed, fuzzy])
}
