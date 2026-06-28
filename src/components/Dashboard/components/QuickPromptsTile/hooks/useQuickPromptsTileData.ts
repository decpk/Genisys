import { useGroupedPrompts, type UseGroupedPromptsResult } from './useGroupedPrompts'
import { useLaunchPrompt, type UseLaunchPromptResult } from './useLaunchPrompt'

export interface UseQuickPromptsTileDataResult {
  grouped: UseGroupedPromptsResult
  actions: UseLaunchPromptResult
}

/**
 * Orchestrator for the Quick Prompts Launcher tile. Composes the grouped
 * folder/category/prompt tree with the launch handler.
 */
export function useQuickPromptsTileData(): UseQuickPromptsTileDataResult {
  const grouped = useGroupedPrompts()
  const actions = useLaunchPrompt()
  return { grouped, actions }
}
