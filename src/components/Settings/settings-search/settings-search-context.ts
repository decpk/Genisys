import { createContext, useContext } from 'react'

import type { SettingsSearchContextValue } from './settings-search.types'

const EMPTY_LABELS: ReadonlySet<string> = new Set<string>()

/**
 * Default (inactive) context value. Used when no provider is present — e.g.
 * the settings side panel / floating window — so `SettingRow` and custom
 * widgets behave exactly as before search existed.
 */
export const DEFAULT_SETTINGS_SEARCH_CONTEXT: SettingsSearchContextValue = {
  isActive: false,
  query: '',
  matchedLabels: EMPTY_LABELS,
  allLabels: EMPTY_LABELS,
}

export const SettingsSearchContext = createContext<SettingsSearchContextValue>(
  DEFAULT_SETTINGS_SEARCH_CONTEXT,
)

export function useSettingsSearchContext(): SettingsSearchContextValue {
  return useContext(SettingsSearchContext)
}
