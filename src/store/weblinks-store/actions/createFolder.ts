import type {
  PreviewFolder,
  WebLinksStoreActions,
  WebLinksStoreState,
} from '@/components/WebLinks/WebLinks.types'
import { saveFolder } from '@/components/WebLinks/api/saveFolder'

/**
 * Create a folder, persist it, append it to the store, and return it. The new
 * folder is ordered after all existing siblings.
 */
export async function createFolderAction(
  set: (partial: Partial<WebLinksStoreState>) => void,
  get: () => WebLinksStoreState & WebLinksStoreActions,
  name: string,
  color = '',
  parentId: string | null = null,
): Promise<PreviewFolder> {
  const folders = get().folders
  const folder: PreviewFolder = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled folder',
    color,
    parentId,
    sortOrder: folders.length,
    createdAt: new Date().toISOString(),
  }
  await saveFolder(folder)
  set({ folders: [...folders, folder] })
  return folder
}
