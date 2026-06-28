import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { useSettingsStore } from '@/store/settings-store'
import { useSettingsDrawerStore } from '@/store/settings-drawer-store'

import { SETTINGS_SECTION_GROUPS } from './Settings.constants'
import type {
  SettingsSection,
  SettingsSectionGroup,
  UseSettingsDataReturn,
} from './Settings.types'
import { useSettingsSearchData } from './settings-search'
import { filterSettingsNavGroups } from './utils/filterSettingsNavGroups'

/**
 * Orchestrates the Settings view: active section, sidebar position, and the
 * search query / fuzzy results. Navigating to a section also clears the query
 * so the sidebar doubles as an "exit search" affordance.
 */
export function useSettingsData(): UseSettingsDataReturn {
  const activeSection = useSettingsDrawerStore((s) => s.activeSection)
  const setActiveSection = useSettingsDrawerStore((s) => s.setActiveSection)
  const sidebarPosition = useSettingsStore((s) => s.sidebarPosition)
  const fuzzyEnabled = useSettingsStore((s) => s.searchFuzzyEnabled)
  const setFuzzyEnabled = useSettingsStore((s) => s.setSearchFuzzyEnabled)
  const isSettingsActive = useIsAppActive('settings')
  const isDrawerOpen = useSettingsDrawerStore((s) => s.isOpen)

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const search = useSettingsSearchData(query, fuzzyEnabled)

  // Focus the search box whenever Settings opens — as the full app (kept
  // mounted under keep-alive, so this covers re-opens) or as the floating
  // modal / Cmd+, drawer (which renders <Settings /> over the host app).
  const shouldFocusSearch = isSettingsActive || isDrawerOpen
  useEffect(() => {
    if (!shouldFocusSearch) return
    const frame = requestAnimationFrame(() => {
      searchContainerRef.current?.querySelector('input')?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [shouldFocusSearch])

  const handleSectionChange = useCallback(
    (section: SettingsSection) => {
      setQuery('')
      setActiveSection(section)
    },
    [setActiveSection],
  )

  const navGroups = useMemo<ReadonlyArray<SettingsSectionGroup>>(() => {
    if (!search.isActive) return SETTINGS_SECTION_GROUPS
    return filterSettingsNavGroups(SETTINGS_SECTION_GROUPS, search.matchedSections)
  }, [search.isActive, search.matchedSections])

  return {
    activeSection,
    sidebarPosition,
    query,
    setQuery,
    search,
    handleSectionChange,
    navGroups,
    fuzzyEnabled,
    setFuzzyEnabled,
    searchContainerRef,
  }
}
