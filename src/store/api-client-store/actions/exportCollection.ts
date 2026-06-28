import type { ApiClientStore } from '../../api-client-store'
import type { GenisysCollectionExport } from '@/components/APIClient/utils/collection-export/collection-export.types'
import { serializeCollection } from '@/components/APIClient/utils/collection-export/serializeCollection'
import { buildCollectionExportEnvelope } from '@/components/APIClient/utils/collection-export/buildCollectionExportEnvelope'

/**
 * Builds a Genisys native export envelope for a whole collection (its folder
 * tree and every request) from the current store state. Collection-level
 * variables are not exported in v1 since they are not bound to a collection
 * in the data model.
 */
export function exportCollectionAction(
  get: () => ApiClientStore,
  collectionId: string
): GenisysCollectionExport {
  const { collections, folders, requests } = get()

  const collection = collections.find((c) => c.id === collectionId)
  if (!collection) {
    throw new Error('Collection not found.')
  }

  const collectionFolders = folders.filter((f) => f.collectionId === collectionId)
  const collectionRequests = requests.filter((r) => r.collectionId === collectionId)

  const normalized = serializeCollection(collection, collectionFolders, collectionRequests, [])
  return buildCollectionExportEnvelope(normalized)
}
