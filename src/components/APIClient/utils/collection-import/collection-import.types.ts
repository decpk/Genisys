import type {
  HttpMethod,
  BodyType,
  AuthType,
  AuthData,
  KeyValuePair,
} from '../../APIClient.types'

// ─── Supported bulk-import source formats ────────────────────────

export type CollectionImportFormat = 'postman' | 'openapi' | 'insomnia' | 'genisys'

// ─── Normalized request (one endpoint inside an imported collection) ─

export interface NormalizedImportRequest {
  name: string
  method: HttpMethod
  url: string
  params: KeyValuePair[]
  headers: KeyValuePair[]
  bodyType: BodyType
  bodyContent: string
  authType: AuthType
  authData: AuthData
  /**
   * Folder names from the collection root down to this request's parent.
   * Empty array means the request lives at the collection root.
   */
  folderPath: string[]
}

// ─── Normalized collection-level variable (mapped to an environment) ─

export interface NormalizedImportVariable {
  key: string
  value: string
}

// ─── Normalized collection (parser output / store-action input) ──

export interface NormalizedImportCollection {
  name: string
  description: string
  requests: NormalizedImportRequest[]
  variables: NormalizedImportVariable[]
}

// ─── Per-format display metadata for the import UI ───────────────

export interface CollectionImportFormatMeta {
  key: CollectionImportFormat
  label: string
  description: string
  fileExtensions: string[]
}

// ─── Result returned to the UI after a successful import ─────────

export interface CollectionImportResult {
  collectionId: string
  collectionName: string
  requestCount: number
  folderCount: number
  variableCount: number
}
