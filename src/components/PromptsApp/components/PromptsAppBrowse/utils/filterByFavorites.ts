import type { PmPrompt } from '@/store/prompt-manager-store'

/** Favorites = prompts the user has pinned. */
export function filterByFavorites(prompts: PmPrompt[]): PmPrompt[] {
  return prompts.filter((p) => p.isPinned)
}
