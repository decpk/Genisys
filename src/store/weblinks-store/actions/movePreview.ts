import type {
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { savePreview } from '@/components/WebLinks/api/savePreview'

/**
 * Move a saved preview into a folder (or unfiled when null). Upserts the full
 * record so the move persists, then updates the store.
 */
export async function movePreviewAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  previewId: string,
  folderId: string | null,
): Promise<void> {
  const previews = get().previews
  const target = previews.find((p) => p.id === previewId)
  if (!target) return

  const updated = { ...target, folderId }
  await savePreview(updated)
  set({ previews: previews.map((p) => (p.id === previewId ? updated : p)) })
}
