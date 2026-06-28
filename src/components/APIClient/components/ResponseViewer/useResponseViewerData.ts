import { useCallback } from 'react'
import { useApiClientStore } from '@/store/api-client-store'

export function useResponseViewerData() {
  const activeRequestTabId = useApiClientStore((s) => s.activeRequestTabId)
  const responsesByRequestId = useApiClientStore((s) => s.responsesByRequestId)
  const sendingByRequestId = useApiClientStore((s) => s.sendingByRequestId)
  const cancelRequest = useApiClientStore((s) => s.cancelRequest)

  const response = activeRequestTabId ? (responsesByRequestId[activeRequestTabId] ?? null) : null
  const isSending = activeRequestTabId ? Boolean(sendingByRequestId[activeRequestTabId]) : false

  const contentType = response?.headers['content-type'] ?? ''

  const handleCancel = useCallback(() => {
    if (activeRequestTabId) cancelRequest(activeRequestTabId)
  }, [activeRequestTabId, cancelRequest])

  return {
    response,
    isSending,
    contentType,
    handleCancel,
  }
}
