import type { PmPrompt } from '@/store/prompt-manager-store'

/** Built-in = system / app-shipped prompts (`isBuiltIn === true`). */
export function filterByBuiltIn(prompts: PmPrompt[]): PmPrompt[] {
  return prompts.filter((p) => p.isBuiltIn)
}
