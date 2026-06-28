import { useCallback } from 'react'
import { useApiClientStore } from '@/store/api-client-store'
import { notify } from '@/frameworks/notification/notify'
import { detectAndParseImport } from '@/components/APIClient/utils/detectAndParseImport'
import { buildRequestUpdatesFromParsed } from '@/components/APIClient/utils/buildRequestUpdatesFromParsed'

/**
 * Handles auto-filling the active request when the user pastes a recognized
 * request snippet (cURL, fetch, raw HTTP, …) into the URL bar. Returns a
 * handler that returns `true` when the text was recognized and applied.
 */
export function useRequestBuilderImport() {
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const requests = useApiClientStore((s) => s.requests)
  const updateRequest = useApiClientStore((s) => s.updateRequest)

  const handleImportText = useCallback(
    async (text: string): Promise<boolean> => {
      if (!activeRequestId) return false
      const detected = await detectAndParseImport(text)
      if (!detected) return false
      const current = requests.find((r) => r.id === activeRequestId)
      const updates = buildRequestUpdatesFromParsed(detected.parsed, current?.name ?? '')
      updateRequest(activeRequestId, updates)
      notify({ source: 'api-client', type: 'success', message: `Imported from ${detected.format}` })
      return true
    },
    [activeRequestId, requests, updateRequest],
  )

  return { handleImportText }
}
