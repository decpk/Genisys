import { useState, useCallback } from 'react'
import { useApiClientStore } from '@/store/api-client-store'
import { notify } from '@/frameworks/notification/notify'

/** Logic for the API Client empty state: create + select a blank request. */
export function useRequestBuilderEmptyStateData() {
  const addRequestToUncategorized = useApiClientStore((s) => s.addRequestToUncategorized)
  const setActiveRequestId = useApiClientStore((s) => s.setActiveRequestId)
  const [creating, setCreating] = useState(false)

  const handleCreateRequest = useCallback(async () => {
    if (creating) return
    setCreating(true)
    try {
      const req = await addRequestToUncategorized()
      setActiveRequestId(req.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create request.'
      notify({ source: 'api-client', type: 'error', message })
    } finally {
      setCreating(false)
    }
  }, [creating, addRequestToUncategorized, setActiveRequestId])

  return { creating, handleCreateRequest }
}
