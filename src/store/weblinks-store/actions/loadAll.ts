import type { WebLinksStoreState } from '@/components/WebLinks/WebLinks.types'
import { loadWebLinksData } from '@/components/WebLinks/api/loadWebLinksData'

/**
 * Load all folders + saved previews from the backend into the store. Marks
 * `isLoaded` even on failure so the UI exits its loading state and shows an
 * (empty) collection rather than hanging.
 */
export async function loadAllAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
): Promise<void> {
  try {
    const { folders, previews } = await loadWebLinksData()
    set({ folders, previews, isLoaded: true })
  } catch (err) {
    console.error('[weblinks] loadAll failed:', err)
    set({ isLoaded: true })
  }
}
