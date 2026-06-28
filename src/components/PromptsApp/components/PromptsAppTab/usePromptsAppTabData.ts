import { useCallback } from 'react'

import type { PmPrompt } from '@/store/prompt-manager-store'

interface UsePromptsAppTabDataParams {
  prompt: PmPrompt
  onClose: (id: string) => void
}

/**
 * Tab-local handlers (middle-click to close, etc.). Selector-free; the
 * tab gets its prompt/active state from props since the parent
 * `PromptsAppTabBar` already subscribes to the tabs store and we don't
 * want every tab to re-render on every store mutation.
 */
export function usePromptsAppTabData(params: UsePromptsAppTabDataParams) {
  const { prompt, onClose } = params

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      // Middle-click closes the tab — matches MockServer's EndpointTab.
      if (event.button === 1) {
        event.preventDefault()
        onClose(prompt.id)
      }
    },
    [onClose, prompt.id],
  )

  const handleCloseClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation()
      onClose(prompt.id)
    },
    [onClose, prompt.id],
  )

  return { handleMouseDown, handleCloseClick }
}
