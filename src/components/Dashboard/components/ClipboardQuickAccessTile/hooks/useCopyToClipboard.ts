import { useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')

import { useClipboardStore } from '@/store/clipboard-store'

export interface UseCopyToClipboardResult {
  copy: (id: string) => Promise<void>
}

/**
 * Stable handler that copies a clipboard item back to the OS clipboard
 * and surfaces a success toast.
 */
export function useCopyToClipboard(): UseCopyToClipboardResult {
  const copyToClipboard = useClipboardStore((s) => s.copyToClipboard)

  const copy = useCallback(
    async (id: string) => {
      try {
        await copyToClipboard(id)
        toast.success('Copied to clipboard', { duration: 1500 })
      } catch {
        toast.error('Failed to copy', { duration: 2000 })
      }
    },
    [copyToClipboard]
  )

  return { copy }
}
