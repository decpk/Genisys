import type {
  LinkPreview,
  SavedPreview,
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { savePreview } from '@/components/WebLinks/api/savePreview'

/**
 * Persist a fetched `LinkPreview` into the collection (optionally under a
 * folder), append it to the store, and return the created `SavedPreview`.
 */
export async function savePreviewAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  preview: LinkPreview,
  folderId: string | null,
): Promise<SavedPreview> {
  const previews = get().previews
  const saved: SavedPreview = {
    id: crypto.randomUUID(),
    folderId,
    url: preview.url,
    finalUrl: preview.finalUrl,
    title: preview.title,
    description: preview.description,
    siteName: preview.siteName,
    faviconUrl: preview.faviconUrl,
    imageUrl: preview.imageUrl,
    themeColor: preview.themeColor,
    embeddable: preview.embeddable,
    notes: '',
    sortOrder: previews.length,
    createdAt: new Date().toISOString(),
  }
  await savePreview(saved)
  set({ previews: [...previews, saved] })
  return saved
}
