export interface MockProject {
  id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface MockServer {
  id: string
  project_id: string
  name: string
  port: number
  created_at: string
  updated_at: string
}

export interface MockEndpoint {
  id: string
  server_id: string
  method: string
  path: string
  status_code: number
  response_headers: string
  response_body: string
  response_type: 'static' | 'ai'
  ai_prompt: string
  ai_schema: string
  ai_count: number
  delay_ms: number
  description: string
  is_active: boolean
  variant_mode: string
  ai_mode: 'live' | 'cached' | 'pool'
  ai_cache_ttl_ms: number
  ai_pool_size: number
  created_at: string
  updated_at: string
}

export type VariantMode = 'single' | 'sequence' | 'conditional' | 'random'

export interface MockEndpointVariant {
  id: string
  endpoint_id: string
  name: string
  status_code: number
  response_headers: string
  response_body: string
  match_rules: string
  weight: number
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RunningServerInfo {
  server_id: string
  port: number
  name: string
}

export interface RequestLogEntry {
  id?: string
  server_id: string
  method: string
  path: string
  status: number
  timestamp: string
  duration_ms: number
  request_headers?: Record<string, string>
  request_body?: string
  query_string?: string
  response_headers?: Record<string, string>
  response_body?: string
}

export interface MockServerStoreState {
  projects: MockProject[]
  servers: MockServer[]
  selectedServerId: string | null
  selectedEndpointId: string | null
  endpoints: Record<string, MockEndpoint[]>
  /** Active variants keyed by endpoint id. */
  variants: Record<string, MockEndpointVariant[]>
  runningServers: RunningServerInfo[]
  requestLogs: RequestLogEntry[]
  isLoaded: boolean
  isGenerating: boolean
  openEndpointTabs: string[]
  activeEndpointTabId: string | null
  /** Tab id awaiting a close-confirmation dialog, or null when none is pending. */
  pendingCloseTabId: string | null
}

export interface MockServerStoreActions {
  loadProjects: () => Promise<void>
  createProject: (name: string, color: string) => Promise<void>
  updateProject: (id: string, name: string, color: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  loadServers: () => Promise<void>
  createServer: (projectId: string, name: string, port: number) => Promise<void>
  updateServer: (id: string, name: string, port: number, projectId: string) => Promise<void>
  deleteServer: (id: string) => Promise<void>
  duplicateServer: (id: string) => Promise<void>
  startServer: (serverId: string) => Promise<{ success: boolean; error?: string; suggested_port?: number }>
  stopServer: (serverId: string) => Promise<void>
  stopAllServers: () => Promise<number>
  loadEndpoints: (serverId: string) => Promise<void>
  createEndpoint: (
    params: Omit<
      MockEndpoint,
      'id' | 'created_at' | 'updated_at' | 'variant_mode' | 'ai_mode' | 'ai_cache_ttl_ms' | 'ai_pool_size'
    >
  ) => Promise<MockEndpoint | null>
  updateEndpoint: (params: MockEndpoint) => Promise<void>
  deleteEndpoint: (id: string) => Promise<void>
  duplicateEndpoint: (id: string) => Promise<void>
  loadVariants: (endpointId: string) => Promise<void>
  createVariant: (params: {
    endpointId: string
    name?: string
    statusCode?: number
    responseHeaders?: string
    responseBody?: string
    matchRules?: string
    weight?: number
    orderIndex?: number
    isActive?: boolean
  }) => Promise<MockEndpointVariant | null>
  updateVariant: (params: {
    id: string
    endpointId: string
    name?: string
    statusCode?: number
    responseHeaders?: string
    responseBody?: string
    matchRules?: string
    weight?: number
    orderIndex?: number
    isActive?: boolean
  }) => Promise<void>
  deleteVariant: (id: string, endpointId: string) => Promise<void>
  setSelectedServerId: (id: string | null) => void
  setSelectedEndpointId: (id: string | null) => void
  openEndpointTab: (id: string) => void
  closeEndpointTab: (id: string) => void
  /** Ask for confirmation before closing a tab (used by the close icon and Cmd/Ctrl+W). */
  requestCloseEndpointTab: (id: string) => void
  /** Confirm the pending close: stop the server if running, then close the tab. */
  confirmCloseEndpointTab: () => void
  /** Dismiss the pending close request without closing. */
  cancelCloseEndpointTab: () => void
  setActiveEndpointTab: (id: string | null) => void
  reorderEndpointTabs: (ids: string[]) => void
  refreshRunningServers: () => Promise<void>
  addRequestLog: (log: RequestLogEntry) => void
  clearLogs: () => void
  loadRequestLogs: (params: {
    serverId: string
    method?: string
    status?: number
    pathContains?: string
    limit?: number
  }) => Promise<void>
  clearRequestLogsPersisted: (serverId: string) => Promise<void>
  exportRequestLogs: (serverId: string) => Promise<string>
}
