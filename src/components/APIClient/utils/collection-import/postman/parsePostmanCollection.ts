import type {
  NormalizedImportCollection,
} from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { PostmanCollection } from './postman.types'
import { extractPostmanDescription } from './extractPostmanDescription'
import { mapPostmanItems } from './mapPostmanItems'
import { mapPostmanVariables } from './mapPostmanVariables'

/**
 * Parse raw Postman Collection v2.1 JSON text into a
 * `NormalizedImportCollection`. This is the only function in this module that
 * is allowed to throw — on invalid JSON or a non-Postman payload.
 */
export function parsePostmanCollection(raw: string): NormalizedImportCollection {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Invalid Postman collection: the file is not valid JSON.')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid Postman collection: expected a JSON object.')
  }

  const collection = parsed as PostmanCollection

  if (!collection.info || !Array.isArray(collection.item)) {
    throw new Error(
      'Invalid Postman collection: missing the "info" object or "item" array.',
    )
  }

  const name = collection.info.name?.trim() || 'Imported Collection'

  return {
    name,
    description: extractPostmanDescription(collection.info.description),
    requests: mapPostmanItems(collection.item, []),
    variables: mapPostmanVariables(collection.variable),
  }
}
