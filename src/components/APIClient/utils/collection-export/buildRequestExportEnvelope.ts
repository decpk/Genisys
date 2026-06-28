import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { GenisysRequestExport } from './collection-export.types'
import { GENISYS_EXPORT_VERSION } from './collection-export.constants'

/**
 * Wraps a normalized request in a versioned Genisys single-request export
 * envelope, stamped with the current ISO timestamp.
 */
export function buildRequestExportEnvelope(
  request: NormalizedImportRequest,
): GenisysRequestExport {
  return {
    __genisys: 'api-request',
    version: GENISYS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    request,
  }
}
