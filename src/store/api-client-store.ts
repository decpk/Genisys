import { create } from 'zustand'
import type {
  ApiCollection,
  ApiFolder,
  ApiRequestRaw,
  ApiRequestItem,
  ApiResponse,
  ApiEnvironment,
  ApiEnvironmentVariable,
  ApiHistoryEntry,
  Workspace,
  HttpMethod,
  BodyType,
  AuthType,
  AuthData,
  KeyValuePair,
} from '@/components/APIClient/APIClient.types'
import type { ImportFormat } from '@/components/APIClient/utils/import-parsers'
import type {
  CollectionImportFormat,
  CollectionImportResult,
} from '@/components/APIClient/utils/collection-import/collection-import.types'
import type {
  GenisysCollectionExport,
  GenisysRequestExport,
} from '@/components/APIClient/utils/collection-export/collection-export.types'
import { importCollectionAction } from './api-client-store/actions/importCollection'
import { exportCollectionAction } from './api-client-store/actions/exportCollection'
import { exportRequestAction } from './api-client-store/actions/exportRequest'
import { addRequestToUncategorizedAction } from './api-client-store/actions/addRequestToUncategorized'
import { openRequestTabAction } from './api-client-store/actions/openRequestTab'
import { closeRequestTabAction } from './api-client-store/actions/closeRequestTab'
import { closeOtherRequestTabsAction } from './api-client-store/actions/closeOtherRequestTabs'
import { closeAllRequestTabsAction } from './api-client-store/actions/closeAllRequestTabs'
import { setActiveRequestTabAction } from './api-client-store/actions/setActiveRequestTab'
import { reorderRequestTabsAction } from './api-client-store/actions/reorderRequestTabs'
import { setResponseForAction } from './api-client-store/actions/setResponseFor'
import { setSendingForAction } from './api-client-store/actions/setSendingFor'
import { cancelRequestAction } from './api-client-store/actions/cancelRequest'
import { readTabs } from './api-client-store/utils/readTabs'
import { persistTabs } from './api-client-store/utils/persistTabs'
import { getActiveTabMirror } from './api-client-store/utils/getActiveTabMirror'

// ─── Helpers ─────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString()
}

function hydrateRequest(raw: ApiRequestRaw): ApiRequestItem {
  let params: KeyValuePair[] = []
  let headers: KeyValuePair[] = []
  let authData: AuthData = {}

  try { params = JSON.parse(raw.params) } catch { /* empty */ }
  try { headers = JSON.parse(raw.headers) } catch { /* empty */ }
  try { authData = JSON.parse(raw.authData) } catch { /* empty */ }

  return {
    id: raw.id,
    workspaceId: raw.workspaceId,
    collectionId: raw.collectionId,
    folderId: raw.folderId,
    name: raw.name,
    method: raw.method as HttpMethod,
    url: raw.url,
    params,
    headers,
    bodyType: raw.bodyType as BodyType,
    bodyContent: raw.bodyContent,
    authType: raw.authType as AuthType,
    authData,
    defaultEnvironmentId: raw.defaultEnvironmentId,
    sortOrder: raw.sortOrder,
    deletedAt: raw.deletedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function dehydrateRequest(item: ApiRequestItem): ApiRequestRaw {
  return {
    id: item.id,
    workspaceId: item.workspaceId,
    collectionId: item.collectionId,
    folderId: item.folderId,
    name: item.name,
    method: item.method,
    url: item.url,
    params: JSON.stringify(item.params),
    headers: JSON.stringify(item.headers),
    bodyType: item.bodyType,
    bodyContent: item.bodyContent,
    authType: item.authType,
    authData: JSON.stringify(item.authData),
    defaultEnvironmentId: item.defaultEnvironmentId,
    sortOrder: item.sortOrder,
    deletedAt: item.deletedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

// ─── State ───────────────────────────────────────────────────────

interface ApiClientState {
  collections: ApiCollection[]
  folders: ApiFolder[]
  requests: ApiRequestItem[]
  environments: ApiEnvironment[]
  activeEnvironmentId: string | null
  environmentVariables: Record<string, ApiEnvironmentVariable[]>
  workspaces: Workspace[]
  activeWorkspaceId: string
  history: ApiHistoryEntry[]
  activeCollectionId: string | null
  activeRequestId: string | null
  activeResponse: ApiResponse | null
  isLoading: boolean
  isSending: boolean
  isLoaded: boolean
  error: string | null
  sidebarTab: 'collections' | 'history' | 'environments'

  // ── Multi-tab (request tabs) ──────────────────────────────────
  /** Ids of requests currently open as tabs, in display order. */
  openRequestTabs: string[]
  /** Id of the request tab that is currently focused, mirrored to activeRequestId. */
  activeRequestTabId: string | null
  /** Last response per request id — lets each tab keep its own response. */
  responsesByRequestId: Record<string, ApiResponse | null>
  /** In-flight (sending) state per request id — enables concurrent sends. */
  sendingByRequestId: Record<string, boolean>
  /** Request ids with an unsaved write in flight (drives the dirty dot). */
  pendingSaveRequestIds: string[]
}

// ─── Actions ─────────────────────────────────────────────────────

interface ApiClientActions {
  loadAll: () => Promise<void>
  reload: () => Promise<void>

  addCollection: (name: string, color?: string) => Promise<ApiCollection>
  updateCollection: (id: string, updates: Partial<ApiCollection>) => Promise<void>
  removeCollection: (id: string) => Promise<void>

  addFolder: (collectionId: string, name: string, parentFolderId?: string) => Promise<ApiFolder>
  updateFolder: (id: string, updates: Partial<ApiFolder>) => Promise<void>
  removeFolder: (id: string) => Promise<void>

  addRequest: (collectionId: string, name: string, method: HttpMethod, folderId?: string) => Promise<ApiRequestItem>
  updateRequest: (id: string, updates: Partial<ApiRequestItem>) => Promise<void>
  removeRequest: (id: string) => Promise<void>
  duplicateRequest: (id: string) => Promise<ApiRequestItem | null>
  addRequestToUncategorized: () => Promise<ApiRequestItem>

  setActiveCollectionId: (id: string | null) => void
  setActiveRequestId: (id: string | null) => void
  setActiveResponse: (response: ApiResponse | null) => void
  setIsSending: (v: boolean) => void
  setSidebarTab: (tab: 'collections' | 'history' | 'environments') => void

  // Request tabs
  openRequestTab: (id: string) => void
  closeRequestTab: (id: string) => void
  closeOtherRequestTabs: (id: string) => void
  closeAllRequestTabs: () => void
  setActiveRequestTab: (id: string | null) => void
  reorderRequestTabs: (ids: string[]) => void
  setResponseFor: (id: string, response: ApiResponse | null) => void
  setSendingFor: (id: string, sending: boolean) => void
  cancelRequest: (requestId: string) => void

  // Environments
  addEnvironment: (name: string, color?: string) => Promise<ApiEnvironment>
  updateEnvironment: (id: string, updates: Partial<ApiEnvironment>) => Promise<void>
  removeEnvironment: (id: string) => Promise<void>
  setActiveEnvironment: (id: string | null) => Promise<void>
  loadEnvironmentVariables: (environmentId: string) => Promise<void>
  addEnvironmentVariable: (environmentId: string, key: string, value: string) => Promise<void>
  updateEnvironmentVariable: (id: string, updates: Partial<ApiEnvironmentVariable>) => Promise<void>
  removeEnvironmentVariable: (id: string, environmentId: string) => Promise<void>

  // History
  loadHistory: () => Promise<void>
  clearHistory: () => Promise<void>
  removeHistoryEntry: (id: string) => Promise<void>

  importRequest: (format: ImportFormat, input: string, collectionId: string, folderId?: string) => Promise<ApiRequestItem>
  importFromCurl: (curl: string, collectionId: string, folderId?: string) => Promise<ApiRequestItem>
  importCollection: (format: CollectionImportFormat, raw: string) => Promise<CollectionImportResult>
  exportCollection: (collectionId: string) => GenisysCollectionExport
  exportRequest: (requestId: string) => GenisysRequestExport
}

export type ApiClientStore = ApiClientState & ApiClientActions

// ─── Store ───────────────────────────────────────────────────────

export const useApiClientStore = create<ApiClientState & ApiClientActions>()((set, get) => ({
  collections: [],
  folders: [],
  requests: [],
  environments: [],
  activeEnvironmentId: null,
  environmentVariables: {},
  workspaces: [],
  activeWorkspaceId: 'default',
  history: [],
  activeCollectionId: null,
  activeRequestId: null,
  activeResponse: null,
  isLoading: false,
  isSending: false,
  isLoaded: false,
  error: null,
  sidebarTab: 'collections' as const,

  openRequestTabs: [],
  activeRequestTabId: null,
  responsesByRequestId: {},
  sendingByRequestId: {},
  pendingSaveRequestIds: [],

  loadAll: async () => {
    if (get().isLoaded) return
    set({ isLoading: true, error: null })
    try {
      const data = await window.api.apiLoadAll();
      const requests = (data.requests ?? []).map(hydrateRequest);
      set({
        collections: data.collections ?? [],
        folders: data.folders ?? [],
        requests,
        environments: data.environments ?? [],
        activeEnvironmentId: data.activeEnvironmentId ?? null,
        workspaces: data.workspaces ?? [],
        activeWorkspaceId:
          data.workspaces?.find((w: Workspace) => w.isDefault)?.id ?? "default",
        isLoaded: true,
      });

      // Restore the open request tabs + active tab for this workspace, dropping
      // any ids whose requests no longer exist.
      if (get().openRequestTabs.length === 0 && !get().activeRequestId) {
        const existing = new Set(requests.map((r) => r.id));
        const saved = readTabs(get().activeWorkspaceId);
        const restoredTabs = saved.openRequestTabs.filter((id) =>
          existing.has(id),
        );
        let restoredActive: string | null = null;
        if (
          saved.activeRequestTabId &&
          existing.has(saved.activeRequestTabId)
        ) {
          restoredActive = saved.activeRequestTabId;
        } else {
          restoredActive = restoredTabs[0] ?? null;
        }
        if (restoredTabs.length > 0) {
          set({
            openRequestTabs: restoredTabs,
            activeRequestTabId: restoredActive,
            ...getActiveTabMirror(get(), restoredActive),
          });
          persistTabs(get().activeWorkspaceId, restoredTabs, restoredActive);
          if (restoredActive) get().setActiveRequestTab(restoredActive);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[api-client] loadAll failed:', message)
      set({ error: message })
    } finally {
      set({ isLoading: false })
    }
  },

  reload: async () => {
    set({ isLoaded: false, error: null })
    await get().loadAll()
  },

  // ── Collections ──────────────────────────────────────────────

  addCollection: async (name, color = '') => {
    const { collections, activeWorkspaceId } = get()
    const collection: ApiCollection = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      name,
      description: '',
      color,
      sortOrder: collections.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ collections: [...s.collections, collection] }))
    try {
      await window.api.apiSaveCollection(collection)
    } catch (err) {
      console.error('[api-client] Failed to save collection:', err)
      set((s) => ({ collections: s.collections.filter((c) => c.id !== collection.id) }))
      throw err
    }
    return collection
  },

  updateCollection: async (id, updates) => {
    set((s) => ({
      collections: s.collections.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: now() } : c
      ),
    }))
    const updated = get().collections.find((c) => c.id === id)
    if (updated) await window.api.apiSaveCollection(updated)
  },

  removeCollection: async (id) => {
    const { activeCollectionId, requests } = get()
    const affectedRequestIds = new Set(requests.filter((r) => r.collectionId === id).map((r) => r.id))
    // Close any open tabs that belong to the removed collection.
    for (const reqId of affectedRequestIds) {
      if (get().openRequestTabs.includes(reqId)) {
        closeRequestTabAction(get, set, reqId)
      }
    }
    set((s) => ({
      collections: s.collections.filter((c) => c.id !== id),
      folders: s.folders.filter((f) => f.collectionId !== id),
      requests: s.requests.filter((r) => r.collectionId !== id),
      activeCollectionId: activeCollectionId === id ? null : activeCollectionId,
      pendingSaveRequestIds: s.pendingSaveRequestIds.filter((p) => !affectedRequestIds.has(p)),
    }))
    await window.api.apiRemoveCollection(id)
  },

  // ── Folders ──────────────────────────────────────────────────

  addFolder: async (collectionId, name, parentFolderId) => {
    const { folders, activeWorkspaceId } = get()
    const siblings = folders.filter((f) => f.collectionId === collectionId && f.parentFolderId === (parentFolderId ?? null))
    const folder: ApiFolder = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      collectionId,
      parentFolderId: parentFolderId ?? null,
      name,
      sortOrder: siblings.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ folders: [...s.folders, folder] }))
    try {
      await window.api.apiSaveFolder(folder)
    } catch (err) {
      console.error('[api-client] Failed to save folder:', err)
      set((s) => ({ folders: s.folders.filter((f) => f.id !== folder.id) }))
      throw err
    }
    return folder
  },

  updateFolder: async (id, updates) => {
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: now() } : f
      ),
    }))
    const updated = get().folders.find((f) => f.id === id)
    if (updated) await window.api.apiSaveFolder(updated)
  },

  removeFolder: async (id) => {
    // Requests in this folder get folder_id = null (DB handles SET NULL)
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      requests: s.requests.map((r) =>
        r.folderId === id ? { ...r, folderId: null } : r
      ),
    }))
    await window.api.apiRemoveFolder(id)
  },

  // ── Requests ─────────────────────────────────────────────────

  addRequest: async (collectionId, name, method, folderId) => {
    const { requests, activeWorkspaceId } = get()
    const siblings = requests.filter((r) =>
      r.collectionId === collectionId && r.folderId === (folderId ?? null)
    )
    const item: ApiRequestItem = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      collectionId,
      folderId: folderId ?? null,
      name,
      method,
      url: '',
      params: [],
      headers: [],
      bodyType: 'none',
      bodyContent: '',
      authType: 'none',
      authData: {},
      defaultEnvironmentId: null,
      sortOrder: siblings.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ requests: [...s.requests, item] }))
    try {
      await window.api.apiSaveRequest(dehydrateRequest(item))
    } catch (err) {
      console.error('[api-client] Failed to save request:', err)
      set((s) => ({ requests: s.requests.filter((r) => r.id !== item.id) }))
      throw err
    }
    return item
  },

  updateRequest: async (id, updates) => {
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: now() } : r
      ),
      pendingSaveRequestIds: s.pendingSaveRequestIds.includes(id)
        ? s.pendingSaveRequestIds
        : [...s.pendingSaveRequestIds, id],
    }))
    const updated = get().requests.find((r) => r.id === id)
    try {
      if (updated) await window.api.apiSaveRequest(dehydrateRequest(updated))
    } finally {
      set((s) => ({
        pendingSaveRequestIds: s.pendingSaveRequestIds.filter((p) => p !== id),
      }))
    }
  },

  removeRequest: async (id) => {
    // Close the tab first so the active tab falls back to a neighbour and the
    // per-request response/sending maps are cleaned up.
    closeRequestTabAction(get, set, id)
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== id),
      pendingSaveRequestIds: s.pendingSaveRequestIds.filter((p) => p !== id),
    }))
    await window.api.apiRemoveRequest(id)
  },

  duplicateRequest: async (id) => {
    const source = get().requests.find((r) => r.id === id)
    if (!source) return null
    const dup: ApiRequestItem = {
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} (copy)`,
      sortOrder: get().requests.filter((r) =>
        r.collectionId === source.collectionId && r.folderId === source.folderId
      ).length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ requests: [...s.requests, dup] }))
    try {
      await window.api.apiSaveRequest(dehydrateRequest(dup))
    } catch (err) {
      console.error('[api-client] Failed to duplicate request:', err)
      set((s) => ({ requests: s.requests.filter((r) => r.id !== dup.id) }))
      throw err
    }
    return dup
  },

  addRequestToUncategorized: () => addRequestToUncategorizedAction(get, set),

  // ── Navigation ───────────────────────────────────────────────

  setActiveCollectionId: (id) => set({ activeCollectionId: id }),

  setActiveRequestId: (id) => {
    if (id === null) {
      set({ activeRequestTabId: null, activeRequestId: null, activeResponse: null, isSending: false })
      persistTabs(get().activeWorkspaceId, get().openRequestTabs, null)
      return
    }
    openRequestTabAction(get, set, id)
  },

  setActiveResponse: (response) => {
    const { activeRequestTabId } = get()
    if (activeRequestTabId) setResponseForAction(set, activeRequestTabId, response)
    else set({ activeResponse: response })
  },
  setIsSending: (v) => {
    const { activeRequestTabId } = get()
    if (activeRequestTabId) setSendingForAction(set, activeRequestTabId, v)
    else set({ isSending: v })
  },
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // ── Request tabs ─────────────────────────────────────────────

  openRequestTab: (id) => openRequestTabAction(get, set, id),
  closeRequestTab: (id) => closeRequestTabAction(get, set, id),
  closeOtherRequestTabs: (id) => closeOtherRequestTabsAction(get, set, id),
  closeAllRequestTabs: () => closeAllRequestTabsAction(get, set),
  setActiveRequestTab: (id) => setActiveRequestTabAction(get, set, id),
  reorderRequestTabs: (ids) => reorderRequestTabsAction(get, set, ids),
  setResponseFor: (id, response) => setResponseForAction(set, id, response),
  setSendingFor: (id, sending) => setSendingForAction(set, id, sending),
  cancelRequest: (requestId) => cancelRequestAction(set, requestId),

  // ── Environments ─────────────────────────────────────────────

  addEnvironment: async (name, color = '') => {
    const { environments, activeWorkspaceId } = get()
    const env: ApiEnvironment = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      name,
      baseUrl: '',
      description: '',
      color,
      isActive: environments.length === 0,
      sortOrder: environments.length,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({
      environments: [...s.environments, env],
      activeEnvironmentId: s.environments.length === 0 ? env.id : s.activeEnvironmentId,
    }))
    await window.api.apiSaveEnvironment(env)
    return env
  },

  updateEnvironment: async (id, updates) => {
    set((s) => ({
      environments: s.environments.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: now() } : e
      ),
    }))
    const updated = get().environments.find((e) => e.id === id)
    if (updated) await window.api.apiSaveEnvironment(updated)
  },

  removeEnvironment: async (id) => {
    const { activeEnvironmentId } = get()
    set((s) => ({
      environments: s.environments.filter((e) => e.id !== id),
      activeEnvironmentId: activeEnvironmentId === id ? null : activeEnvironmentId,
    }))
    await window.api.apiRemoveEnvironment(id)
  },

  setActiveEnvironment: async (id) => {
    const { activeWorkspaceId } = get()
    if (id) {
      set((s) => ({
        environments: s.environments.map((e) => ({
          ...e,
          isActive: e.id === id,
        })),
        activeEnvironmentId: id,
      }))
      await window.api.apiSetActiveEnvironment(activeWorkspaceId, id)
    } else {
      set((s) => ({
        environments: s.environments.map((e) => ({ ...e, isActive: false })),
        activeEnvironmentId: null,
      }))
    }
  },

  loadEnvironmentVariables: async (environmentId) => {
    const vars = await window.api.apiLoadEnvironmentVariables(environmentId)
    set((s) => ({
      environmentVariables: { ...s.environmentVariables, [environmentId]: vars ?? [] },
    }))
  },

  addEnvironmentVariable: async (environmentId, key, value) => {
    const variable: ApiEnvironmentVariable = {
      id: crypto.randomUUID(),
      environmentId,
      key,
      value,
      initialValue: value,
      isSecret: false,
      description: '',
      enabled: true,
      sortOrder: (get().environmentVariables[environmentId] ?? []).length,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({
      environmentVariables: {
        ...s.environmentVariables,
        [environmentId]: [...(s.environmentVariables[environmentId] ?? []), variable],
      },
    }))
    await window.api.apiSaveEnvironmentVariable(variable)
  },

  updateEnvironmentVariable: async (id, updates) => {
    const allVars = get().environmentVariables
    let envId = ''
    for (const [eid, vars] of Object.entries(allVars)) {
      if (vars.some((v) => v.id === id)) { envId = eid; break }
    }
    if (!envId) return
    const updatedVar = { ...(allVars[envId].find((v) => v.id === id)!), ...updates, updatedAt: now() }
    set((s) => ({
      environmentVariables: {
        ...s.environmentVariables,
        [envId]: s.environmentVariables[envId].map((v) => v.id === id ? updatedVar : v),
      },
    }))
    await window.api.apiSaveEnvironmentVariable(updatedVar)
  },

  removeEnvironmentVariable: async (id, environmentId) => {
    set((s) => ({
      environmentVariables: {
        ...s.environmentVariables,
        [environmentId]: (s.environmentVariables[environmentId] ?? []).filter((v) => v.id !== id),
      },
    }))
    await window.api.apiRemoveEnvironmentVariable(id)
  },

  // ── History ──────────────────────────────────────────────────

  loadHistory: async () => {
    const { activeWorkspaceId } = get()
    const entries = await window.api.apiLoadHistory(activeWorkspaceId, 100, 0)
    set({ history: entries ?? [] })
  },

  clearHistory: async () => {
    const { activeWorkspaceId } = get()
    set({ history: [] })
    await window.api.apiClearHistory(activeWorkspaceId)
  },

  removeHistoryEntry: async (id) => {
    set((s) => ({ history: s.history.filter((h) => h.id !== id) }))
    await window.api.apiRemoveExecution(id)
  },

  // ── Import ───────────────────────────────────────────────────

  importRequest: async (format, input, collectionId, folderId) => {
    const { parseImport } = await import('@/components/APIClient/utils/import-parsers')
    const parsed = await parseImport(format, input)
    const { requests, activeWorkspaceId } = get()
    const siblings = requests.filter((r) =>
      r.collectionId === collectionId && r.folderId === (folderId ?? null)
    )
    const item: ApiRequestItem = {
      id: crypto.randomUUID(),
      workspaceId: activeWorkspaceId,
      collectionId,
      folderId: folderId ?? null,
      name: parsed.name,
      method: parsed.method,
      url: parsed.url,
      params: parsed.params,
      headers: parsed.headers,
      bodyType: parsed.bodyType,
      bodyContent: parsed.bodyContent,
      authType: parsed.authType,
      authData: parsed.authData,
      defaultEnvironmentId: null,
      sortOrder: siblings.length,
      deletedAt: null,
      createdAt: now(),
      updatedAt: now(),
    }
    set((s) => ({ requests: [...s.requests, item] }))
    try {
      await window.api.apiSaveRequest(dehydrateRequest(item))
    } catch (err) {
      console.error('[api-client] Failed to save imported request:', err)
      set((s) => ({ requests: s.requests.filter((r) => r.id !== item.id) }))
      throw err
    }
    return item
  },

  importFromCurl: async (curl, collectionId, folderId) => {
    return get().importRequest('curl', curl, collectionId, folderId)
  },

  importCollection: async (format, raw) => {
    return importCollectionAction(get, format, raw)
  },

  exportCollection: (collectionId) => {
    return exportCollectionAction(get, collectionId)
  },

  exportRequest: (requestId) => {
    return exportRequestAction(get, requestId)
  },
}))
