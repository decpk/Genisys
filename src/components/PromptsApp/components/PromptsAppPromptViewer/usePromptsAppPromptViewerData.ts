import { useCallback } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

import { sharePrompt } from '@/components/PromptManager/pm-share'
import type { PmPrompt } from '@/store/prompt-manager-store'
import { usePromptManagerStore } from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

import type { PromptsAppData } from '../../PromptsApp.types'
import type { PromptsAppPromptViewerHandlers } from './PromptsAppPromptViewer.types'

interface UsePromptsAppPromptViewerDataParams {
  prompt: PmPrompt
  data: PromptsAppData
}

type UsePromptsAppPromptViewerDataResult = PromptsAppPromptViewerHandlers

/**
 * Local hook for the in-tab prompt viewer. Wraps `usePromptsAppData`
 * handlers (copy / move / edit) plus delete.
 *
 * Delete routes through the shared confirm dialog (same one used by the
 * prompt cards and sidebar) so the experience is consistent everywhere.
 * On confirm we close the tab first, then remove the prompt — the
 * orphan-prune effect handles deletes that originate elsewhere. Built-in
 * prompts can be deleted too (the store records a persisted tombstone).
 */
export function usePromptsAppPromptViewerData(
  params: UsePromptsAppPromptViewerDataParams,
): UsePromptsAppPromptViewerDataResult {
  const { prompt, data } = params

  const removePromptDirect = usePromptManagerStore((s) => s.removePrompt)
  const closePromptTab = usePromptsAppTabsStore((s) => s.closePromptTab)
  const openConfirm = useConfirmDialogStore((s) => s.openConfirmDialog)

  const handleCopy = useCallback(
    (p: PmPrompt) => {
      void data.handleCopyPrompt(p)
    },
    [data],
  )

  const handleShare = useCallback((p: PmPrompt) => {
    void Promise.resolve(sharePrompt(p)).catch((err: unknown) => {
      toast.error('Failed to share prompt', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    })
  }, [])

  const handleEdit = useCallback(
    (p: PmPrompt) => {
      data.openPromptDialog({ prompt: p })
    },
    [data],
  )

  const handleMove = useCallback(
    (p: PmPrompt) => {
      data.openMoveDialog(p)
    },
    [data],
  )

  const handleRequestDelete = useCallback(() => {
    openConfirm({
      title: 'Delete prompt',
      description: 'Delete this prompt? This cannot be undone.',
      variant: 'destructive',
      onConfirm: () => {
        closePromptTab(prompt.id)
        void removePromptDirect(prompt.id)
      },
    })
  }, [openConfirm, closePromptTab, removePromptDirect, prompt.id])

  return {
    handleCopy,
    handleShare,
    handleEdit,
    handleMove,
    handleRequestDelete,
  }
}
