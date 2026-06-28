import type { PromptsAppBrowseSectionDescriptor } from './PromptsAppBrowseSectionTabs.types'

/**
 * Single source of truth for the section descriptors rendered by the
 * Browse section tabs. Kept as a module-level constant so React refs
 * stay stable across renders (and never trigger snapshot churn in
 * downstream memos).
 */
export const PROMPTS_APP_BROWSE_SECTIONS: ReadonlyArray<PromptsAppBrowseSectionDescriptor> =
  [
    { value: 'all', label: 'All' },
    { value: 'recents', label: 'Recents' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'builtin', label: 'Built-in' },
  ]
