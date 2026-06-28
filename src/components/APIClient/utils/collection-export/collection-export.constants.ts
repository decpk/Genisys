import type { GenisysExportKind } from './collection-export.types'

/** Marker field name embedded in every Genisys export envelope. */
export const GENISYS_EXPORT_MARKER = '__genisys' as const

/** Envelope kind for a full-collection export. */
export const GENISYS_EXPORT_KIND_COLLECTION: GenisysExportKind = 'api-collection'

/** Envelope kind for a single-request export. */
export const GENISYS_EXPORT_KIND_REQUEST: GenisysExportKind = 'api-request'

/** Current schema version written into every export envelope. */
export const GENISYS_EXPORT_VERSION = 1

/** File extension used for Genisys native export files. */
export const GENISYS_EXPORT_EXTENSION = 'genisys.json'
