import type { CollectionImportFormat } from './collection-import.types'

/**
 * Best-effort detection of a bulk-import source format from raw file text.
 * Returns null when the content does not look like any supported format.
 */
export function detectCollectionFormat(raw: string): CollectionImportFormat | null {
  const trimmed = raw.trimStart()
  if (!trimmed) return null

  // JSON-based formats: inspect well-known marker fields.
  if (trimmed.startsWith('{')) {
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(trimmed) as Record<string, unknown>
    } catch {
      return null
    }

    // Genisys native export envelope (highest-priority marker).
    if (parsed.__genisys === 'api-collection' || parsed.__genisys === 'api-request') {
      return 'genisys'
    }

    const info = parsed.info as Record<string, unknown> | undefined
    const schema = typeof info?.schema === 'string' ? info.schema : ''
    if (schema.includes('schema.getpostman.com') || Array.isArray(parsed.item)) {
      return 'postman'
    }

    const exportFormat = parsed.__export_format
    if (exportFormat != null || parsed._type === 'export') {
      return 'insomnia'
    }

    if (typeof parsed.openapi === 'string' || parsed.swagger != null) {
      return 'openapi'
    }

    return null
  }

  // Non-JSON text is treated as a YAML OpenAPI spec.
  if (/^openapi\s*:/m.test(trimmed) || /^swagger\s*:/m.test(trimmed)) {
    return 'openapi'
  }

  return null
}
