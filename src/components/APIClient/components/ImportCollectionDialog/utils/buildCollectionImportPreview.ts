import { detectCollectionFormat } from '../../../utils/collection-import/detectCollectionFormat'
import { parseCollectionImport } from '../../../utils/collection-import/parseCollectionImport'
import type { CollectionImportPreviewData } from '../ImportCollectionDialog.types'
import { countImportFolders } from './countImportFolders'

/**
 * Detects the source format of raw collection text, parses it into a
 * normalized collection, and derives the folder count for the preview UI.
 * Throws when the format is unrecognized or parsing fails.
 */
export async function buildCollectionImportPreview(
  raw: string,
): Promise<CollectionImportPreviewData> {
  const format = detectCollectionFormat(raw)
  if (!format) {
    throw new Error(
      'Unrecognized format. Provide a Postman, OpenAPI, or Insomnia collection.',
    )
  }

  const collection = await parseCollectionImport(format, raw)
  const folderCount = countImportFolders(collection.requests)

  return { format, collection, folderCount }
}
