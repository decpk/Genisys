import type { NormalizedImportCollection } from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { GenisysCollectionExport } from './collection-export.types'
import { GENISYS_EXPORT_VERSION } from './collection-export.constants'

/**
 * Wraps a normalized collection in a versioned Genisys collection export
 * envelope, stamped with the current ISO timestamp.
 */
export function buildCollectionExportEnvelope(
  collection: NormalizedImportCollection,
): GenisysCollectionExport {
  return {
    __genisys: 'api-collection',
    version: GENISYS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    collection,
  }
}
