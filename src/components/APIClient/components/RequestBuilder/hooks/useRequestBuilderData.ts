import { useCallback, useMemo } from 'react'
import type { ApiRequestItem, HttpMethod } from '../../../APIClient.types'
import { useApiClientStore } from '@/store/api-client-store'
import { executeRequest } from '../../../utils/request-executor'
import { registerSend, unregisterSend, getInFlightSend } from '@/store/api-client-store/runtime/inFlightSends'
import { useRequestBuilderImport } from './useRequestBuilderImport'

export function useRequestBuilderData() {
  const activeRequestId = useApiClientStore((s) => s.activeRequestTabId)
  const requests = useApiClientStore((s) => s.requests)
  const sendingByRequestId = useApiClientStore((s) => s.sendingByRequestId)
  const updateRequest = useApiClientStore((s) => s.updateRequest)
  const setResponseFor = useApiClientStore((s) => s.setResponseFor)
  const setSendingFor = useApiClientStore((s) => s.setSendingFor)
  const cancelRequest = useApiClientStore((s) => s.cancelRequest)
  const activeEnvironmentId = useApiClientStore((s) => s.activeEnvironmentId)
  const environments = useApiClientStore((s) => s.environments)
  const environmentVariables = useApiClientStore((s) => s.environmentVariables)
  const loadHistory = useApiClientStore((s) => s.loadHistory)

  const { handleImportText } = useRequestBuilderImport()

  const activeRequest = requests.find((r) => r.id === activeRequestId) ?? null
  const isSending = activeRequest ? Boolean(sendingByRequestId[activeRequest.id]) : false

  const activeEnv = useMemo(
    () => environments.find((e) => e.id === activeEnvironmentId),
    [environments, activeEnvironmentId]
  )
  const activeVars = useMemo(
    () => (activeEnvironmentId ? (environmentVariables[activeEnvironmentId] ?? []) : []),
    [activeEnvironmentId, environmentVariables]
  )

  const handleUpdate = useCallback(
    (updates: Partial<ApiRequestItem>) => {
      if (!activeRequestId) return
      updateRequest(activeRequestId, updates)
    },
    [activeRequestId, updateRequest]
  )

  const handleMethodChange = useCallback(
    (method: HttpMethod) => handleUpdate({ method }),
    [handleUpdate]
  )

  const handleUrlChange = useCallback(
    (url: string) => handleUpdate({ url }),
    [handleUpdate]
  )

  const handleSend = useCallback(async () => {
    if (!activeRequest || !activeRequest.url.trim()) return
    // Capture the id so the response lands on THIS request even if the user
    // switches tabs while it is in flight (per-tab concurrent sends).
    const requestId = activeRequest.id
    // Unique handle for THIS send so it can be cancelled mid-flight.
    const sendId = crypto.randomUUID()
    registerSend(requestId, sendId)
    setSendingFor(requestId, true)
    setResponseFor(requestId, null)
    try {
      const response = await executeRequest(activeRequest, {
        environmentId: activeEnvironmentId,
        variables: activeVars,
        baseUrl: activeEnv?.baseUrl,
        sendId,
      })
      const entry = getInFlightSend(requestId)
      // Cancelled mid-flight: `cancelRequest` already set the 'Cancelled'
      // response; just refresh history (the backend logged a 'cancelled' entry).
      if (entry?.sendId === sendId && entry.cancelled) {
        loadHistory()
        return
      }
      // Superseded by a newer send for the same tab: drop this stale response.
      if (entry && entry.sendId !== sendId) return
      setResponseFor(requestId, response)
      // Refresh history after successful send
      loadHistory()
    } finally {
      // Only clear if this send still owns the in-flight slot (a newer send may
      // have replaced it, or `cancelRequest` may have already cleared sending).
      const current = getInFlightSend(requestId)
      if (!current || current.sendId === sendId) {
        unregisterSend(requestId, sendId)
        setSendingFor(requestId, false)
      }
    }
  }, [activeRequest, setSendingFor, setResponseFor, activeEnvironmentId, activeVars, activeEnv, loadHistory])

  const handleCancel = useCallback(() => {
    if (activeRequest) cancelRequest(activeRequest.id)
  }, [activeRequest, cancelRequest])

  return {
    activeRequest,
    isSending,
    handleUpdate,
    handleMethodChange,
    handleUrlChange,
    handleSend,
    handleCancel,
    handleImportText,
  }
}
