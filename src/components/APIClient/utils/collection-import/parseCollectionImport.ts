import type {
  CollectionImportFormat,
  NormalizedImportCollection,
} from './collection-import.types'

/**
 * Dispatch raw file text to the correct format parser, returning a
 * normalized collection tree. Parser modules are lazy-loaded so that
 * heavy format-specific code (and the YAML dependency) is only pulled
 * in when actually needed.
 */
export async function parseCollectionImport(
  format: CollectionImportFormat,
  raw: string
): Promise<NormalizedImportCollection> {
  if (format === 'postman') {
    const { parsePostmanCollection } = await import('./postman/parsePostmanCollection')
    return parsePostmanCollection(raw)
  }

  if (format === 'openapi') {
    const { parseOpenApiSpec } = await import('./openapi/parseOpenApiSpec')
    return parseOpenApiSpec(raw)
  }

  if (format === 'genisys') {
    const { parseGenisysExport } = await import('./genisys/parseGenisysExport')
    return parseGenisysExport(raw)
  }

  const { parseInsomniaExport } = await import('./insomnia/parseInsomniaExport')
  return parseInsomniaExport(raw)
}
