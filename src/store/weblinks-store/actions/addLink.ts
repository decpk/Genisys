import type {
  WebLinksStoreState,
  WebLinksStoreActions,
  SavedPreview,
} from '@/components/WebLinks/WebLinks.types'
import { fetchLinkPreview } from '@/components/WebLinks/api/fetchLinkPreview'
import { normalizeUrl } from '@/components/WebLinks/utils/normalizeUrl'

/**
 * Quick-add: normalize a URL, fetch its link metadata, and persist it straight
 * into the collection (optionally under a folder). Returns the saved item.
 *
 * Throws on an invalid URL or a failed metadata fetch so the caller can surface
 * the message to the user.
 */
export async function addLinkAction(
  get: () => WebLinksStoreState & WebLinksStoreActions,
  url: string,
  folderId: string | null,
): Promise<SavedPreview> {
  const normalized = normalizeUrl(url)
  if (!normalized) {
    throw new Error('Please enter a valid URL (e.g. example.com).')
  }
  const preview = await fetchLinkPreview(normalized)
  return get().savePreview(preview, folderId)
}
