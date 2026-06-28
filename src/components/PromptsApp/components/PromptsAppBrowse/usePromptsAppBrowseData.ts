import { useCallback, useMemo, useState } from 'react'

import {
  readPromptSort,
  sortPrompts,
  writePromptSort,
  type PromptSortOption,
} from '../../sort'
import type { PromptsAppData } from '../../PromptsApp.types'
import type {
  PromptsAppBrowseData,
  PromptsAppBrowseSection,
} from './PromptsAppBrowse.types'
import { applyBrowseSectionFilter } from './utils/applyBrowseSectionFilter'

const DEFAULT_SECTION: PromptsAppBrowseSection = 'all'

/**
 * Owns the Browse-section state (All / Recents / Favorites / Built-in)
 * plus the persisted sort option, and projects `data` with a narrowed,
 * sorted `filteredPrompts` list so the existing grid + empty-state
 * components keep working unchanged.
 */
export function usePromptsAppBrowseData(
  data: PromptsAppData,
): PromptsAppBrowseData {
  const [activeSection, setActiveSection] =
    useState<PromptsAppBrowseSection>(DEFAULT_SECTION)

  const [sortOption, setSortOptionState] = useState<PromptSortOption>(() =>
    readPromptSort(),
  )

  const setSortOption = useCallback((option: PromptSortOption) => {
    setSortOptionState(option)
    writePromptSort(option)
  }, [])

  const sectionFilteredPrompts = useMemo(
    () => applyBrowseSectionFilter(data.filteredPrompts, activeSection),
    [data.filteredPrompts, activeSection],
  )

  const sortedPrompts = useMemo(
    () => sortPrompts(sectionFilteredPrompts, sortOption),
    [sectionFilteredPrompts, sortOption],
  )

  const scopedData = useMemo<PromptsAppData>(
    () => ({ ...data, filteredPrompts: sortedPrompts }),
    [data, sortedPrompts],
  )

  return {
    activeSection,
    setActiveSection,
    sortOption,
    setSortOption,
    scopedData,
    sectionFilteredPrompts: sortedPrompts,
  }
}
