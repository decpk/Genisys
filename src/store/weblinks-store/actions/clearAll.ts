import type { WebLinksStoreState } from '@/components/WebLinks/WebLinks.types'
import { clearAllWebLinks } from '@/components/WebLinks/api/clearAll'

/**
 * Delete every saved preview and folder, then reset the collection state. The
 * sidebar selection falls back to `all` since any selected folder is now gone.
 */
export async function clearAllAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
): Promise<void> {
  await clearAllWebLinks()
  set({ previews: [], folders: [], selectedFolder: 'all' })
}
