import { useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('library')

import { summarizeAppendDroppedFilesResult } from '../utils/summarizeAppendDroppedFilesResult'

import type { AppendDroppedFilesResult } from './useLocalFilesData.types'

interface UseLocalFilesDropToastArgs {
  handleAppendDroppedFiles: (paths: string[]) => AppendDroppedFilesResult
}

interface UseLocalFilesDropToastApi {
  /** onFilesDropped callback: appends files AND surfaces a user-facing toast. */
  handleFilesDropped: (paths: string[]) => void
}

/**
 * Wraps `handleAppendDroppedFiles` with sonner toast feedback so the data hook
 * stays pure (just state + result) and this hook owns the user-facing side
 * effect.
 */
export function useLocalFilesDropToast(
  args: UseLocalFilesDropToastArgs,
): UseLocalFilesDropToastApi {
  const { handleAppendDroppedFiles } = args

  const handleFilesDropped = useCallback(
    (paths: string[]): void => {
      const result = handleAppendDroppedFiles(paths)
      const summary = summarizeAppendDroppedFilesResult(result)
      if (!summary) return

      if (summary.kind === 'success') {
        toast.success(summary.message)
        return
      }
      if (summary.kind === 'error') {
        toast.error(summary.message)
        return
      }
      toast.info(summary.message)
    },
    [handleAppendDroppedFiles],
  )

  return { handleFilesDropped }
}
