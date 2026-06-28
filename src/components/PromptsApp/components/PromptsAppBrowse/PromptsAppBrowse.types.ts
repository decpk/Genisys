import type { PmPrompt } from '@/store/prompt-manager-store'

import type { PromptsAppData } from '../../PromptsApp.types'
import type { PromptSortOption } from '../../sort'

export type PromptsAppBrowseSection =
  | 'all'
  | 'recents'
  | 'favorites'
  | 'builtin'

export interface PromptsAppBrowseProps {
  data: PromptsAppData
}

export interface PromptsAppBrowseData {
  activeSection: PromptsAppBrowseSection
  setActiveSection: (section: PromptsAppBrowseSection) => void
  /** Persisted sort option applied on top of the section filter. */
  sortOption: PromptSortOption
  setSortOption: (option: PromptSortOption) => void
  /**
   * A re-projection of `data` with `filteredPrompts` narrowed by the
   * current section. Pass this to the grid so the cards stay in sync
   * with the section tabs without having to thread an extra prop.
   */
  scopedData: PromptsAppData
  sectionFilteredPrompts: PmPrompt[]
}
