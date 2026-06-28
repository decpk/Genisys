import type { PmPrompt } from '@/store/prompt-manager-store'

const MAX_RECENTS = 50

/**
 * Recents = the 50 most-recently-updated prompts in the supplied list,
 * sorted descending by `updatedAt`. Pure helper so the parent hook can
 * stay declarative.
 */
export function filterByRecents(prompts: PmPrompt[]): PmPrompt[] {
  if (prompts.length === 0) return prompts
  const sorted = [...prompts].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  return sorted.slice(0, MAX_RECENTS)
}
