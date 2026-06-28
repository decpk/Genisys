import type {
  CollectionImportFormat,
  CollectionImportFormatMeta,
} from './collection-import.types'

/**
 * Display metadata for each supported bulk-import format.
 * Consumed by the ImportCollectionDialog format picker.
 */
export const COLLECTION_IMPORT_FORMATS: CollectionImportFormatMeta[] = [
  {
    key: 'postman',
    label: 'Postman',
    description: 'Postman Collection v2.1 (.json)',
    fileExtensions: ['.json'],
  },
  {
    key: 'openapi',
    label: 'OpenAPI / Swagger',
    description: 'OpenAPI 3.x spec (.json, .yaml, .yml)',
    fileExtensions: ['.json', '.yaml', '.yml'],
  },
  {
    key: 'insomnia',
    label: 'Insomnia',
    description: 'Insomnia v4 export (.json)',
    fileExtensions: ['.json'],
  },
  {
    key: 'genisys',
    label: 'Genisys',
    description: 'Genisys native export (.genisys.json)',
    fileExtensions: ['.json'],
  },
]

export const COLLECTION_IMPORT_FORMAT_KEYS: CollectionImportFormat[] =
  COLLECTION_IMPORT_FORMATS.map((f) => f.key)
