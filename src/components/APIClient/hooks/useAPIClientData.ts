import { useEffect } from 'react'
import { useApiClientStore } from '@/store/api-client-store'
import { useNavigationStore } from '@/store/navigation-store'

export function useAPIClientData() {
  const loadAll = useApiClientStore((s) => s.loadAll)
  const isLoading = useApiClientStore((s) => s.isLoading)
  const isLoaded = useApiClientStore((s) => s.isLoaded)
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const activeEnvironmentId = useApiClientStore((s) => s.activeEnvironmentId)
  const loadEnvironmentVariables = useApiClientStore((s) => s.loadEnvironmentVariables)
  const loadHistory = useApiClientStore((s) => s.loadHistory)
  const openRequestTab = useApiClientStore((s) => s.openRequestTab)
  const pendingApiClientRequestId = useNavigationStore((s) => s.pendingApiClientRequestId)
  const consumeApiClientRequest = useNavigationStore((s) => s.consumeApiClientRequest)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Load variables for active environment when it changes
  useEffect(() => {
    if (isLoaded && activeEnvironmentId) {
      loadEnvironmentVariables(activeEnvironmentId)
    }
  }, [isLoaded, activeEnvironmentId, loadEnvironmentVariables])

  // Load history on init
  useEffect(() => {
    if (isLoaded) {
      loadHistory()
    }
  }, [isLoaded, loadHistory])

  // Open a request requested by another app (e.g. MockServer "Test in API Client")
  useEffect(() => {
    if (isLoaded && pendingApiClientRequestId) {
      openRequestTab(pendingApiClientRequestId)
      consumeApiClientRequest()
    }
  }, [isLoaded, pendingApiClientRequestId, openRequestTab, consumeApiClientRequest])

  return {
    isLoading,
    isLoaded,
    hasActiveRequest: activeRequestId !== null,
  }
}
