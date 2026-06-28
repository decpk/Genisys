import { useMemo, useCallback } from 'react'
import { Globe, FolderOpen, FileText } from 'lucide-react'

import { useApiClientStore } from '@/store/api-client-store'
import type { NotesPanelData, NotesPanelActions, NoteScopeOption } from '@/right-panels/Notes'

interface APIClientNotesReturn {
  data: NotesPanelData
  actions: NotesPanelActions
}

export function useAPIClientNotesData(): APIClientNotesReturn {
  const activeCollectionId = useApiClientStore((s) => s.activeCollectionId)
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const collections = useApiClientStore((s) => s.collections)
  const requests = useApiClientStore((s) => s.requests)

  const activeCollection = useMemo(
    () => collections.find((c) => c.id === activeCollectionId) ?? null,
    [collections, activeCollectionId],
  )

  const activeRequest = useMemo(
    () => requests.find((r) => r.id === activeRequestId) ?? null,
    [requests, activeRequestId],
  )

  const scopes = useMemo(() => {
    const result: NoteScopeOption[] = [
      { type: 'app', id: 'apiclient', label: 'All API Client', icon: Globe },
    ]

    if (activeCollection) {
      result.push({
        type: 'collection',
        id: activeCollection.id,
        label: activeCollection.name || 'This Collection',
        icon: FolderOpen,
      })
    }

    if (activeRequest) {
      result.push({
        type: 'request',
        id: activeRequest.id,
        label: activeRequest.name || 'This Request',
        icon: FileText,
      })
    }

    return result
  }, [activeCollection, activeRequest])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onScopeChange = useCallback((_: NoteScopeOption) => {
    // No additional side effects needed on scope change
  }, [])

  const data: NotesPanelData = useMemo(
    () => ({
      appId: 'apiclient',
      scopes,
      defaultScopeType: 'app',
    }),
    [scopes],
  )

  const actions: NotesPanelActions = useMemo(() => ({ onScopeChange }), [onScopeChange])

  return { data, actions }
}
