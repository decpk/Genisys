import type {
  NormalizedImportCollection,
  NormalizedImportRequest,
} from '@/components/APIClient/utils/collection-import/collection-import.types'

// ─── Genisys native export envelope kinds ──────────────────────────

export type GenisysExportKind = 'api-collection' | 'api-request'

// ─── Collection export envelope ──────────────────────────────────

export interface GenisysCollectionExport {
  __genisys: 'api-collection'
  version: number
  exportedAt: string
  collection: NormalizedImportCollection
}

// ─── Single-request export envelope ──────────────────────────────

export interface GenisysRequestExport {
  __genisys: 'api-request'
  version: number
  exportedAt: string
  request: NormalizedImportRequest
}

// ─── Union of all Genisys export envelopes ─────────────────────────

export type GenisysExportEnvelope = GenisysCollectionExport | GenisysRequestExport
