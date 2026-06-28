import type { ApiClientStore } from '../../api-client-store'
import type { GenisysRequestExport } from '@/components/APIClient/utils/collection-export/collection-export.types'
import { buildFolderPathMap } from '@/components/APIClient/utils/collection-export/buildFolderPathMap'
import { serializeRequest } from '@/components/APIClient/utils/collection-export/serializeRequest'
import { buildRequestExportEnvelope } from '@/components/APIClient/utils/collection-export/buildRequestExportEnvelope'

/**
 * Builds a Genisys native export envelope for a single request, resolving its
 * folder path within its owning collection from the current store state.
 */
export function exportRequestAction(
  get: () => ApiClientStore,
  requestId: string
): GenisysRequestExport {
  const { requests, folders } = get()

  const request = requests.find((r) => r.id === requestId)
  if (!request) {
    throw new Error('Request not found.')
  }

  const collectionFolders = folders.filter((f) => f.collectionId === request.collectionId)
  const folderPathMap = buildFolderPathMap(collectionFolders)

  const normalized = serializeRequest(request, folderPathMap)
  return buildRequestExportEnvelope(normalized)
}
