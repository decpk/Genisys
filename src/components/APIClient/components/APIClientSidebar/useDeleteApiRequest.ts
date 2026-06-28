import { useCallback } from 'react'
import { useApiClientStore } from '@/store/api-client-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { buildDeleteRequestDialog } from './utils/buildDeleteRequestDialog'

/**
 * Encapsulates the "delete an API request" action: looks up the request name,
 * opens the shared confirmation dialog, and removes the request on confirm.
 * Reusable wherever a request id is available — avoids prop-drilling removeRequest.
 */
export function useDeleteApiRequest(): (requestId: string) => void {
  const requests = useApiClientStore((s) => s.requests)
  const removeRequest = useApiClientStore((s) => s.removeRequest)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  return useCallback(
    (requestId: string) => {
      const request = requests.find((r) => r.id === requestId)
      const dialog = buildDeleteRequestDialog(request?.name)
      openConfirmDialog({
        title: dialog.title,
        description: dialog.description,
        onConfirm: () => removeRequest(requestId),
      })
    },
    [requests, removeRequest, openConfirmDialog],
  )
}
