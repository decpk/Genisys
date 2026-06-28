import { useCallback, useEffect, useRef, useState } from 'react'

import { copyToClipboard } from '@/lib/clipboard'
import type { PmPrompt } from '@/store/prompt-manager-store'

export interface UsePromptPickerPromptPreviewDataResult {
  justCopied: boolean
  handleCopy: () => void
}

/**
 * Owns the copy-button state for `PromptPickerPromptPreview`. Tracks a brief
 * `justCopied` flag for visual feedback after copy and cancels the pending
 * timer on unmount so we never set state on an unmounted component.
 */
export function usePromptPickerPromptPreviewData(
  prompt: PmPrompt,
): UsePromptPickerPromptPreviewDataResult {
  const [justCopied, setJustCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(() => {
    copyToClipboard(prompt.content, 'Prompt')
    setJustCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setJustCopied(false), 1500)
  }, [prompt.content])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { justCopied, handleCopy }
}
