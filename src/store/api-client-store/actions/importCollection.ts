import type { ApiClientStore } from '../../api-client-store'
import type {
  CollectionImportFormat,
  CollectionImportResult,
} from '@/components/APIClient/utils/collection-import/collection-import.types'
import { parseCollectionImport } from '@/components/APIClient/utils/collection-import/parseCollectionImport'
import { buildImportFolders } from './buildImportFolders'
import { applyImportedRequests } from './applyImportedRequests'
import { applyImportedVariables } from './applyImportedVariables'

/**
 * Bulk-imports a whole collection (Postman / OpenAPI / Insomnia) into the
 * active workspace: parses the raw file, creates the collection, its folder
 * tree, every request, and an environment for collection-level variables.
 * Reuses the store's existing CRUD actions so persistence stays consistent.
 */
export async function importCollectionAction(
  get: () => ApiClientStore,
  format: CollectionImportFormat,
  raw: string
): Promise<CollectionImportResult> {
  const parsed = await parseCollectionImport(format, raw)

  const collection = await get().addCollection(parsed.name)
  if (parsed.description) {
    await get().updateCollection(collection.id, { description: parsed.description })
  }

  const folderIdByPath = await buildImportFolders(get, collection.id, parsed.requests)
  const requestCount = await applyImportedRequests(get, collection.id, parsed.requests, folderIdByPath)
  const variableCount = await applyImportedVariables(get, parsed.name, parsed.variables)

  return {
    collectionId: collection.id,
    collectionName: parsed.name,
    requestCount,
    folderCount: folderIdByPath.size,
    variableCount,
  }
}
