import { useApiClientStore } from '@/store/api-client-store'
import { useNavigationStore } from '@/store/navigation-store'

import { safeRun } from '../utils/safeRun'
import type { PaletteItem, PaletteSource } from '../CommandPalette.types'

export const apiClientSource: PaletteSource = {
  id: 'apiClient',
  kinds: ['apirequest'],
  getItems(): PaletteItem[] {
    try {
      const state = useApiClientStore.getState() as {
        requests?: Array<{ id: string; name: string; method: string; url: string }>
      }
      const requests = state.requests ?? []
      return requests.map((req): PaletteItem => ({
        id: `apirequest:${req.id}`,
        kind: 'apirequest',
        title: req.name || 'Untitled request',
        subtitle: `${req.method} ${req.url}`,
        keywords: ['api', 'request', 'http', 'rest', 'endpoint', req.method, req.url],
        group: 'navigate',
        action: () =>
          safeRun(() => {
            useNavigationStore.getState().setActiveApp('apiclient')
            const apiState = useApiClientStore.getState() as {
              setActiveRequestId?: (id: string | null) => void
            }
            apiState.setActiveRequestId?.(req.id)
          }),
      }))
    } catch {
      return []
    }
  },
}
