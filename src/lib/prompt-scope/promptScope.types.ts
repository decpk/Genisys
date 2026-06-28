import type { AppView } from '@/store/settings-store'

/**
 * The set of AppViews a prompt folder may be scoped to. A folder with
 * `scopes` set to an empty array (or `undefined`) is treated as available in
 * every scopable surface.
 */
export type PromptScopeApp = AppView
