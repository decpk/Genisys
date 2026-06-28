import { useState, useMemo, useCallback } from 'react'
import { useApiClientStore } from '@/store/api-client-store'
import { useSettingsStore } from '@/store/settings-store'
import { notify } from '@/frameworks/notification/notify'
import {
  buildExportFileName,
  stringifyExportEnvelope,
} from '../../utils/collection-export'
import { saveExportFile } from './api/saveExportFile'
import type { ApiClientSortField, ApiClientSortDirection } from '@/store/settings-store'
import type { ApiClientSortConfig } from './APIClientSortSwitcher'

export function compareByField<T extends { name: string; createdAt: string; updatedAt: string; method?: string }>(
  a: T,
  b: T,
  field: ApiClientSortField,
  direction: ApiClientSortDirection,
): number {
  const dir = direction === 'asc' ? 1 : -1
  switch (field) {
    case 'name':
      return dir * a.name.localeCompare(b.name)
    case 'method':
      return dir * (a.method ?? '').localeCompare(b.method ?? '')
    case 'createdAt':
      return dir * a.createdAt.localeCompare(b.createdAt)
    case 'updatedAt':
      return dir * a.updatedAt.localeCompare(b.updatedAt)
    default:
      return 0
  }
}

export function useAPIClientSidebarData() {
  const collections = useApiClientStore((s) => s.collections)
  const folders = useApiClientStore((s) => s.folders)
  const requests = useApiClientStore((s) => s.requests)
  const isLoading = useApiClientStore((s) => s.isLoading)
  const error = useApiClientStore((s) => s.error)
  const reload = useApiClientStore((s) => s.reload)
  const activeRequestId = useApiClientStore((s) => s.activeRequestId)
  const setActiveRequestId = useApiClientStore((s) => s.setActiveRequestId)
  const addCollection = useApiClientStore((s) => s.addCollection)
  const removeCollection = useApiClientStore((s) => s.removeCollection)
  const updateFolder = useApiClientStore((s) => s.updateFolder)
  const removeFolder = useApiClientStore((s) => s.removeFolder)
  const updateCollection = useApiClientStore((s) => s.updateCollection)
  const addRequest = useApiClientStore((s) => s.addRequest)
  const addRequestToUncategorized = useApiClientStore((s) => s.addRequestToUncategorized)
  const updateRequest = useApiClientStore((s) => s.updateRequest)
  const duplicateRequest = useApiClientStore((s) => s.duplicateRequest)
  const exportCollection = useApiClientStore((s) => s.exportCollection)
  const exportRequest = useApiClientStore((s) => s.exportRequest)
  const sortField = useSettingsStore((s) => s.apiClientSortField)
  const sortDirection = useSettingsStore((s) => s.apiClientSortDirection)
  const setApiClientSortField = useSettingsStore((s) => s.setApiClientSortField)
  const setApiClientSortDirection = useSettingsStore((s) => s.setApiClientSortDirection)
  const [filter, setFilter] = useState('')
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showImportCollection, setShowImportCollection] = useState(false)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequestCollectionId, setNewRequestCollectionId] = useState<string | null>(null)
  const [newRequestFolderId, setNewRequestFolderId] = useState<string | undefined>(undefined)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderCollectionId, setNewFolderCollectionId] = useState<string | null>(null)
  const [analyticsRequestId, setAnalyticsRequestId] = useState<string | null>(null)

  const sort: ApiClientSortConfig = useMemo(() => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection])

  const onSortChange = useCallback((next: ApiClientSortConfig) => {
    setApiClientSortField(next.field)
    setApiClientSortDirection(next.direction)
  }, [setApiClientSortField, setApiClientSortDirection])

  const filteredCollections = useMemo(() => {
    const base = filter
      ? collections.filter((c) => {
          const lower = filter.toLowerCase()
          const hasMatchingName = c.name.toLowerCase().includes(lower)
          const hasMatchingRequest = requests.some(
            (r) => r.collectionId === c.id && (r.name.toLowerCase().includes(lower) || r.url.toLowerCase().includes(lower))
          )
          return hasMatchingName || hasMatchingRequest
        })
      : collections
    // For collections: 'method' field doesn't apply, fall back to 'name'
    const effectiveField: ApiClientSortField = sortField === 'method' ? 'name' : sortField
    return [...base].sort((a, b) => compareByField(a, b, effectiveField, sortDirection))
  }, [collections, requests, filter, sortField, sortDirection])

  const handleAddRequest = useCallback((collectionId: string, folderId?: string) => {
    setNewRequestCollectionId(collectionId)
    setNewRequestFolderId(folderId)
    setShowNewRequest(true)
  }, [])

  const handleAddFolder = useCallback((collectionId: string) => {
    setNewFolderCollectionId(collectionId)
    setShowNewFolder(true)
  }, [])

  const handleExportCollection = useCallback(async (collectionId: string) => {
    try {
      const envelope = exportCollection(collectionId)
      const content = stringifyExportEnvelope(envelope)
      const fileName = buildExportFileName(envelope.collection.name)
      const savedPath = await saveExportFile(fileName, content)
      if (savedPath) {
        notify({ source: 'api-client', type: 'success', message: `Collection exported to ${savedPath}` })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export collection.'
      notify({ source: 'api-client', type: 'error', message })
    }
  }, [exportCollection])

  const handleExportRequest = useCallback(async (requestId: string) => {
    try {
      const envelope = exportRequest(requestId)
      const content = stringifyExportEnvelope(envelope)
      const fileName = buildExportFileName(envelope.request.name)
      const savedPath = await saveExportFile(fileName, content)
      if (savedPath) {
        notify({ source: 'api-client', type: 'success', message: `Request exported to ${savedPath}` })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export request.'
      notify({ source: 'api-client', type: 'error', message })
    }
  }, [exportRequest])

  const handleDuplicateRequest = useCallback(async (requestId: string) => {
    try {
      const duplicated = await duplicateRequest(requestId)
      if (!duplicated) {
        throw new Error('Request not found.')
      }
      setActiveRequestId(duplicated.id)
      notify({ source: 'api-client', type: 'success', message: `Request duplicated as "${duplicated.name}"` })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to duplicate request.'
      notify({ source: 'api-client', type: 'error', message })
    }
  }, [duplicateRequest, setActiveRequestId])

  const handleNewRequestQuick = useCallback(async () => {
    try {
      const req = await addRequestToUncategorized()
      setActiveRequestId(req.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create request.'
      notify({ source: 'api-client', type: 'error', message })
    }
  }, [addRequestToUncategorized, setActiveRequestId])

  const openAnalytics = useCallback((requestId: string) => {
    setAnalyticsRequestId(requestId)
  }, [])

  const closeAnalytics = useCallback(() => {
    setAnalyticsRequestId(null)
  }, [])

  return {
    collections: filteredCollections,
    allFolders: folders,
    allRequests: requests,
    isLoading,
    error,
    reload,
    activeRequestId,
    filter,
    setFilter,
    sort,
    onSortChange,
    showNewCollection,
    setShowNewCollection,
    showImport,
    setShowImport,
    showImportCollection,
    setShowImportCollection,
    showNewRequest,
    setShowNewRequest,
    newRequestCollectionId,
    newRequestFolderId,
    showNewFolder,
    setShowNewFolder,
    newFolderCollectionId,
    setActiveRequestId,
    addCollection,
    removeCollection,
    updateCollection,
    updateFolder,
    updateRequest,
    addRequest,
    handleAddRequest,
    handleAddFolder,
    handleNewRequestQuick,
    handleDuplicateRequest,
    handleExportCollection,
    handleExportRequest,
    removeFolder,
    analyticsRequestId,
    openAnalytics,
    closeAnalytics,
  }
}
