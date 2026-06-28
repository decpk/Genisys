import { useMemo } from 'react'

import {
  usePromptManagerStore,
  type PmPrompt,
} from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

interface UsePromptsAppContentDataResult {
  activePromptTabId: string | null
  activePrompt: PmPrompt | null
}

/**
 * Decides what fills the PromptsApp content area: Browse (when the
 * active tab is `null`) or the prompt viewer for a resolved prompt.
 * Kept separate from `usePromptsAppData` to avoid mixing tab UI state
 * with the shared orchestrator hook.
 */
export function usePromptsAppContentData(): UsePromptsAppContentDataResult {
  const activePromptTabId = usePromptsAppTabsStore((s) => s.activePromptTabId)
  const prompts = usePromptManagerStore((s) => s.prompts)

  const activePrompt = useMemo(() => {
    if (!activePromptTabId) return null
    return prompts.find((p) => p.id === activePromptTabId) ?? null
  }, [prompts, activePromptTabId])

  return { activePromptTabId, activePrompt }
}
