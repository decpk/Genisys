import type {
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { removePreview } from '@/components/WebLinks/api/removePreview'

/** Delete a saved preview, then drop it from the store. */
export async function deletePreviewAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  previewId: string,
): Promise<void> {
  await removePreview(previewId)
  set({ previews: get().previews.filter((p) => p.id !== previewId) })
}
