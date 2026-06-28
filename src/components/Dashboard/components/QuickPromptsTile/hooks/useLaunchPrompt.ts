import { useCallback } from 'react'

import { useNavigationStore } from '@/store/navigation-store'
import type { PmPrompt } from '@/store/prompt-manager-store'

export interface UseLaunchPromptResult {
  launch: (prompt: PmPrompt) => void
}

/**
 * Returns a stable handler that opens Chat with the given prompt's content
 * pre-inserted into the chat editor.
 *
 * Template variables (`{{name}}`) are stripped before insertion to match
 * the existing PromptsPanel "Use" behavior.
 */
export function useLaunchPrompt(): UseLaunchPromptResult {
  const openChatWithPrompt = useNavigationStore((s) => s.openChatWithPrompt)

  const launch = useCallback(
    (prompt: PmPrompt) => {
      const content = prompt.content.replace(/\{\{[^}]+\}\}/g, '')
      openChatWithPrompt(content)
    },
    [openChatWithPrompt]
  )

  return { launch }
}
