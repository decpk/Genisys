import type { PmPrompt } from '@/store/prompt-manager-store'

/**
 * Lower-cased substring match across the prompt's title, description and
 * (limited) content. Returns the original list when `query` is empty.
 */
export function filterPromptsBySearch(prompts: PmPrompt[], query: string): PmPrompt[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return prompts
  return prompts.filter((p) => {
    if (p.title.toLowerCase().includes(trimmed)) return true
    if (p.description && p.description.toLowerCase().includes(trimmed)) return true
    if (p.content && p.content.toLowerCase().includes(trimmed)) return true
    return false
  })
}
