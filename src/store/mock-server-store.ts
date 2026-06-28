import { create } from 'zustand'
import type {
  MockServerStoreState,
  MockServerStoreActions,
  RequestLogEntry,
} from '@/components/MockServer/MockServer.types'
import { loadProjectsAction } from './mock-server-store/actions/loadProjects'
import { createProjectAction } from './mock-server-store/actions/createProject'
import { updateProjectAction } from './mock-server-store/actions/updateProject'
import { deleteProjectAction } from './mock-server-store/actions/deleteProject'
import { loadServersAction } from './mock-server-store/actions/loadServers'
import { createServerAction } from './mock-server-store/actions/createServer'
import { updateServerAction } from './mock-server-store/actions/updateServer'
import { deleteServerAction } from './mock-server-store/actions/deleteServer'
import { duplicateServerAction } from './mock-server-store/actions/duplicateServer'
import { startServerAction } from './mock-server-store/actions/startServer'
import { stopServerAction } from './mock-server-store/actions/stopServer'
import { stopAllServersAction } from './mock-server-store/actions/stopAllServers'
import { loadEndpointsAction } from './mock-server-store/actions/loadEndpoints'
import { createEndpointAction } from './mock-server-store/actions/createEndpoint'
import { updateEndpointAction } from './mock-server-store/actions/updateEndpoint'
import { deleteEndpointAction } from './mock-server-store/actions/deleteEndpoint'
import { duplicateEndpointAction } from './mock-server-store/actions/duplicateEndpoint'
import { loadVariantsAction } from './mock-server-store/actions/loadVariants'
import { createVariantAction } from './mock-server-store/actions/createVariant'
import { updateVariantAction } from './mock-server-store/actions/updateVariant'
import { deleteVariantAction } from './mock-server-store/actions/deleteVariant'
import { refreshRunningServersAction } from './mock-server-store/actions/refreshRunningServers'
import { loadRequestLogsAction } from './mock-server-store/actions/loadRequestLogs'
import { clearRequestLogsPersistedAction } from './mock-server-store/actions/clearRequestLogsPersisted'
import { exportRequestLogsAction } from './mock-server-store/actions/exportRequestLogs'

/** Upper bound on retained request logs to prevent unbounded memory growth
 *  during long sessions with many proxied requests. Oldest entries are
 *  dropped first. Users can still call `clearLogs` to wipe everything. */
const MAX_REQUEST_LOGS = 500

/**
 * localStorage persistence for the "last opened" selection so the main panel
 * reopens the same server/endpoint after relaunch. All access is wrapped in
 * try/catch — storage may be unavailable or full.
 */
const LAST_SERVER_KEY = 'genisys:mockServer:lastServerId:v1'
const LAST_ENDPOINT_KEY = 'genisys:mockServer:lastEndpointId:v1'

function writePersistedId(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* noop — storage may be full or unavailable */
  }
}

function readPersistedId(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function persistSelectedServerId(id: string | null): void {
  writePersistedId(LAST_SERVER_KEY, id)
}

export function readSelectedServerId(): string | null {
  return readPersistedId(LAST_SERVER_KEY)
}

export function persistActiveEndpointId(id: string | null): void {
  writePersistedId(LAST_ENDPOINT_KEY, id)
}

export function readActiveEndpointId(): string | null {
  return readPersistedId(LAST_ENDPOINT_KEY)
}

export const useMockServerStore = create<MockServerStoreState & MockServerStoreActions>()(
  (set, get) => ({
    // State
    projects: [],
    servers: [],
    selectedServerId: null,
    selectedEndpointId: null,
    endpoints: {},
    variants: {},
    runningServers: [],
    requestLogs: [],
    isLoaded: false,
    isGenerating: false,
    openEndpointTabs: [],
    activeEndpointTabId: null,
    pendingCloseTabId: null,

    // Actions - thin wrappers
    loadProjects: () => loadProjectsAction(set),
    createProject: (name, color) => createProjectAction(set, get, name, color),
    updateProject: (id, name, color) => updateProjectAction(set, get, id, name, color),
    deleteProject: (id) => deleteProjectAction(set, get, id),
    loadServers: () => loadServersAction(set),
    createServer: (projectId, name, port) => createServerAction(set, get, projectId, name, port),
    updateServer: (id, name, port, projectId) =>
      updateServerAction(set, get, id, name, port, projectId),
    duplicateServer: (id) => duplicateServerAction(set, get, id),
    deleteServer: (id) => deleteServerAction(set, get, id),
    startServer: (serverId) => startServerAction(get, serverId),
    stopServer: (serverId) => stopServerAction(get, serverId),
    stopAllServers: () => stopAllServersAction(set),
    loadEndpoints: (serverId) => loadEndpointsAction(set, get, serverId),
    createEndpoint: (params) => createEndpointAction(set, get, params),
    updateEndpoint: (params) => updateEndpointAction(set, get, params),
    deleteEndpoint: (id) => deleteEndpointAction(set, get, id),
    duplicateEndpoint: (id) => duplicateEndpointAction(set, get, id),
    loadVariants: (endpointId) => loadVariantsAction(set, get, endpointId),
    createVariant: (params) => createVariantAction(set, get, params),
    updateVariant: (params) => updateVariantAction(set, get, params),
    deleteVariant: (id, endpointId) => deleteVariantAction(set, get, id, endpointId),
    setSelectedServerId: (id) => {
      persistSelectedServerId(id)
      set({ selectedServerId: id })
    },
    setSelectedEndpointId: (id) => set({ selectedEndpointId: id }),
    openEndpointTab: (id) => {
      const { openEndpointTabs } = get()
      if (!openEndpointTabs.includes(id)) {
        set({ openEndpointTabs: [...openEndpointTabs, id] })
      }
      persistActiveEndpointId(id)
      set({ activeEndpointTabId: id, selectedEndpointId: id })
    },
    closeEndpointTab: (id) => {
      const { openEndpointTabs, activeEndpointTabId } = get()
      const idx = openEndpointTabs.indexOf(id)
      const next = openEndpointTabs.filter((t) => t !== id)
      let newActive = activeEndpointTabId
      if (activeEndpointTabId === id) {
        newActive = next[Math.min(idx, next.length - 1)] ?? null
      }
      persistActiveEndpointId(newActive)
      set({
        openEndpointTabs: next,
        activeEndpointTabId: newActive,
        selectedEndpointId: newActive,
      })
    },
    setActiveEndpointTab: (id) => {
      persistActiveEndpointId(id)
      set({ activeEndpointTabId: id, selectedEndpointId: id })
    },
    requestCloseEndpointTab: (id) => set({ pendingCloseTabId: id }),
    cancelCloseEndpointTab: () => set({ pendingCloseTabId: null }),
    confirmCloseEndpointTab: () => {
      const { pendingCloseTabId, selectedServerId, runningServers, stopServer, closeEndpointTab } = get()
      if (!pendingCloseTabId) return
      if (selectedServerId && runningServers.some((s) => s.server_id === selectedServerId)) {
        void stopServer(selectedServerId)
      }
      closeEndpointTab(pendingCloseTabId)
      set({ pendingCloseTabId: null })
    },
    reorderEndpointTabs: (ids) => set({ openEndpointTabs: ids }),
    refreshRunningServers: () => refreshRunningServersAction(set),
    addRequestLog: (log: RequestLogEntry) =>
      set({ requestLogs: [...get().requestLogs, log].slice(-MAX_REQUEST_LOGS) }),
    clearLogs: () => set({ requestLogs: [] }),
    loadRequestLogs: (params) => loadRequestLogsAction(set, get, params),
    clearRequestLogsPersisted: (serverId) =>
      clearRequestLogsPersistedAction(set, get, serverId),
    exportRequestLogs: (serverId) => exportRequestLogsAction(serverId),
  })
)
