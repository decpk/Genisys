// ─── HTTP Method ─────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

// ─── Key-Value Pair ──────────────────────────────────────────────

export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
}

// ─── Request Body ────────────────────────────────────────────────

export type BodyType = 'none' | 'json' | 'raw' | 'form-data' | 'xml'

// ─── Auth ────────────────────────────────────────────────────────

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key'

export interface AuthData {
  token?: string
  username?: string
  password?: string
  key?: string
  value?: string
  addTo?: 'header' | 'query'
}

// ─── Workspace ───────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  description: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ─── Collection ──────────────────────────────────────────────────

export interface ApiCollection {
  id: string
  workspaceId: string
  name: string
  description: string
  color: string
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Folder ──────────────────────────────────────────────────────

export interface ApiFolder {
  id: string
  workspaceId: string
  collectionId: string
  parentFolderId: string | null
  name: string
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Request (from DB — params/headers/auth as JSON strings) ─────

export interface ApiRequestRaw {
  id: string
  workspaceId: string
  collectionId: string
  folderId: string | null
  name: string
  method: string
  url: string
  params: string
  headers: string
  bodyType: string
  bodyContent: string
  authType: string
  authData: string
  defaultEnvironmentId: string | null
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Request (hydrated for UI) ───────────────────────────────────

export interface ApiRequestItem {
  id: string
  workspaceId: string
  collectionId: string
  folderId: string | null
  name: string
  method: HttpMethod
  url: string
  params: KeyValuePair[]
  headers: KeyValuePair[]
  bodyType: BodyType
  bodyContent: string
  authType: AuthType
  authData: AuthData
  defaultEnvironmentId: string | null
  sortOrder: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Response (runtime only, not persisted) ──────────────────────

export interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  time: number
  size: number
  executionId?: string
  /** True when the request was cancelled by the user mid-flight. */
  cancelled?: boolean
}

// ─── Environment ─────────────────────────────────────────────────

export interface ApiEnvironment {
  id: string
  workspaceId: string
  name: string
  baseUrl: string
  description: string
  color: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// ─── Environment Variable ────────────────────────────────────────

export interface ApiEnvironmentVariable {
  id: string
  environmentId: string
  key: string
  value: string
  initialValue: string
  isSecret: boolean
  description: string
  enabled: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// ─── History Entry (lightweight) ─────────────────────────────────

export interface ApiHistoryEntry {
  id: string
  requestId: string | null
  name: string
  method: string
  url: string
  status: string
  statusCode: number
  durationMs: number
  sizeBytes: number
  executedAt: string
  environmentName: string | null
}

// ─── Execution Response (full) ───────────────────────────────────

export interface ApiExecutionResponse {
  id: string
  executionId: string
  statusCode: number
  statusText: string
  headers: string
  body: string
  bodyStorageType: string
  blobPath: string | null
  sizeBytes: number
  timingTotalMs: number
  timingDnsMs: number | null
  timingConnectMs: number | null
  timingTlsMs: number | null
  timingTtfbMs: number | null
  timingDownloadMs: number | null
  receivedAt: string
  createdAt: string
}

// ─── Cookie Jar ──────────────────────────────────────────────────

export interface ApiCookieJar {
  id: string
  workspaceId: string
  environmentId: string | null
  name: string
  createdAt: string
  updatedAt: string
}

// ─── Cookie ──────────────────────────────────────────────────────

export interface ApiCookie {
  id: string
  jarId: string
  name: string
  value: string
  domain: string
  path: string
  secure: boolean
  httpOnly: boolean
  sameSite: string
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

// ─── Response Snapshot ───────────────────────────────────────────

export interface ApiResponseSnapshot {
  id: string
  executionId: string
  requestId: string | null
  label: string
  snapshotType: string
  statusCode: number
  statusText: string
  headers: string
  body: string
  sizeBytes: number
  createdAt: string
}

// ─── Saved Example / Mock ────────────────────────────────────────

export interface ApiSavedExample {
  id: string
  requestId: string | null
  executionId: string | null
  name: string
  description: string
  statusCode: number
  headers: string
  body: string
  createdAt: string
  updatedAt: string
}

// ─── Batch load result ───────────────────────────────────────────

export interface ApiClientData {
  collections: ApiCollection[]
  folders: ApiFolder[]
  requests: ApiRequestRaw[]
  environments: ApiEnvironment[]
  activeEnvironmentId: string | null
  workspaces: Workspace[]
}

// ─── Request Analytics ───────────────────────────────────────────

export type AnalyticsRange = '1d' | '3d' | '5d' | '7d' | '30d'

export interface ApiAnalyticsPoint {
  id: string
  executedAt: string
  method: string
  status: string
  statusCode: number
  durationMs: number
  sizeBytes: number
  timingDnsMs: number | null
  timingConnectMs: number | null
  timingTlsMs: number | null
  timingTtfbMs: number | null
  timingDownloadMs: number | null
}
