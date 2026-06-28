import type { GenisysExportEnvelope } from './collection-export.types'

/**
 * Serializes a Genisys export envelope to a pretty-printed JSON string.
 */
export function stringifyExportEnvelope(envelope: GenisysExportEnvelope): string {
  return JSON.stringify(envelope, null, 2)
}
