import type { NormalizedImportCollection } from '../collection-import.types'
import type {
  GenisysCollectionExport,
  GenisysRequestExport,
} from '../../collection-export/collection-export.types'

/**
 * Parses a Genisys native export file (produced by the API Client export
 * feature) into a normalized collection. An `api-collection` envelope is
 * returned as-is; an `api-request` envelope is wrapped into a single-request
 * collection placed at the root.
 */
export function parseGenisysExport(raw: string): NormalizedImportCollection {
  let parsed: GenisysCollectionExport | GenisysRequestExport
  try {
    parsed = JSON.parse(raw) as GenisysCollectionExport | GenisysRequestExport
  } catch {
    throw new Error('Invalid Genisys export file: not valid JSON.')
  }

  if (parsed.__genisys === 'api-collection') {
    return parsed.collection
  }

  if (parsed.__genisys === 'api-request') {
    const request = parsed.request
    return {
      name: request.name || 'Imported Request',
      description: '',
      requests: [{ ...request, folderPath: [] }],
      variables: [],
    }
  }

  throw new Error('Invalid Genisys export file: unrecognized envelope.')
}
