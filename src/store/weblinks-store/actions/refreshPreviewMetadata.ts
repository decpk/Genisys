import type {
  WebLinksStoreState,
  WebLinksStoreActions,
  SavedPreview,
} from '@/components/WebLinks/WebLinks.types'
import { fetchLinkPreview } from '@/components/WebLinks/api/fetchLinkPreview'
import { savePreview } from '@/components/WebLinks/api/savePreview'

/**
 * Re-fetch live metadata (title, favicon, og:image, theme color, …) for an
 * already-saved preview and persist the refreshed copy in place.
 *
 * Identity and user-owned fields (`id`, `folderId`, the original `url`, `notes`,
 * `sortOrder`, `createdAt`) are preserved. Returns the updated preview, or null
 * when the id is unknown. Throws when the metadata fetch fails so the caller can
 * surface it.
 */
export async function refreshPreviewMetadataAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  previewId: string,
): Promise<SavedPreview | null> {
  const existing = get().previews.find((p) => p.id === previewId)
  if (!existing) return null

  const fresh = await fetchLinkPreview(existing.url || existing.finalUrl)
  const updated: SavedPreview = {
    ...existing,
    finalUrl: fresh.finalUrl,
    title: fresh.title,
    description: fresh.description,
    siteName: fresh.siteName,
    faviconUrl: fresh.faviconUrl,
    imageUrl: fresh.imageUrl,
    themeColor: fresh.themeColor,
    embeddable: fresh.embeddable,
  }
  await savePreview(updated)
  set({ previews: get().previews.map((p) => (p.id === previewId ? updated : p)) })
  return updated
}
